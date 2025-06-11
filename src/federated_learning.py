import os
import json
import numpy as np
import hashlib
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import load_pem_public_key, load_pem_private_key
from cryptography.hazmat.backends import default_backend

class FederatedLearning:
    """
    Implements privacy-preserving federated learning for decentralized AI training
    """
    
    def __init__(self, model_id, encryption_manager=None):
        """Initialize the federated learning system"""
        self.model_id = model_id
        self.encryption_manager = encryption_manager
        self.aggregation_rounds = 0
        self.participants = {}
        self.current_model_weights = None
    
    def register_participant(self, participant_id, public_key_pem):
        """Register a participant for federated learning"""
        self.participants[participant_id] = {
            'public_key': public_key_pem,
            'contribution_count': 0,
            'last_contribution': None
        }
        return True
    
    def secure_aggregate(self, weight_updates, participant_signatures):
        """
        Securely aggregate model updates from participants
        
        Args:
            weight_updates: List of encrypted weight updates from participants
            participant_signatures: Signatures to verify participant identity
        """
        verified_updates = []
        
        # Verify signatures and decrypt updates
        for update, signature in zip(weight_updates, participant_signatures):
            participant_id = update['participant_id']
            
            if participant_id not in self.participants:
                continue
                
            # Verify signature
            if self._verify_signature(update['update_hash'], signature, self.participants[participant_id]['public_key']):
                # In a real implementation, we would decrypt the weights here
                # For simplicity, we'll assume the weights are already decrypted
                verified_updates.append(update['weights'])
                self.participants[participant_id]['contribution_count'] += 1
                self.participants[participant_id]['last_contribution'] = update['timestamp']
        
        if not verified_updates:
            return False
            
        # Perform secure aggregation (simple average in this example)
        # In a real implementation, we would use secure multi-party computation
        aggregated_weights = {}
        for layer_name in verified_updates[0].keys():
            # Convert to numpy arrays for easier manipulation
            layer_updates = [np.array(update[layer_name]) for update in verified_updates]
            # Average the updates
            aggregated_weights[layer_name] = np.mean(layer_updates, axis=0).tolist()
        
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
    
    def get_current_model(self, participant_id):
        """Get the current global model for a participant"""
        if participant_id not in self.participants:
            return None
            
        # In a real implementation, we would encrypt the model for the specific participant
        return {
            'model_weights': self.current_model_weights,
            'round': self.aggregation_rounds,
            'timestamp': int(time.time())
        }
    
    def _verify_signature(self, data_hash, signature, public_key_pem):
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
    
    def compute_model_hash(self):
        """Compute a hash of the current model weights"""
        if self.current_model_weights is None:
            return None
            
        model_json = json.dumps(self.current_model_weights, sort_keys=True)
        return hashlib.sha256(model_json.encode('utf-8')).hexdigest()
    
    def get_participant_stats(self):
        """Get statistics about participant contributions"""
        stats = {
            'total_participants': len(self.participants),
            'active_participants': sum(1 for p in self.participants.values() if p['contribution_count'] > 0),
            'total_contributions': sum(p['contribution_count'] for p in self.participants.values()),
            'aggregation_rounds': self.aggregation_rounds
        }
        return stats