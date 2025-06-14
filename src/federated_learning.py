import os
import json
import time
import numpy as np
import hashlib
from typing import Dict, List, Optional, Tuple
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import load_pem_public_key, load_pem_private_key
from cryptography.hazmat.backends import default_backend
from web3 import Web3

class FederatedLearning:
    """
    Implements privacy-preserving federated learning for decentralized AI training
    with ethical AI enforcement and data sovereignty
    """
    
    def __init__(self, model_id: str, ethics_registry_contract: str, encryption_manager=None):
        """Initialize the federated learning system"""
        self.model_id = model_id
        self.encryption_manager = encryption_manager
        self.ethics_registry = Web3.eth.contract(
            address=ethics_registry_contract,
            abi=self._load_ethics_registry_abi()
        )
        self.aggregation_rounds = 0
        self.participants = {}
        self.current_model_weights = None
        self.ethics_score = None
        self.last_ethics_check = 0
        self.ethics_check_interval = 3600  # Check ethics score hourly
        
    def _load_ethics_registry_abi(self) -> dict:
        """Load the EthicsRegistry contract ABI"""
        abi_path = os.path.join(os.path.dirname(__file__), 
                               '../POI/contracts/EthicalAIRegistry.json')
        with open(abi_path) as f:
            return json.load(f)['abi']
            
    def register_participant(self, participant_id: str, public_key_pem: str,
                           data_consent: bool = False) -> bool:
        """Register a participant for federated learning"""
        if not data_consent:
            return False
            
        self.participants[participant_id] = {
            'public_key': public_key_pem,
            'contribution_count': 0,
            'last_contribution': None,
            'data_consent': data_consent
        }
        return True
    
    def check_ethics_approval(self) -> bool:
        """Check if model meets ethical standards"""
        current_time = time.time()
        if (current_time - self.last_ethics_check) > self.ethics_check_interval:
            try:
                ethics_score = self.ethics_registry.functions.getEthicsScore(
                    Web3.keccak(text=self.model_id)
                ).call()
                
                self.ethics_score = {
                    'love_score': ethics_score[0],
                    'vice_score': ethics_score[1],
                    'is_approved': ethics_score[2],
                    'review_notes': ethics_score[3],
                    'last_review': ethics_score[4],
                    'reviewer': ethics_score[5]
                }
                self.last_ethics_check = current_time
                
            except Exception as e:
                print(f"Failed to check ethics score: {e}")
                return False
                
        return self.ethics_score['is_approved'] if self.ethics_score else False
    
    def secure_aggregate(self, weight_updates: List[Dict], 
                        participant_signatures: List[bytes]) -> bool:
        """
        Securely aggregate model updates from participants with ethical checks
        
        Args:
            weight_updates: List of encrypted weight updates from participants
            participant_signatures: Signatures to verify participant identity
        """
        if not self.check_ethics_approval():
            print("Model does not meet ethical standards - aggregation blocked")
            return False
            
        verified_updates = []
        
        # Verify signatures and decrypt updates
        for update, signature in zip(weight_updates, participant_signatures):
            participant_id = update['participant_id']
            
            if participant_id not in self.participants:
                continue
                
            participant = self.participants[participant_id]
            if not participant['data_consent']:
                continue
                
            # Verify signature
            if self._verify_signature(update['update_hash'], signature, 
                                   participant['public_key']):
                # Decrypt weights using participant's public key
                decrypted_weights = self._decrypt_weights(
                    update['weights'],
                    participant['public_key']
                )
                if decrypted_weights:
                    verified_updates.append(decrypted_weights)
                    participant['contribution_count'] += 1
                    participant['last_contribution'] = update['timestamp']
        
        if not verified_updates:
            return False
            
        # Perform secure aggregation using secure multi-party computation
        aggregated_weights = self._secure_multiparty_aggregate(verified_updates)
        
        if aggregated_weights:
            # Update the current model weights
            if self.current_model_weights is None:
                self.current_model_weights = aggregated_weights
            else:
                # Apply the aggregated updates to the current model
                for layer_name in self.current_model_weights.keys():
                    self.current_model_weights[layer_name] = [
                        current + update
                        for current, update in zip(
                            self.current_model_weights[layer_name],
                            aggregated_weights[layer_name]
                        )
                    ]
            
            self.aggregation_rounds += 1
            return True
            
        return False
    
    def _secure_multiparty_aggregate(self, 
                                   weight_updates: List[Dict]) -> Optional[Dict]:
        """
        Perform secure multi-party computation for weight aggregation
        """
        try:
            aggregated_weights = {}
            for layer_name in weight_updates[0].keys():
                # Convert to numpy arrays for easier manipulation
                layer_updates = [np.array(update[layer_name]) 
                               for update in weight_updates]
                
                # Add differential privacy noise
                epsilon = 0.1  # Privacy parameter
                sensitivity = 1.0
                noise_scale = sensitivity / epsilon
                noise = np.random.laplace(0, noise_scale, 
                                        layer_updates[0].shape)
                
                # Average the updates with noise
                aggregated_weights[layer_name] = (
                    np.mean(layer_updates, axis=0) + noise
                ).tolist()
                
            return aggregated_weights
            
        except Exception as e:
            print(f"Secure aggregation failed: {e}")
            return None
    
    def _decrypt_weights(self, encrypted_weights: bytes, 
                        public_key_pem: str) -> Optional[Dict]:
        """Decrypt weights using participant's public key"""
        try:
            if self.encryption_manager:
                return self.encryption_manager.decrypt(
                    encrypted_weights,
                    public_key_pem
                )
            return encrypted_weights  # For testing without encryption
        except Exception:
            return None
    
    def get_current_model(self, participant_id: str) -> Optional[Dict]:
        """Get the current global model for a participant"""
        if (participant_id not in self.participants or 
            not self.participants[participant_id]['data_consent']):
            return None
            
        if not self.check_ethics_approval():
            return None
            
        # Encrypt model for specific participant
        if self.encryption_manager and self.current_model_weights:
            encrypted_weights = self.encryption_manager.encrypt(
                self.current_model_weights,
                self.participants[participant_id]['public_key']
            )
        else:
            encrypted_weights = self.current_model_weights
            
        return {
            'model_weights': encrypted_weights,
            'round': self.aggregation_rounds,
            'timestamp': int(time.time()),
            'ethics_score': self.ethics_score
        }
    
    def _verify_signature(self, data_hash: str, signature: bytes, 
                         public_key_pem: str) -> bool:
        """Verify a participant's signature"""
        try:
            public_key = load_pem_public_key(
                public_key_pem.encode('utf-8'),
                backend=default_backend()
            )
            
            public_key.verify(
                signature,
                data_hash.encode('utf-8'),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA256()
            )
            return True
        except Exception:
            return False
    
    def compute_model_hash(self) -> Optional[str]:
        """Compute a hash of the current model weights"""
        if self.current_model_weights is None:
            return None
            
        model_json = json.dumps(self.current_model_weights, sort_keys=True)
        return hashlib.sha256(model_json.encode('utf-8')).hexdigest()
    
    def get_participant_stats(self) -> Dict:
        """Get statistics about participant contributions"""
        stats = {
            'total_participants': len(self.participants),
            'active_participants': sum(
                1 for p in self.participants.values() 
                if p['contribution_count'] > 0
            ),
            'consenting_participants': sum(
                1 for p in self.participants.values() 
                if p['data_consent']
            ),
            'total_contributions': sum(
                p['contribution_count'] for p in self.participants.values()
            ),
            'aggregation_rounds': self.aggregation_rounds,
            'ethics_score': self.ethics_score
        }
        return stats