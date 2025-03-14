"""
Decentralized AI Model Marketplace Implementation
"""
from typing import Dict, Any, List, Optional
from web3 import Web3
from eth_account import Account
from eth_typing import Address
import ipfs_client

class ModelMarketplace:
    def __init__(
        self,
        private_key: str,
        pou_contract_address: Address,
        web3_provider: str = "http://localhost:8545"
    ):
        """Initialize the AI model marketplace."""
        self.web3 = Web3(Web3.HTTPProvider(web3_provider))
        self.account = Account.from_key(private_key)
        self.contract = self._load_contract(pou_contract_address)
        self.ipfs = ipfs_client.connect()
        
    def _load_contract(self, address: Address):
        """Load the ProofOfUse smart contract."""
        # Contract ABI would be imported here
        pass
        
    def register_model(
        self,
        model_path: str,
        metadata: Dict[str, Any],
        reward_per_use: int
    ) -> str:
        """Register a new AI model on the marketplace."""
        # Upload model to IPFS
        model_hash = self.ipfs.add(model_path)
        
        # Create model metadata
        full_metadata = {
            **metadata,
            "model_hash": model_hash,
            "creator": self.account.address
        }
        
        # Upload metadata to IPFS
        metadata_hash = self.ipfs.add_json(full_metadata)
        
        # Register on blockchain
        model_id = Web3.keccak(text=metadata_hash)
        tx = self.contract.functions.registerModel(
            model_id,
            reward_per_use
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
        
    def get_model_info(self, model_id: str) -> Dict[str, Any]:
        """Get information about a registered model."""
        model = self.contract.functions.models(model_id).call()
        
        # Get metadata from IPFS
        metadata = self.ipfs.get_json(model['metadata_hash'])
        
        return {
            "creator": model['creator'],
            "usage_count": model['usageCount'],
            "reward_per_use": model['rewardPerUse'],
            "is_active": model['isActive'],
            **metadata
        }
        
    def list_models(self) -> List[Dict[str, Any]]:
        """List all available models in the marketplace."""
        # This would typically query events from the contract
        # to get all registered models
        pass
        
    async def use_model(self, model_id: str, execution_id: str) -> bool:
        """Record usage of an AI model."""
        try:
            # Get gas estimate first
            gas_estimate = self.contract.functions.useModel(
                Web3.to_bytes(hexstr=model_id),
                Web3.to_bytes(hexstr=execution_id)
            ).estimate_gas({'from': self.account.address})
            
            # Add safety margin to gas estimate
            gas_limit = estimate_gas_with_margin(gas_estimate)
            
            # Build transaction with estimated gas
            tx = self.contract.functions.useModel(
                Web3.to_bytes(hexstr=model_id),
                Web3.to_bytes(hexstr=execution_id)
            ).build_transaction({
                'from': self.account.address,
                'gas': gas_limit,
                'gasPrice': self.web3.eth.gas_price,
                'nonce': self.web3.eth.get_transaction_count(self.account.address)
            })
            
            # Sign and send transaction
            signed_tx = self.web3.eth.account.sign_transaction(tx, self.account.key)
            tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            try:
                async def wait_for_receipt():
                    receipt = await self.web3.eth.wait_for_transaction_receipt(
                        tx_hash, 
                        timeout=TRANSACTION_TIMEOUT
                    )
                    if receipt['status'] != 1:
                        raise RuntimeError("Transaction failed")
                    return receipt
                
                await with_retry(wait_for_receipt)
                if receipt['status'] != 1:
                    raise RuntimeError("Transaction failed")
                return True
                
            except TimeoutError:
                raise RuntimeError("Transaction timed out - network may be congested")
                
        except Exception as e:
            logging.error(f"Error recording model usage: {e}")
            return False
            
    def get_usage_stats(self, model_id: str) -> Dict[str, Any]:
        """Get usage statistics for a model."""
        count = self.contract.functions.getModelUsageCount(model_id).call()
        
        return {
            "total_uses": count,
            "model_id": model_id
        }