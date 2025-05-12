"""
Model Fusion Engine for combining complementary AI models
"""
from typing import Dict, Any, List, Optional, Tuple
from web3 import Web3
from eth_account import Account
from eth_typing import Address
import json
import os
import logging
import torch
import numpy as np
from .model_marketplace import ModelMarketplace
from .utils.ipfs_utils import IPFSStorage

class ModelFusion:
    def __init__(
        self,
        private_key: str,
        fusion_contract_address: Address,
        marketplace_address: Address,
        web3_provider: str = "http://localhost:8545"
    ):
        """Initialize the model fusion engine."""
        self.web3 = Web3(Web3.HTTPProvider(web3_provider))
        self.account = Account.from_key(private_key)
        self.fusion_contract = self._load_fusion_contract(fusion_contract_address)
        self.marketplace = ModelMarketplace(private_key, marketplace_address, web3_provider)
        self.ipfs = IPFSStorage()
        
    def _load_fusion_contract(self, address: Address):
        """Load the ModelFusionContract smart contract."""
        abi_path = os.path.join(os.path.dirname(__file__), 'contracts/ModelFusionContract.json')
        with open(abi_path) as f:
            contract_json = json.load(f)
        return self.web3.eth.contract(address=address, abi=contract_json['abi'])
        
    def check_compatibility(
        self,
        model_ids: List[str]
    ) -> Dict[str, Any]:
        """Check compatibility between multiple models."""
        if len(model_ids) < 2:
            raise ValueError("Need at least two models to check compatibility")
            
        models = [self.marketplace.get_model_info(model_id) for model_id in model_ids]
        
        # This would be a more sophisticated AI-based compatibility check in production
        # For now, we'll use a simple heuristic based on model types and metadata
        compatibility_score = 0.0
        connection_points = []
        
        # Check model types for complementary capabilities
        model_types = [model['details'].get('model_architecture', '') for model in models]
        
        # Check for vision + language combination
        if any('vision' in t.lower() for t in model_types) and any('language' in t.lower() for t in model_types):
            compatibility_score += 30.0
            connection_points.append({
                'name': 'Vision-Language Bridge',
                'description': 'Connect vision model outputs to language model inputs',
                'compatibility': 85
            })
            
        # Check for transformer + CNN combination
        if any('transformer' in t.lower() for t in model_types) and any('cnn' in t.lower() for t in model_types):
            compatibility_score += 25.0
            connection_points.append({
                'name': 'Feature Extraction Pipeline',
                'description': 'Use CNN for feature extraction and transformer for processing',
                'compatibility': 80
            })
            
        # Check for complementary input/output formats
        input_formats = [model['details'].get('input_format', '') for model in models]
        output_formats = [model['details'].get('output_format', '') for model in models]
        
        for i, output_format in enumerate(output_formats):
            for j, input_format in enumerate(input_formats):
                if i != j and output_format == input_format:
                    compatibility_score += 20.0
                    connection_points.append({
                        'name': f'Data Pipeline {i+1}-to-{j+1}',
                        'description': f'Direct connection from Model {i+1} output to Model {j+1} input',
                        'compatibility': 90
                    })
                    
        # Add a generic connection point if none found
        if not connection_points:
            connection_points.append({
                'name': 'Custom Adapter',
                'description': 'Custom adapter layer to transform data between models',
                'compatibility': 60
            })
            
        # Normalize score to 0-100 range
        compatibility_score = min(max(compatibility_score, 0.0), 100.0)
        
        return {
            'score': compatibility_score,
            'is_compatible': compatibility_score > 60.0,
            'connection_points': connection_points,
            'recommendations': self._generate_recommendations(models, compatibility_score)
        }
        
    def _generate_recommendations(self, models: List[Dict[str, Any]], score: float) -> str:
        """Generate recommendations based on compatibility analysis."""
        if score > 80:
            return "These models are highly compatible and should work well together with minimal adaptation."
        elif score > 60:
            return "These models can work together with proper connection configuration."
        else:
            return "These models may not be fully compatible. Consider selecting different models or implementing custom adapters."
            
    async def create_fused_model(
        self,
        component_model_ids: List[str],
        royalty_shares: List[int],
        name: str,
        description: str,
        connection_config: Dict[str, Any],
        price: float
    ) -> str:
        """Create a new fused model from component models."""
        if len(component_model_ids) < 2:
            raise ValueError("Need at least two component models")
            
        if len(component_model_ids) != len(royalty_shares):
            raise ValueError("Component models and royalty shares must have the same length")
            
        if sum(royalty_shares) != 10000:
            raise ValueError("Royalty shares must sum to 10000 (100%)")
            
        # Create metadata for the fused model
        metadata = {
            'name': name,
            'description': description,
            'component_models': component_model_ids,
            'connection_config': connection_config,
            'created_at': self.web3.eth.get_block('latest').timestamp,
            'creator': self.account.address
        }
        
        # Upload metadata to IPFS
        metadata_uri = await self.ipfs.upload_json(metadata)
        
        # Convert price to wei
        price_wei = self.web3.to_wei(price, 'ether')
        
        # Convert model IDs to bytes32
        component_model_ids_bytes = [
            self.web3.to_bytes(hexstr=model_id) if isinstance(model_id, str) else model_id
            for model_id in component_model_ids
        ]
        
        # Register on blockchain
        tx_hash = self.fusion_contract.functions.createFusedModel(
            component_model_ids_bytes,
            royalty_shares,
            metadata_uri,
            price_wei
        ).build_transaction({
            'from': self.account.address,
            'gas': 3000000,
            'gasPrice': self.web3.eth.gas_price,
            'nonce': self.web3.eth.get_transaction_count(self.account.address)
        })
        
        signed_tx = self.web3.eth.account.sign_transaction(tx_hash, self.account.key)
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Extract the fused model ID from the event logs
        fused_model_id = None
        for log in receipt['logs']:
            try:
                event = self.fusion_contract.events.FusedModelCreated().process_log(log)
                fused_model_id = event['args']['fusedModelId'].hex()
                break
            except:
                continue
                
        if not fused_model_id:
            raise Exception("Failed to extract fused model ID from transaction receipt")
            
        logging.info(f"Created fused model with ID: {fused_model_id}")
        return fused_model_id
        
    def get_fused_model(self, fused_model_id: str) -> Dict[str, Any]:
        """Get information about a fused model."""
        if isinstance(fused_model_id, str):
            fused_model_id = bytes.fromhex(fused_model_id.replace('0x', ''))
            
        model_info = self.fusion_contract.functions.getFusedModel(fused_model_id).call()
        
        # Get metadata from IPFS
        metadata = self.ipfs.download_json(model_info[4])  # metadataURI
        
        # Convert component model IDs to hex strings
        component_model_ids = [m.hex() for m in model_info[1]]
        
        return {
            'id': fused_model_id.hex(),
            'creator': model_info[0],
            'component_model_ids': component_model_ids,
            'component_owners': model_info[2],
            'royalty_shares': model_info[3],
            'metadata': metadata,
            'price': self.web3.from_wei(model_info[5], 'ether'),
            'total_uses': model_info[6],
            'total_revenue': self.web3.from_wei(model_info[7], 'ether'),
            'is_active': model_info[8],
            'created_at': model_info[9]
        }
        
    def use_fused_model(self, fused_model_id: str) -> bool:
        """Pay for and use a fused model."""
        try:
            if isinstance(fused_model_id, str):
                fused_model_id = bytes.fromhex(fused_model_id.replace('0x', ''))
                
            tx_hash = self.fusion_contract.functions.useFusedModel(
                fused_model_id
            ).build_transaction({
                'from': self.account.address,
                'gas': 2000000,
                'gasPrice': self.web3.eth.gas_price,
                'nonce': self.web3.eth.get_transaction_count(self.account.address)
            })
            
            signed_tx = self.web3.eth.account.sign_transaction(tx_hash, self.account.key)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            return True
            
        except Exception as e:
            logging.error(f"Error using fused model: {e}")
            return False
            
    async def test_fused_model_performance(
        self,
        component_model_ids: List[str],
        connection_config: Dict[str, Any],
        test_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Test the performance of a fused model configuration."""
        # This would be a more sophisticated testing process in production
        # For now, we'll simulate the results
        
        # Load component models
        component_models = []
        for model_id in component_model_ids:
            model_info = self.marketplace.get_model_info(model_id)
            model_path = await self.ipfs.download_file(model_info['details']['model_file'])
            model = torch.load(model_path)
            component_models.append(model)
            
        # Simulate benchmark results
        accuracy = np.random.uniform(0.8, 0.99)
        latency = np.random.uniform(10, 100)  # ms
        throughput = np.random.uniform(500, 2000)  # requests/sec
        
        # Calculate improvement over individual models
        # In a real implementation, we would run actual benchmarks
        improvement = np.random.uniform(0.1, 0.4)  # 10-40% improvement
        
        return {
            'accuracy': float(accuracy),
            'latency': float(latency),
            'throughput': float(throughput),
            'improvement': float(improvement)
        }