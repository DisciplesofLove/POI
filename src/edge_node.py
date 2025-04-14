"""
Edge Computing Node Implementation with Sovereign RPC
"""
import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
import torch
from web3 import Web3
from eth_account import Account
from eth_typing import Address

from .inference_node import InferenceNode
from .zk_prover import ZKProver
from .sovereign_rpc_node import SovereignRPCNode

class EdgeNode(InferenceNode):
    def __init__(
        self,
        private_key: str,
        coordinator_address: Address,
        poi_address: Address,
        rpc_config_path: str,
        web3_provider: str = "http://localhost:8545",
        host: str = "0.0.0.0",
        port: int = 8080
    ):
        """Initialize an edge computing node."""
        super().__init__(private_key, poi_address, web3_provider)
        self.coordinator_contract = self._load_coordinator(coordinator_address)
        self.host = host
        self.port = port
        self.active_tasks: Dict[str, asyncio.Task] = {}
        
        # Initialize sovereign RPC node
        self.rpc_node = SovereignRPCNode(
            private_key=private_key,
            config_path=rpc_config_path,
            web3_provider=web3_provider
        )
        
    async def start(self):
        """Start the edge computing node."""
        # Start RPC node first
        await self.rpc_node.start()
        
        # Register with coordinator
        compute_capacity = self._get_compute_capacity()
        stake_amount = Web3.to_wei(1000, 'ether')  # 1000 JOY tokens
        
        tx = self.coordinator_contract.functions.registerNode(
            f"{self.host}:{self.port}",
            compute_capacity,
            stake_amount
        ).build_transaction({
            'from': self.account.address,
            'gas': 2000000,
            'gasPrice': self.web3.eth.gas_price,
            'nonce': self.web3.eth.get_transaction_count(self.account.address)
        })
        
        signed_tx = self.web3.eth.account.sign_transaction(tx, self.account.key)
        await self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        # Start background tasks
        asyncio.create_task(self._heartbeat_loop())
        asyncio.create_task(self._process_tasks())
        
    async def _load_model_from_ipfs(self, model_id: str):
        """Load an AI model from IPFS using sovereign RPC."""
        try:
            # Retrieve model data through RPC node
            model_data = await self.rpc_node.retrieve_data(model_id)
            if not model_data:
                raise ValueError(f"Model {model_id} not found")
                
            # Load model
            model = torch.load(model_data)
            model.eval()
            if torch.cuda.is_available():
                model = model.cuda()
            self.models[model_id] = model
            
            # Store proof of model loading
            proof = self.zk_prover.generate_proof(
                model_id,
                model_data,
                self.account.address
            )
            
            # Record on chain
            tx = self.poi_contract.functions.recordModelLoad(
                Web3.to_bytes(hexstr=model_id),
                proof
            ).build_transaction({
                'from': self.account.address,
                'gas': 200000,
                'gasPrice': self.web3.eth.gas_price,
                'nonce': self.web3.eth.get_transaction_count(self.account.address)
            })
            
            signed_tx = self.web3.eth.account.sign_transaction(tx, self.account.key)
            await self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
        except Exception as e:
            logging.error(f"Failed to load model {model_id}: {e}")
            raise
            
    async def _get_input_data(self, task_id: str) -> Dict[str, Any]:
        """Get input data for a task using sovereign RPC."""
        # Get task info from coordinator
        task = self.coordinator_contract.functions.tasks(task_id).call()
        
        if not task or not task['modelId']:
            raise ValueError(f"Task {task_id} not found")
            
        # Retrieve input data through RPC node
        input_data = await self.rpc_node.retrieve_data(task['inputCid'])
        if not input_data:
            raise ValueError(f"Input data not found for task {task_id}")
            
        # Convert to tensor if needed
        if not isinstance(input_data, torch.Tensor):
            input_data = torch.tensor(input_data)
            
        return {
            'data': input_data,
            'task_id': task_id,
            'model_id': task['modelId']
        }
        
    async def execute_inference(self, model_id: str, input_data: Any) -> Dict[str, Any]:
        """Execute model inference with proofs."""
        if model_id not in self.models:
            await self._load_model_from_ipfs(model_id)
            
        model = self.models[model_id]
        
        with torch.no_grad():
            # Run inference
            if torch.cuda.is_available():
                input_data = input_data.cuda()
            output_data = model(input_data)
            
            # Generate proof
            proof = self.zk_prover.generate_proof(
                model_id,
                input_data,
                output_data
            )
            
            # Store result through RPC node
            result_cid = await self.rpc_node.store_data({
                'output': output_data.cpu().numpy().tolist(),
                'proof': proof.hex()
            })
            
            # Record on chain
            tx = self.poi_contract.functions.recordInference(
                Web3.to_bytes(hexstr=model_id),
                Web3.to_bytes(hexstr=result_cid),
                proof
            ).build_transaction({
                'from': self.account.address,
                'gas': 300000,
                'gasPrice': self.web3.eth.gas_price,
                'nonce': self.web3.eth.get_transaction_count(self.account.address)
            })
            
            signed_tx = self.web3.eth.account.sign_transaction(tx, self.account.key)
            tx_hash = await self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
            
            return {
                'output': output_data.cpu().numpy(),
                'result_cid': result_cid,
                'proof': proof.hex(),
                'tx_hash': tx_hash.hex()
            }
            
    def _get_compute_capacity(self) -> int:
        """Get the node's compute capacity in FLOPS."""
        if torch.cuda.is_available():
            # Get GPU compute capacity
            return int(torch.cuda.get_device_properties(0).multi_processor_count * 
                      torch.cuda.get_device_properties(0).max_threads_per_multiprocessor)
        else:
            # Get CPU compute capacity
            import multiprocessing
            return multiprocessing.cpu_count() * 100000  # Rough estimate