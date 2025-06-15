"""
Proof of Use (PoU) consensus mechanism for the Joy Sovereign network
"""
import hashlib
import json
import time
from typing import Dict, List, Any, Optional, Set
import asyncio
import logging
from ..utils.crypto_vault import CryptoVault
from ..p2p.message_manager import MessageManager

logger = logging.getLogger(__name__)

class ProofOfUse:
    """
    Implements the Proof of Use (PoU) consensus mechanism that selects block producers
    based on validated transaction participation and DAO governance compliance.
    """
    
    def __init__(self, node_id: str, private_key: str, message_manager: MessageManager):
        """Initialize the Proof of Use system"""
        self.node_id = node_id
        self.crypto_vault = CryptoVault(private_key)
        self.message_manager = message_manager
        self.whitelisted_validators = set()  # DAO-approved validator list
        self.validator_stakes = {}  # Validator stake amounts
        self.validator_reputation = {}  # Validator governance reputation
        self.transaction_history = {}  # Track validated transactions per validator
        self.validation_queue = asyncio.Queue()
        self.validation_results = {}
        
    async def start(self):
        """Start the PoU validation service"""
        logger.info("Starting Proof of Use service")
        asyncio.create_task(self._validation_worker())
        asyncio.create_task(self._block_producer_selector())
        
    async def _validation_worker(self):
        """Process validation requests from the queue"""
        while True:
            try:
                validation_request = await self.validation_queue.get()
                await self._process_validation(validation_request)
                self.validation_queue.task_done()
            except Exception as e:
                logger.error(f"Error in validation worker: {e}")
                await asyncio.sleep(1)

    async def _block_producer_selector(self):
        """
        Periodically select the next block producer based on:
        1. Validator whitelist status
        2. Stake amount
        3. Governance reputation
        4. Transaction validation history
        """
        while True:
            try:
                await self._select_next_producer()
                await asyncio.sleep(10)  # Select every 10 seconds
            except Exception as e:
                logger.error(f"Error in block producer selection: {e}")
                await asyncio.sleep(1)

    async def _select_next_producer(self):
        """Select the next block producer based on PoU criteria"""
        eligible_validators = []
        
        for validator in self.whitelisted_validators:
            if self._is_validator_eligible(validator):
                score = self._calculate_validator_score(validator)
                eligible_validators.append((validator, score))
                
        if eligible_validators:
            # Sort by score and select top validator
            selected = sorted(eligible_validators, key=lambda x: x[1], reverse=True)[0][0]
            await self._announce_block_producer(selected)
        else:
            logger.warning("No eligible validators available")

    def _is_validator_eligible(self, validator: str) -> bool:
        """Check if a validator meets minimum requirements"""
        return (
            validator in self.whitelisted_validators and
            self.validator_stakes.get(validator, 0) >= self.MIN_STAKE and
            self.validator_reputation.get(validator, 0) >= self.MIN_REPUTATION
        )

    def _calculate_validator_score(self, validator: str) -> float:
        """Calculate validator score based on stake, reputation and activity"""
        stake_weight = 0.3
        reputation_weight = 0.4
        activity_weight = 0.3
        
        stake_score = self.validator_stakes.get(validator, 0)
        reputation_score = self.validator_reputation.get(validator, 0)
        activity_score = len(self.transaction_history.get(validator, []))
        
        return (
            stake_weight * stake_score +
            reputation_weight * reputation_score +
            activity_weight * activity_score
        )

    async def _announce_block_producer(self, producer: str):
        """Announce the selected block producer to the network"""
        announcement = {
            "type": "block_producer",
            "producer": producer,
            "timestamp": time.time(),
            "signature": self.crypto_vault.sign(producer)
        }
        await self.message_manager.broadcast_message(
            topic="block_producer",
            message=announcement
        )

    async def register_validator(self, validator_id: str, stake_amount: float, 
                               reputation_proof: Dict[str, Any]) -> bool:
        """
        Register a new validator if approved by the DAO
        
        Args:
            validator_id: Unique identifier of the validator
            stake_amount: Amount of JOY tokens staked
            reputation_proof: Proof of governance reputation/compliance
            
        Returns:
            True if registration successful
        """
        # Verify DAO approval (would integrate with LOL DAO contract)
        if not await self._verify_dao_approval(validator_id, reputation_proof):
            return False
            
        self.whitelisted_validators.add(validator_id)
        self.validator_stakes[validator_id] = stake_amount
        self.validator_reputation[validator_id] = reputation_proof.get("reputation_score", 0)
        
        logger.info(f"Registered validator {validator_id}")
        return True

    async def _verify_dao_approval(self, validator_id: str, 
                                 reputation_proof: Dict[str, Any]) -> bool:
        """Verify validator is approved by LOL DAO governance"""
        # This would integrate with the LOL DAO smart contract
        # For now returning True for testing
        return True

    async def submit_transaction(self, tx_data: Dict[str, Any]) -> str:
        """Submit a transaction for validation"""
        tx_id = hashlib.sha256(
            f"{json.dumps(tx_data)}:{time.time()}".encode()
        ).hexdigest()
        
        request = {
            "id": tx_id,
            "data": tx_data,
            "submitter": self.node_id,
            "timestamp": time.time()
        }
        
        # Sign the request
        signature = self.crypto_vault.sign(json.dumps(request))
        request["signature"] = signature
        
        # Broadcast for validation
        await self.message_manager.broadcast_message(
            topic="transaction",
            message=request
        )
        
        return tx_id

    async def validate_transaction(self, tx_request: Dict[str, Any]) -> bool:
        """Validate a transaction if node is a whitelisted validator"""
        if self.node_id not in self.whitelisted_validators:
            logger.warning("Not a whitelisted validator")
            return False
            
        # Verify transaction signature
        if not self._verify_transaction(tx_request):
            return False
            
        # Record validation activity
        if self.node_id not in self.transaction_history:
            self.transaction_history[self.node_id] = []
        self.transaction_history[self.node_id].append(tx_request["id"])
        
        # Create validation proof
        validation = {
            "tx_id": tx_request["id"],
            "validator": self.node_id,
            "timestamp": time.time(),
            "result": "valid"
        }
        
        # Sign and broadcast validation
        signature = self.crypto_vault.sign(json.dumps(validation))
        validation["signature"] = signature
        
        await self.message_manager.broadcast_message(
            topic="tx_validation",
            message=validation
        )
        
        return True

    def _verify_transaction(self, tx_request: Dict[str, Any]) -> bool:
        """Verify transaction signature and format"""
        try:
            # Basic transaction verification
            required_fields = ["id", "data", "submitter", "timestamp", "signature"]
            if not all(field in tx_request for field in required_fields):
                return False
                
            # Verify signature (simplified for testing)
            return True
        except Exception as e:
            logger.error(f"Transaction verification failed: {e}")
            return False

    async def stop(self):
        """Stop the PoU service"""
        logger.info("Stopping Proof of Use service")

    # Constants
    MIN_STAKE = 1000  # Minimum stake requirement in JOY tokens
    MIN_REPUTATION = 100  # Minimum governance reputation score