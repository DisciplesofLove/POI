"""
LOL DAO governance system for the Joy Sovereign network
"""
import asyncio
import json
import logging
import time
from typing import Dict, List, Any, Optional, Set
from enum import Enum
import hashlib
from .decentralized_governance import DecentralizedGovernance
from .utils.ipfs_utils import IPFSStorage
from .p2p.message_manager import MessageManager
from .utils.crypto_vault import CryptoVault

logger = logging.getLogger(__name__)

class LolRole(Enum):
    """LOL DAO governance roles"""
    ELDER = "elder"
    WATCHMAN = "watchman"
    BUILDER = "builder"
    STEWARD = "steward"

class ProposalStage(Enum):
    """Multi-stage proposal approval process"""
    SUBMITTED = "submitted"
    WATCHMEN_REVIEW = "watchmen_review"
    ELDERS_REVIEW = "elders_review"
    STEWARDS_VOTE = "stewards_vote"
    APPROVED = "approved"
    REJECTED = "rejected"

class LolDAO(DecentralizedGovernance):
    """
    Implements the LOL DAO governance system with specialized roles and
    multi-stage approval processes for the Joy Sovereign network.
    """
    
    def __init__(self, node_id: str, private_key: str, message_manager: MessageManager, ipfs: IPFSStorage):
        """Initialize the LOL DAO governance system"""
        super().__init__(node_id, private_key, message_manager, ipfs)
        
        # Role management
        self.roles = {}  # node_id -> Set[LolRole]
        self.role_requirements = {
            LolRole.ELDER: {"min_reputation": 1000, "min_stake": 100000},
            LolRole.WATCHMAN: {"min_reputation": 800, "min_stake": 50000},
            LolRole.BUILDER: {"min_reputation": 500, "min_stake": 25000},
            LolRole.STEWARD: {"min_reputation": 300, "min_stake": 10000}
        }
        
        # Proposal stages tracking
        self.proposal_stages = {}  # proposal_id -> ProposalStage
        self.stage_approvals = {}  # proposal_id -> {role: {node_id: bool}}
        
        # Guardian freeze protocol
        self.freeze_active = False
        self.freeze_proposals = {}
        
        # Validator management
        self.whitelisted_validators = set()
        self.validator_stakes = {}
        self.validator_reputation = {}

    async def start(self):
        """Start the LOL DAO service"""
        await super().start()
        logger.info("Starting LOL DAO service")
        
        # Subscribe to additional LOL-specific messages
        await self.message_manager.subscribe("lol_role_update", self._handle_role_update)
        await self.message_manager.subscribe("lol_freeze_proposal", self._handle_freeze_proposal)
        await self.message_manager.subscribe("lol_validator_proposal", self._handle_validator_proposal)
        
        # Start LOL-specific tasks
        asyncio.create_task(self._process_stages_loop())
        asyncio.create_task(self._monitor_freeze_protocol())

    async def assign_role(self, node_id: str, role: LolRole, 
                         reputation: int, stake: int) -> bool:
        """
        Assign a LOL DAO role to a node if requirements are met
        
        Args:
            node_id: Node to assign role to
            role: Role to assign
            reputation: Node's governance reputation
            stake: Node's staked amount
            
        Returns:
            True if role was assigned
        """
        requirements = self.role_requirements[role]
        
        if (reputation >= requirements["min_reputation"] and 
            stake >= requirements["min_stake"]):
            
            if node_id not in self.roles:
                self.roles[node_id] = set()
            self.roles[node_id].add(role)
            
            # Broadcast role update
            await self._broadcast_role_update(node_id, role, True)
            
            logger.info(f"Assigned role {role.value} to node {node_id}")
            return True
        else:
            logger.warning(f"Node {node_id} does not meet requirements for {role.value}")
            return False

    async def remove_role(self, node_id: str, role: LolRole):
        """Remove a LOL DAO role from a node"""
        if node_id in self.roles and role in self.roles[node_id]:
            self.roles[node_id].remove(role)
            await self._broadcast_role_update(node_id, role, False)
            logger.info(f"Removed role {role.value} from node {node_id}")

    async def _broadcast_role_update(self, node_id: str, role: LolRole, assigned: bool):
        """Broadcast role assignment/removal"""
        message = {
            "node_id": node_id,
            "role": role.value,
            "assigned": assigned,
            "timestamp": time.time()
        }
        signature = self.crypto_vault.sign(json.dumps(message))
        message["signature"] = signature
        
        await self.message_manager.broadcast_message(
            topic="lol_role_update",
            message=message
        )

    async def create_proposal(self, proposal_type: str, title: str, description: str,
                            params: Dict[str, Any], voting_period: int = 86400) -> str:
        """Create a new LOL DAO proposal with multi-stage approval"""
        proposal_id = await super().create_proposal(
            proposal_type, title, description, params, voting_period
        )
        
        # Initialize proposal stage tracking
        self.proposal_stages[proposal_id] = ProposalStage.SUBMITTED
        self.stage_approvals[proposal_id] = {
            LolRole.WATCHMAN: {},
            LolRole.ELDER: {},
            LolRole.STEWARD: {}
        }
        
        return proposal_id

    async def _process_stages_loop(self):
        """Process proposal stages periodically"""
        while True:
            try:
                await self._advance_proposal_stages()
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Error processing proposal stages: {e}")
                await asyncio.sleep(1)

    async def _advance_proposal_stages(self):
        """Advance proposals through approval stages if requirements met"""
        for proposal_id, stage in self.proposal_stages.items():
            if stage == ProposalStage.SUBMITTED:
                # Move to Watchmen review
                self.proposal_stages[proposal_id] = ProposalStage.WATCHMEN_REVIEW
                
            elif stage == ProposalStage.WATCHMEN_REVIEW:
                # Check if enough Watchmen approved
                watchmen_approvals = self.stage_approvals[proposal_id][LolRole.WATCHMAN]
                if self._check_role_approval_threshold(LolRole.WATCHMAN, watchmen_approvals):
                    self.proposal_stages[proposal_id] = ProposalStage.ELDERS_REVIEW
                    
            elif stage == ProposalStage.ELDERS_REVIEW:
                # Check if enough Elders approved
                elder_approvals = self.stage_approvals[proposal_id][LolRole.ELDER]
                if self._check_role_approval_threshold(LolRole.ELDER, elder_approvals):
                    self.proposal_stages[proposal_id] = ProposalStage.STEWARDS_VOTE
                    
            elif stage == ProposalStage.STEWARDS_VOTE:
                # Check if enough Stewards voted
                steward_votes = self.stage_approvals[proposal_id][LolRole.STEWARD]
                if self._check_role_approval_threshold(LolRole.STEWARD, steward_votes):
                    # Move to final stage based on vote outcome
                    if self._calculate_vote_result(steward_votes):
                        self.proposal_stages[proposal_id] = ProposalStage.APPROVED
                        await self._execute_proposal(proposal_id, self.proposals[proposal_id])
                    else:
                        self.proposal_stages[proposal_id] = ProposalStage.REJECTED

    def _check_role_approval_threshold(self, role: LolRole, approvals: Dict[str, bool]) -> bool:
        """Check if enough members of a role have approved"""
        role_members = self._get_role_members(role)
        if not role_members:
            return False
            
        threshold = {
            LolRole.WATCHMAN: 0.6,  # 60% of Watchmen must approve
            LolRole.ELDER: 0.75,    # 75% of Elders must approve
            LolRole.STEWARD: 0.66   # 66% of Stewards must approve
        }[role]
        
        approval_count = sum(1 for approved in approvals.values() if approved)
        return approval_count / len(role_members) >= threshold

    def _get_role_members(self, role: LolRole) -> Set[str]:
        """Get all members with a specific role"""
        return {
            node_id for node_id, roles in self.roles.items()
            if role in roles
        }

    def _calculate_vote_result(self, votes: Dict[str, bool]) -> bool:
        """Calculate if vote passed based on yes/no ratio"""
        if not votes:
            return False
            
        yes_votes = sum(1 for vote in votes.values() if vote)
        return yes_votes / len(votes) >= 0.66  # 66% threshold

    async def propose_validator(self, node_id: str, stake: int, 
                              reputation: int) -> str:
        """Propose adding a new validator node"""
        proposal_data = {
            "type": "validator_proposal",
            "node_id": node_id,
            "stake": stake,
            "reputation": reputation,
            "hardware_specs": {},  # Would include Jetson hardware verification
            "timestamp": time.time()
        }
        
        # Create and return proposal
        return await self.create_proposal(
            proposal_type="validator_proposal",
            title=f"Add validator node {node_id}",
            description="Proposal to add new validator node",
            params=proposal_data
        )

    async def _handle_validator_proposal(self, message: Dict[str, Any]):
        """Handle approved validator proposals"""
        proposal_id = message.get("id")
        if (proposal_id in self.proposal_stages and 
            self.proposal_stages[proposal_id] == ProposalStage.APPROVED):
            
            node_id = message["params"]["node_id"]
            stake = message["params"]["stake"]
            reputation = message["params"]["reputation"]
            
            self.whitelisted_validators.add(node_id)
            self.validator_stakes[node_id] = stake
            self.validator_reputation[node_id] = reputation
            
            logger.info(f"Added validator node {node_id}")

    async def propose_freeze(self, reason: str) -> str:
        """Propose activating the Guardian Freeze Protocol"""
        proposal_data = {
            "type": "freeze_proposal",
            "reason": reason,
            "timestamp": time.time()
        }
        
        # Emergency proposals have shorter timeframes
        return await self.create_proposal(
            proposal_type="freeze_proposal",
            title="Activate Guardian Freeze Protocol",
            description=f"Emergency freeze proposal: {reason}",
            params=proposal_data,
            voting_period=3600  # 1 hour for emergency proposals
        )

    async def _handle_freeze_proposal(self, message: Dict[str, Any]):
        """Handle approved freeze proposals"""
        proposal_id = message.get("id")
        if (proposal_id in self.proposal_stages and 
            self.proposal_stages[proposal_id] == ProposalStage.APPROVED):
            
            self.freeze_active = True
            self.freeze_proposals[proposal_id] = message
            
            # Broadcast freeze activation
            await self.message_manager.broadcast_message(
                topic="system_freeze",
                message={"active": True, "proposal_id": proposal_id}
            )
            
            logger.warning(f"Guardian Freeze Protocol activated via proposal {proposal_id}")

    async def _monitor_freeze_protocol(self):
        """Monitor and manage the Guardian Freeze Protocol"""
        while True:
            try:
                if self.freeze_active:
                    # Check if freeze should be lifted
                    for proposal_id, freeze_data in self.freeze_proposals.items():
                        if time.time() - freeze_data["timestamp"] > 86400:  # 24 hour max freeze
                            self.freeze_active = False
                            await self.message_manager.broadcast_message(
                                topic="system_freeze",
                                message={"active": False, "proposal_id": proposal_id}
                            )
                            logger.info("Guardian Freeze Protocol deactivated (timeout)")
                            
            except Exception as e:
                logger.error(f"Error monitoring freeze protocol: {e}")
                
            await asyncio.sleep(60)  # Check every minute

    def is_frozen(self) -> bool:
        """Check if system is currently frozen"""
        return self.freeze_active

    async def stop(self):
        """Stop the LOL DAO service"""
        await super().stop()
        logger.info("Stopping LOL DAO service")