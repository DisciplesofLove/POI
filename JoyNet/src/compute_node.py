"""
IOTA-based compute node for AI inference execution
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

from web3 import Web3
from iota_client import IotaClient
import torch

from .inference_engine import InferenceEngine
from .utils.ipfs_utils import IPFSStorage
from .zk_proof import ZKProver

class ComputeNode:
    def __init__(
        self,
        private_key: str,
        coordinator_address: str,
        iota_node: str,
        ipfs_gateway: str
    ):
        self.private_key = private_key
        self.web3 = Web3()
        self.account = self.web3.eth.account.from_key(private_key)
        self.coordinator = self._load_coordinator(coordinator_address)
        self.iota = IotaClient(iota_node)
        self.ipfs = IPFSStorage(ipfs_gateway)
        self.inference_engine = InferenceEngine()
        self.active_tasks: Dict[str, Dict] = {}
        
    def _load_coordinator(self, address: str):
        """Load the NodeCoordinator contract"""
        # Load ABI and create contract instance
        with open(Path(__file__).parent / "contracts/NodeCoordinator.json") as f:
            contract_json = json.load(f)
        return self.web3.eth.contract(
            address=address,
            abi=contract_json["abi"]
        )

    async def start(self):
        """Start the compute node"""
        logging.info("Starting compute node...")
        
        # Register with coordinator
        capacity = self._get_compute_capacity()
        tx_hash = self.coordinator.functions.registerNode(capacity).transact({
            'from': self.account.address
        })
        self.web3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Start main loops
        await asyncio.gather(
            self._heartbeat_loop(),
            self._process_tasks()
        )
    
    async def _heartbeat_loop(self):
        """Send periodic heartbeats to maintain active status"""
        while True:
            try:
                # Send IOTA message to maintain presence
                message = {
                    'type': 'heartbeat',
                    'node': self.account.address,
                    'timestamp': self.web3.eth.get_block('latest').timestamp
                }
                await self.iota.message_send(message)
                
                # Update capacity/status on-chain if needed
                capacity = self._get_compute_capacity()
                if self._needs_capacity_update(capacity):
                    self.coordinator.functions.updateCapacity(capacity).transact({
                        'from': self.account.address
                    })
                    
            except Exception as e:
                logging.error(f"Heartbeat error: {e}")
                
            await asyncio.sleep(60)  # Every minute
            
    async def _process_tasks(self):
        """Main task processing loop"""
        while True:
            try:
                # Check for new tasks
                tasks = self.coordinator.events.TaskAssigned.get_logs(
                    fromBlock=self.web3.eth.block_number - 100
                )
                
                for task in tasks:
                    task_id = task.args.taskId
                    if (
                        task.args.node == self.account.address and
                        task_id not in self.active_tasks
                    ):
                        asyncio.create_task(self._execute_task(task_id))
                        
            except Exception as e:
                logging.error(f"Task processing error: {e}")
                
            await asyncio.sleep(5)  # Every 5 seconds
            
    async def _execute_task(self, task_id: str):
        """Execute a single inference task"""
        try:
            # Get task details
            task = self.coordinator.functions.tasks(task_id).call()
            model_id = task[0]  # First element is modelId
            
            # Load model
            model = await self._load_model_from_ipfs(model_id)
            self.inference_engine.load_model(model)
            
            # Get input data
            input_data = await self._get_input_data(task_id)
            
            # Run inference
            output = self.inference_engine.execute_inference(
                model_id,
                input_data
            )
            
            # Generate ZK proof
            prover = ZKProver(model_id)
            proof = prover.generate_proof(
                circuit_params={'model': model},
                input_data=input_data,
                output_data=output
            )
            
            # Submit result
            result_hash = self.web3.keccak(text=json.dumps(output))
            tx_hash = self.coordinator.functions.completeTask(
                task_id,
                result_hash
            ).transact({'from': self.account.address})
            
            # Wait for confirmation
            self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Store result on IOTA
            message = {
                'type': 'result',
                'task_id': task_id,
                'output': output,
                'proof': proof
            }
            await self.iota.message_send(message)
            
            logging.info(f"Task {task_id} completed successfully")
            
        except Exception as e:
            logging.error(f"Task execution error: {e}")
        finally:
            if task_id in self.active_tasks:
                del self.active_tasks[task_id]
                
    def _get_compute_capacity(self) -> int:
        """Get available compute capacity"""
        try:
            # Get GPU memory info
            torch.cuda.empty_cache()
            gpu_memory = torch.cuda.get_device_properties(0).total_memory
            used_memory = torch.cuda.memory_allocated(0)
            return int((gpu_memory - used_memory) / 1024**2)  # Convert to MB
        except:
            # Fallback to CPU
            return 1024  # 1GB for CPU
            
    async def _load_model_from_ipfs(self, model_id: str):
        """Load AI model from IPFS"""
        return await self.ipfs.download_model(model_id)
        
    async def _get_input_data(self, task_id: str) -> Dict[str, Any]:
        """Get input data from IOTA"""
        messages = await self.iota.message_find(
            index=task_id,
            data='type=input'
        )
        if not messages:
            raise ValueError(f"No input data found for task {task_id}")
        return json.loads(messages[0]['data'])