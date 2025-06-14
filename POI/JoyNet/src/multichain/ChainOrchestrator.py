"""
ChainOrchestrator service for coordinating cross-chain operations between
Solana, IOTA, and Polygon Supernet.
"""

import asyncio
import logging
from typing import Dict, List, Optional
from web3 import Web3
from solana.rpc.async_api import AsyncClient as SolanaClient
from iota_client import IotaClient

class ChainOrchestrator:
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Initialize chain connections
        self.polygon_web3 = Web3(Web3.HTTPProvider(config['polygon']['rpc_url']))
        self.solana_client = SolanaClient(config['solana']['rpc_url'])
        self.iota_client = IotaClient(config['iota']['node_url'])
        
        # Load contract ABIs and addresses
        self.load_contracts()
        
        # Transaction queue for each chain
        self.tx_queues = {
            'polygon': asyncio.Queue(),
            'solana': asyncio.Queue(),
            'iota': asyncio.Queue()
        }
        
        # Start background workers
        self.start_workers()
    
    def load_contracts(self):
        """Load smart contract ABIs and addresses"""
        try:
            # Load Polygon contracts
            with open(self.config['contracts']['polygon_abi']) as f:
                polygon_abi = json.load(f)
            self.polygon_contract = self.polygon_web3.eth.contract(
                address=self.config['contracts']['polygon_address'],
                abi=polygon_abi
            )
            
            # Load bridge contract addresses
            self.solana_bridge = self.config['contracts']['solana_bridge']
            self.iota_bridge = self.config['contracts']['iota_bridge']
            
        except Exception as e:
            self.logger.error(f"Failed to load contracts: {e}")
            raise
    
    def start_workers(self):
        """Start background workers for each chain"""
        asyncio.create_task(self.polygon_worker())
        asyncio.create_task(self.solana_worker())
        asyncio.create_task(self.iota_worker())
    
    async def polygon_worker(self):
        """Process Polygon Supernet transactions"""
        while True:
            tx = await self.tx_queues['polygon'].get()
            try:
                # Process governance or marketplace transactions
                if tx['type'] == 'governance':
                    await self.handle_governance_tx(tx)
                elif tx['type'] == 'marketplace':
                    await self.handle_marketplace_tx(tx)
                
            except Exception as e:
                self.logger.error(f"Polygon tx failed: {e}")
            
            self.tx_queues['polygon'].task_done()
    
    async def solana_worker(self):
        """Process Solana high-throughput transactions"""
        while True:
            tx = await self.tx_queues['solana'].get()
            try:
                # Process high-speed AI inference payments
                if tx['type'] == 'inference':
                    await self.handle_solana_inference(tx)
                elif tx['type'] == 'bridge':
                    await self.handle_solana_bridge(tx)
                
            except Exception as e:
                self.logger.error(f"Solana tx failed: {e}")
            
            self.tx_queues['solana'].task_done()
    
    async def iota_worker(self):
        """Process IOTA feeless microtransactions"""
        while True:
            tx = await self.tx_queues['iota'].get()
            try:
                # Process IoT data streams and micropayments
                if tx['type'] == 'stream':
                    await self.handle_iota_stream(tx)
                elif tx['type'] == 'micropayment':
                    await self.handle_iota_micropayment(tx)
                
            except Exception as e:
                self.logger.error(f"IOTA tx failed: {e}")
            
            self.tx_queues['iota'].task_done()
    
    async def handle_governance_tx(self, tx: Dict):
        """Handle DAO governance transactions on Polygon"""
        try:
            # Build and submit governance proposal
            proposal = self.polygon_contract.functions.propose(
                tx['targets'],
                tx['values'],
                tx['calldatas'],
                tx['description']
            )
            
            # Submit transaction
            tx_hash = await self.submit_polygon_tx(proposal)
            self.logger.info(f"Governance proposal submitted: {tx_hash}")
            
        except Exception as e:
            self.logger.error(f"Governance tx failed: {e}")
            raise
    
    async def handle_marketplace_tx(self, tx: Dict):
        """Handle marketplace transactions on Polygon"""
        try:
            if tx['action'] == 'tokenize':
                # Tokenize AI model
                tokenize_tx = self.polygon_contract.functions.tokenizeModel(
                    tx['model_id'],
                    tx['metadata_uri'],
                    tx['collaborators'],
                    tx['royalty_shares']
                )
                await self.submit_polygon_tx(tokenize_tx)
                
            elif tx['action'] == 'distribute':
                # Distribute royalties
                distribute_tx = self.polygon_contract.functions.distributeRoyalties(
                    tx['model_id'],
                    tx['amount']
                )
                await self.submit_polygon_tx(distribute_tx)
                
        except Exception as e:
            self.logger.error(f"Marketplace tx failed: {e}")
            raise
    
    async def handle_solana_inference(self, tx: Dict):
        """Handle AI inference payments on Solana"""
        try:
            # Create Solana transaction for inference payment
            solana_tx = await self.solana_client.create_inference_payment(
                payer=tx['payer'],
                model_id=tx['model_id'],
                amount=tx['amount']
            )
            
            # Submit and confirm transaction
            result = await self.solana_client.send_transaction(solana_tx)
            await self.solana_client.confirm_transaction(result['result'])
            
            # Notify Polygon of completed payment for royalty distribution
            await self.notify_polygon_royalties(tx['model_id'], tx['amount'])
            
        except Exception as e:
            self.logger.error(f"Solana inference tx failed: {e}")
            raise
    
    async def handle_iota_stream(self, tx: Dict):
        """Handle IoT data streams on IOTA"""
        try:
            # Create IOTA message for data stream
            message = self.iota_client.create_stream_message(
                provider=tx['provider'],
                consumer=tx['consumer'],
                rate=tx['rate']
            )
            
            # Submit message
            message_id = self.iota_client.submit_message(message)
            
            # Monitor stream status
            asyncio.create_task(self.monitor_iota_stream(message_id))
            
        except Exception as e:
            self.logger.error(f"IOTA stream failed: {e}")
            raise
    
    async def handle_iota_micropayment(self, tx: Dict):
        """Handle feeless micropayments on IOTA"""
        try:
            # Create IOTA micropayment message
            message = self.iota_client.create_micropayment(
                sender=tx['sender'],
                recipient=tx['recipient'],
                amount=tx['amount']
            )
            
            # Submit and monitor payment
            message_id = self.iota_client.submit_message(message)
            await self.wait_for_iota_confirmation(message_id)
            
            # Update payment status on Polygon if needed
            if tx.get('update_polygon'):
                await self.update_polygon_payment_status(tx['payment_id'])
            
        except Exception as e:
            self.logger.error(f"IOTA micropayment failed: {e}")
            raise
    
    async def submit_polygon_tx(self, transaction) -> str:
        """Submit transaction to Polygon Supernet"""
        try:
            # Build transaction
            tx = transaction.buildTransaction({
                'from': self.config['polygon']['account'],
                'nonce': self.polygon_web3.eth.getTransactionCount(
                    self.config['polygon']['account']
                )
            })
            
            # Sign and send
            signed = self.polygon_web3.eth.account.signTransaction(
                tx,
                self.config['polygon']['private_key']
            )
            tx_hash = self.polygon_web3.eth.sendRawTransaction(signed.rawTransaction)
            
            # Wait for receipt
            receipt = self.polygon_web3.eth.waitForTransactionReceipt(tx_hash)
            return receipt['transactionHash'].hex()
            
        except Exception as e:
            self.logger.error(f"Failed to submit Polygon tx: {e}")
            raise
    
    async def notify_polygon_royalties(self, model_id: str, amount: int):
        """Notify Polygon contract of completed payment for royalty distribution"""
        await self.tx_queues['polygon'].put({
            'type': 'marketplace',
            'action': 'distribute',
            'model_id': model_id,
            'amount': amount
        })
    
    async def monitor_iota_stream(self, message_id: str):
        """Monitor IOTA data stream status"""
        while True:
            try:
                status = await self.iota_client.get_message_status(message_id)
                if status['confirmed']:
                    self.logger.info(f"Stream {message_id} confirmed")
                    break
                    
                await asyncio.sleep(5)
                
            except Exception as e:
                self.logger.error(f"Failed to monitor stream {message_id}: {e}")
                await asyncio.sleep(10)
    
    async def wait_for_iota_confirmation(self, message_id: str):
        """Wait for IOTA message confirmation"""
        max_retries = 10
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                status = await self.iota_client.get_message_status(message_id)
                if status['confirmed']:
                    return True
                    
                retry_count += 1
                await asyncio.sleep(5)
                
            except Exception as e:
                self.logger.error(f"Failed to check message {message_id}: {e}")
                retry_count += 1
                await asyncio.sleep(10)
        
        raise Exception(f"Message {message_id} not confirmed after {max_retries} retries")
    
    async def update_polygon_payment_status(self, payment_id: str):
        """Update payment status on Polygon after IOTA confirmation"""
        await self.tx_queues['polygon'].put({
            'type': 'marketplace',
            'action': 'update_payment',
            'payment_id': payment_id
        })