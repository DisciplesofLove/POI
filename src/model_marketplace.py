"""
Decentralized AI Model Marketplace Implementation with Personal Stores
"""
from typing import Dict, Any, List, Optional, Tuple
from web3 import Web3
from eth_account import Account
from eth_typing import Address
import ipfs_client
import json
import os

class ModelMarketplace:
    def __init__(
        self,
        private_key: str,
        marketplace_address: Address,
        web3_provider: str = "http://localhost:8545"
    ):
        """Initialize the decentralized AI model marketplace."""
        self.web3 = Web3(Web3.HTTPProvider(web3_provider))
        self.account = Account.from_key(private_key)
        self.contract = self._load_contract(marketplace_address)
        self.ipfs = ipfs_client.connect()
        
    def _load_contract(self, address: Address):
        """Load the ModelMarketplace smart contract."""
        # Contract ABI would be imported here
        abi_path = os.path.join(os.path.dirname(__file__), 'contracts/ModelMarketplace.json')
        with open(abi_path) as f:
            contract_json = json.load(f)
        return self.web3.eth.contract(address=address, abi=contract_json['abi'])
        
    def create_store(
        self,
        name: str,
        description: str
    ) -> str:
        """Create a new personal store in the marketplace."""
        store_id = Web3.keccak(text=f"{self.account.address}:{name}")
        
        tx = self.contract.functions.createStore(
            store_id,
            name,
            description
        ).build_transaction({
            'from': self.account.address,
            'gas': 2000000,
            'gasPrice': self.web3.eth.gas_price,
            'nonce': self.web3.eth.get_transaction_count(self.account.address)
        })
        
        signed_tx = self.web3.eth.account.sign_transaction(tx, self.account.key)
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        self.web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return store_id.hex()

    def update_store(
        self,
        name: str,
        description: str
    ) -> bool:
        """Update the caller's store information."""
        try:
            tx = self.contract.functions.updateStore(
                name,
                description
            ).build_transaction({
                'from': self.account.address,
                'gas': 2000000,
                'gasPrice': self.web3.eth.gas_price,
                'nonce': self.web3.eth.get_transaction_count(self.account.address)
            })
            
            signed_tx = self.web3.eth.account.sign_transaction(tx, self.account.key)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            return True
        except Exception as e:
            print(f"Error updating store: {e}")
            return False

    def register_model(
        self,
        name: str,
        description: str,
        version: str,
        model_path: str,
        documentation_path: str,
        sample_data_path: str,
        tags: List[str],
        price: int,
        additional_metadata: Dict[str, Any] = None
    ) -> str:
        """Register a new AI model in the owner's store."""
        # Upload model files to IPFS
        model_hash = self.ipfs.add(model_path)
        doc_hash = self.ipfs.add(documentation_path)
        sample_hash = self.ipfs.add(sample_data_path)
        
        # Create model metadata
        metadata = {
            "model_file": model_hash,
            "input_format": additional_metadata.get("input_format", ""),
            "output_format": additional_metadata.get("output_format", ""),
            "model_architecture": additional_metadata.get("model_architecture", ""),
            "training_data_description": additional_metadata.get("training_data_description", ""),
            "performance_metrics": additional_metadata.get("performance_metrics", {}),
            "hardware_requirements": additional_metadata.get("hardware_requirements", {}),
            "license": additional_metadata.get("license", ""),
            **additional_metadata or {}
        }
        
        # Upload metadata to IPFS
        metadata_hash = self.ipfs.add_json(metadata)
        
        # Generate unique model ID
        model_id = Web3.keccak(text=f"{self.account.address}:{name}:{version}")
        
        # Register on blockchain
        tx = self.contract.functions.registerModel(
            model_id,
            name,
            description,
            version,
            metadata_hash,
            doc_hash,
            sample_hash,
            tags,
            price
        ).build_transaction({
            'from': self.account.address,
            'gas': 2000000,
            'gasPrice': self.web3.eth.gas_price,
            'nonce': self.web3.eth.get_transaction_count(self.account.address)
        })
        
        signed_tx = self.web3.eth.account.sign_transaction(tx, self.account.key)
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        self.web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return model_id.hex()
        
    def update_model(
        self,
        model_id: str,
        name: str,
        description: str,
        version: str,
        documentation_path: Optional[str] = None,
        sample_data_path: Optional[str] = None,
        tags: Optional[List[str]] = None,
        price: Optional[int] = None,
        additional_metadata: Dict[str, Any] = None
    ) -> bool:
        """Update an existing model's information."""
        try:
            # Get current model info
            current = self.get_model_info(model_id)
            
            # Upload new files if provided
            doc_hash = self.ipfs.add(documentation_path) if documentation_path else current['documentation']
            sample_hash = self.ipfs.add(sample_data_path) if sample_data_path else current['sample_data']
            
            # Update metadata if needed
            if additional_metadata:
                current_metadata = self.ipfs.get_json(current['metadata'])
                updated_metadata = {**current_metadata, **additional_metadata}
                metadata_hash = self.ipfs.add_json(updated_metadata)
            else:
                metadata_hash = current['metadata']
            
            tx = self.contract.functions.updateModel(
                Web3.to_bytes(hexstr=model_id),
                name,
                description,
                version,
                metadata_hash,
                doc_hash,
                sample_hash,
                tags or current['tags'],
                price or current['price']
            ).build_transaction({
                'from': self.account.address,
                'gas': 2000000,
                'gasPrice': self.web3.eth.gas_price,
                'nonce': self.web3.eth.get_transaction_count(self.account.address)
            })
            
            signed_tx = self.web3.eth.account.sign_transaction(tx, self.account.key)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            return True
            
        except Exception as e:
            print(f"Error updating model: {e}")
            return False
        
    def get_model_info(self, model_id: str) -> Dict[str, Any]:
        """Get comprehensive information about a registered model."""
        model = self.contract.functions.getModelInfo(Web3.to_bytes(hexstr=model_id)).call()
        
        # Get metadata from IPFS
        metadata = self.ipfs.get_json(model[4])  # metadata hash is at index 4
        
        return {
            "owner": model[0],
            "name": model[1],
            "description": model[2],
            "version": model[3],
            "metadata": model[4],
            "documentation": model[5],
            "sample_data": model[6],
            "tags": model[7],
            "price": model[8],
            "is_active": model[9],
            "total_uses": model[10],
            "revenue": model[11],
            "created_at": model[12],
            "last_updated": model[13],
            "store_id": model[14],
            "details": metadata
        }
        
    def get_store_info(self, store_id: str) -> Dict[str, Any]:
        """Get information about a store."""
        store = self.contract.functions.getStoreInfo(Web3.to_bytes(hexstr=store_id)).call()
        
        models = []
        for i in range(store[3]):  # store[3] is modelCount
            model_id = self.contract.functions.getStoreModelId(
                Web3.to_bytes(hexstr=store_id),
                i
            ).call()
            models.append(model_id.hex())
            
        return {
            "name": store[0],
            "description": store[1],
            "is_active": store[2],
            "model_count": store[3],
            "models": models
        }
        
    def list_store_models(self, store_id: str) -> List[Dict[str, Any]]:
        """List all models in a specific store."""
        store = self.get_store_info(store_id)
        return [self.get_model_info(model_id) for model_id in store['models']]
        
    def use_model(self, model_id: str) -> bool:
        """Pay for and use an AI model."""
        try:
            execution_id = Web3.keccak(text=f"{model_id}:{self.account.address}:{self.web3.eth.block_number}")
            
            tx = self.contract.functions.useModel(
                Web3.to_bytes(hexstr=model_id),
                execution_id
            ).build_transaction({
                'from': self.account.address,
                'gas': 2000000,
                'gasPrice': self.web3.eth.gas_price,
                'nonce': self.web3.eth.get_transaction_count(self.account.address)
            })
            
            signed_tx = self.web3.eth.account.sign_transaction(tx, self.account.key)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            return True
            
        except Exception as e:
            print(f"Error using model: {e}")
            return False
            
    def deactivate_model(self, model_id: str) -> bool:
        """Deactivate a model from the marketplace."""
        try:
            tx = self.contract.functions.deactivateModel(
                Web3.to_bytes(hexstr=model_id)
            ).build_transaction({
                'from': self.account.address,
                'gas': 2000000,
                'gasPrice': self.web3.eth.gas_price,
                'nonce': self.web3.eth.get_transaction_count(self.account.address)
            })
            
            signed_tx = self.web3.eth.account.sign_transaction(tx, self.account.key)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            return True
            
        except Exception as e:
            print(f"Error deactivating model: {e}")
            return False