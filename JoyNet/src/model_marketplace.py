"""
AI model marketplace interaction layer
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

from web3 import Web3
import torch

from .utils.ipfs_utils import IPFSStorage

class ModelMarketplace:
    def __init__(
        self,
        private_key: str,
        marketplace_address: str,
        ipfs_gateway: str = "http://localhost:8080"
    ):
        """Initialize marketplace interaction"""
        self.private_key = private_key
        self.web3 = Web3()
        self.account = self.web3.eth.account.from_key(private_key)
        self.marketplace = self._load_contract(marketplace_address)
        self.ipfs = IPFSStorage(ipfs_gateway)
        
    def _load_contract(self, address: str):
        """Load the marketplace contract"""
        # Load ABI and create contract instance
        abi_file = Path(__file__).parent / "contracts/ModelMarketplace.json"
        with open(abi_file) as f:
            contract_json = json.load(f)
        return self.web3.eth.contract(
            address=address,
            abi=contract_json["abi"]
        )
        
    async def register_model(
        self,
        name: str,
        model_path: str,
        price: float,
        stake: float = 1000.0,
        description: str = ""
    ) -> str:
        """Register a new model on the marketplace"""
        try:
            # Load and validate the model
            model = torch.load(model_path)
            
            # Upload model and metadata to IPFS
            metadata = {
                "name": name,
                "description": description,
                "created_at": self.web3.eth.get_block('latest').timestamp,
                "creator": self.account.address
            }
            
            model_hash, metadata_uri = await self.ipfs.upload_model(model, metadata)
            
            # Convert price and stake to wei
            price_wei = self.web3.to_wei(price, 'ether')
            stake_wei = self.web3.to_wei(stake, 'ether')
            
            # Create unique model ID
            model_id = self.web3.keccak(
                text=f"{self.account.address}:{model_hash}"
            )
            
            # Register on the marketplace
            tx_hash = self.marketplace.functions.registerModel(
                model_id,
                metadata_uri,
                price_wei,
                stake_wei
            ).transact({
                'from': self.account.address,
                'gas': 2000000
            })
            
            # Wait for confirmation
            self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            logging.info(f"Model {name} registered with ID {model_id.hex()}")
            return model_id.hex()
            
        except Exception as e:
            logging.error(f"Model registration failed: {e}")
            raise
            
    def get_model_info(self, model_id: str) -> Dict[str, Any]:
        """Get information about a registered model"""
        try:
            # Convert string ID to bytes32 if needed
            if isinstance(model_id, str):
                model_id = bytes.fromhex(model_id.replace('0x', ''))
                
            model_info = self.marketplace.functions.getModel(model_id).call()
            
            # Get metadata from IPFS
            metadata = self.ipfs.download_data(model_info[1])  # metadataURI
            
            return {
                "id": model_id.hex(),
                "owner": model_info[0],
                "metadata": json.loads(metadata),
                "price": self.web3.from_wei(model_info[2], 'ether'),
                "stake": self.web3.from_wei(model_info[3], 'ether'),
                "active": model_info[4],
                "total_uses": model_info[5],
                "revenue": self.web3.from_wei(model_info[6], 'ether'),
                "reputation": model_info[7]
            }
            
        except Exception as e:
            logging.error(f"Failed to get model info: {e}")
            raise
            
    def list_models(self, active_only: bool = True) -> List[Dict[str, Any]]:
        """List all registered models"""
        try:
            # Get model registration events
            events = self.marketplace.events.ModelRegistered.get_logs(
                fromBlock=0
            )
            
            models = []
            for event in events:
                model_id = event.args.modelId
                try:
                    info = self.get_model_info(model_id)
                    if not active_only or info['active']:
                        models.append(info)
                except Exception as e:
                    logging.warning(f"Failed to get info for model {model_id}: {e}")
                    
            return models
            
        except Exception as e:
            logging.error(f"Failed to list models: {e}")
            raise
            
    async def execute_model(
        self,
        model_id: str,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute inference on a model"""
        try:
            # Get model info and price
            info = self.get_model_info(model_id)
            price_wei = self.web3.to_wei(info['price'], 'ether')
            
            # Create execution ID
            execution_id = self.web3.keccak(text=f"{model_id}:{self.web3.eth.block_number}")
            
            # Execute inference transaction
            tx_hash = self.marketplace.functions.executeInference(
                bytes.fromhex(model_id.replace('0x', '')),
                execution_id
            ).transact({
                'from': self.account.address,
                'value': price_wei,
                'gas': 500000
            })
            
            # Wait for confirmation
            receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Upload input data to IPFS
            input_hash = await self.ipfs.upload_data(input_data)
            
            return {
                'execution_id': execution_id.hex(),
                'input_hash': input_hash,
                'transaction_hash': receipt['transactionHash'].hex(),
                'gas_used': receipt['gasUsed']
            }
            
        except Exception as e:
            logging.error(f"Model execution failed: {e}")
            raise