"""
Decentralized governance system for the JoyNet platform
"""
import asyncio
import json
import logging
import time
from typing import Dict, List, Any, Optional
import hashlib
from .utils.ipfs_utils import IPFSStorage
from .p2p.message_manager import MessageManager
from .utils.crypto_vault import CryptoVault

logger = logging.getLogger(__name__)

class DecentralizedGovernance:
    """
    Implements a decentralized governance system for the JoyNet platform,
    allowing for community-driven decision making without central authorities.
    """
    
    def __init__(self, node_id: str, private_key: str, message_manager: MessageManager, ipfs: IPFSStorage):
        """Initialize the decentralized governance system"""
        self.node_id = node_id
        self.crypto_vault = CryptoVault(private_key)
        self.message_manager = message_manager
        self.ipfs = ipfs
        self.proposals = {}
        self.votes = {}
        self.executed_proposals = set()
        
    async def start(self):
        """Start the governance service"""
        logger.info("Starting decentralized governance service")
        
        # Subscribe to governance messages
        await self.message_manager.subscribe("governance_proposal", self._handle_proposal)
        await self.message_manager.subscribe("governance_vote", self._handle_vote)
        
        # Start periodic tasks
        asyncio.create_task(self._process_proposals_loop())
        
    async def _process_proposals_loop(self):
        """Periodically process proposals that have reached consensus"""
        while True:
            try:
                await self._process_ready_proposals()
            except Exception as e:
                logger.error(f"Error processing proposals: {e}")
                
            # Sleep before next check
            await asyncio.sleep(60)  # Check every minute
            
    async def _process_ready_proposals(self):
        """Process proposals that have reached consensus"""
        current_time = time.time()
        
        for proposal_id, proposal in self.proposals.items():
            # Skip already executed proposals
            if proposal_id in self.executed_proposals:
                continue
                
            # Skip proposals that haven't reached their voting deadline
            if current_time < proposal.get("deadline", float("inf")):
                continue
                
            # Count votes
            yes_votes = 0
            no_votes = 0
            proposal_votes = self.votes.get(proposal_id, {})
            
            for voter, vote in proposal_votes.items():
                if vote.get("vote") == "yes":
                    yes_votes += vote.get("weight", 1)
                else:
                    no_votes += vote.get("weight", 1)
                    
            total_votes = yes_votes + no_votes
            
            # Check if quorum is reached
            quorum = proposal.get("quorum", 10)  # Default 10 votes
            if total_votes < quorum:
                logger.info(f"Proposal {proposal_id} did not reach quorum: {total_votes}/{quorum}")
                continue
                
            # Check if proposal passed
            threshold = proposal.get("threshold", 0.5)  # Default 50%
            if yes_votes / total_votes >= threshold:
                logger.info(f"Proposal {proposal_id} passed with {yes_votes}/{total_votes} votes")
                await self._execute_proposal(proposal_id, proposal)
            else:
                logger.info(f"Proposal {proposal_id} rejected with {yes_votes}/{total_votes} votes")
                
            # Mark as executed (whether it passed or failed)
            self.executed_proposals.add(proposal_id)
            
    async def _execute_proposal(self, proposal_id: str, proposal: Dict[str, Any]):
        """Execute an approved proposal"""
        proposal_type = proposal.get("type")
        
        if proposal_type == "parameter_change":
            # Update a system parameter
            param_name = proposal.get("param_name")
            param_value = proposal.get("param_value")
            logger.info(f"Executing parameter change: {param_name} = {param_value}")
            # In a real implementation, this would update the parameter in a config store
            
        elif proposal_type == "code_update":
            # Deploy a code update
            code_hash = proposal.get("code_hash")
            version = proposal.get("version")
            logger.info(f"Executing code update to version {version} (hash: {code_hash})")
            # In a real implementation, this would trigger a code update process
            
        elif proposal_type == "funds_allocation":
            # Allocate funds from treasury
            recipient = proposal.get("recipient")
            amount = proposal.get("amount")
            logger.info(f"Executing funds allocation: {amount} to {recipient}")
            # In a real implementation, this would trigger a funds transfer
            
        else:
            logger.warning(f"Unknown proposal type: {proposal_type}")
            
    async def _handle_proposal(self, message: Dict[str, Any]):
        """Handle a governance proposal message"""
        proposal_id = message.get("id")
        signature = message.get("signature")
        proposer = message.get("proposer")
        
        # Verify signature
        message_copy = message.copy()
        message_copy.pop("signature", None)
        
        # In a real implementation, we would verify the signature
        # For now, we'll assume it's valid
        is_valid = True
        
        if is_valid:
            # Store the proposal
            self.proposals[proposal_id] = message
            logger.info(f"Received valid proposal {proposal_id} from {proposer}")
        else:
            logger.warning(f"Received invalid proposal from {proposer}")
            
    async def _handle_vote(self, message: Dict[str, Any]):
        """Handle a governance vote message"""
        proposal_id = message.get("proposal_id")
        voter = message.get("voter")
        vote = message.get("vote")
        signature = message.get("signature")
        
        # Verify signature
        message_copy = message.copy()
        message_copy.pop("signature", None)
        
        # In a real implementation, we would verify the signature
        # For now, we'll assume it's valid
        is_valid = True
        
        if is_valid:
            # Store the vote
            if proposal_id not in self.votes:
                self.votes[proposal_id] = {}
                
            self.votes[proposal_id][voter] = message
            logger.info(f"Received valid vote ({vote}) for proposal {proposal_id} from {voter}")
        else:
            logger.warning(f"Received invalid vote from {voter}")
            
    async def create_proposal(self, proposal_type: str, title: str, description: str, 
                             params: Dict[str, Any], voting_period: int = 86400) -> str:
        """
        Create a new governance proposal
        
        Args:
            proposal_type: Type of proposal (parameter_change, code_update, funds_allocation)
            title: Proposal title
            description: Proposal description
            params: Proposal-specific parameters
            voting_period: Voting period in seconds (default: 1 day)
            
        Returns:
            Proposal ID
        """
        # Create proposal data
        proposal_data = {
            "type": proposal_type,
            "title": title,
            "description": description,
            "proposer": self.node_id,
            "created_at": time.time(),
            "deadline": time.time() + voting_period,
            "quorum": params.get("quorum", 10),
            "threshold": params.get("threshold", 0.5),
            **params
        }
        
        # Generate proposal ID
        proposal_id = hashlib.sha256(json.dumps(proposal_data).encode()).hexdigest()
        proposal_data["id"] = proposal_id
        
        # Sign the proposal
        signature = self.crypto_vault.sign(json.dumps(proposal_data))
        proposal_data["signature"] = signature
        
        # Store locally
        self.proposals[proposal_id] = proposal_data
        
        # Upload to IPFS
        ipfs_hash = await self.ipfs.upload_json(proposal_data)
        proposal_data["ipfs_hash"] = ipfs_hash
        
        # Broadcast to network
        await self.message_manager.broadcast_message(
            topic="governance_proposal",
            message=proposal_data
        )
        
        logger.info(f"Created proposal {proposal_id}: {title}")
        return proposal_id
        
    async def vote_on_proposal(self, proposal_id: str, vote: str) -> bool:
        """
        Vote on a governance proposal
        
        Args:
            proposal_id: ID of the proposal
            vote: "yes" or "no"
            
        Returns:
            True if vote was successful
        """
        if proposal_id not in self.proposals:
            logger.warning(f"Proposal {proposal_id} not found")
            return False
            
        proposal = self.proposals[proposal_id]
        
        # Check if voting period is still open
        if time.time() > proposal.get("deadline", 0):
            logger.warning(f"Voting period for proposal {proposal_id} has ended")
            return False
            
        # Create vote data
        vote_data = {
            "proposal_id": proposal_id,
            "voter": self.node_id,
            "vote": vote,
            "timestamp": time.time(),
            "weight": 1  # In a real implementation, this would be based on stake
        }
        
        # Sign the vote
        signature = self.crypto_vault.sign(json.dumps(vote_data))
        vote_data["signature"] = signature
        
        # Store locally
        if proposal_id not in self.votes:
            self.votes[proposal_id] = {}
        self.votes[proposal_id][self.node_id] = vote_data
        
        # Broadcast to network
        await self.message_manager.broadcast_message(
            topic="governance_vote",
            message=vote_data
        )
        
        logger.info(f"Voted {vote} on proposal {proposal_id}")
        return True
        
    def get_proposal(self, proposal_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a proposal by ID
        
        Args:
            proposal_id: ID of the proposal
            
        Returns:
            Proposal data or None if not found
        """
        return self.proposals.get(proposal_id)
        
    def get_active_proposals(self) -> List[Dict[str, Any]]:
        """
        Get all active proposals
        
        Returns:
            List of active proposals
        """
        current_time = time.time()
        return [
            proposal for proposal_id, proposal in self.proposals.items()
            if current_time <= proposal.get("deadline", 0) and proposal_id not in self.executed_proposals
        ]
        
    def get_proposal_votes(self, proposal_id: str) -> Dict[str, Any]:
        """
        Get votes for a proposal
        
        Args:
            proposal_id: ID of the proposal
            
        Returns:
            Dictionary of votes by voter
        """
        return self.votes.get(proposal_id, {})
        
    def get_proposal_result(self, proposal_id: str) -> Dict[str, Any]:
        """
        Get the result of a proposal
        
        Args:
            proposal_id: ID of the proposal
            
        Returns:
            Result data including vote counts and status
        """
        if proposal_id not in self.proposals:
            return {"error": "Proposal not found"}
            
        proposal = self.proposals[proposal_id]
        proposal_votes = self.votes.get(proposal_id, {})
        
        yes_votes = 0
        no_votes = 0
        
        for voter, vote in proposal_votes.items():
            if vote.get("vote") == "yes":
                yes_votes += vote.get("weight", 1)
            else:
                no_votes += vote.get("weight", 1)
                
        total_votes = yes_votes + no_votes
        quorum = proposal.get("quorum", 10)
        threshold = proposal.get("threshold", 0.5)
        
        # Determine status
        current_time = time.time()
        deadline = proposal.get("deadline", 0)
        
        if current_time <= deadline:
            status = "active"
        elif total_votes < quorum:
            status = "failed_quorum"
        elif yes_votes / total_votes >= threshold:
            status = "passed"
        else:
            status = "rejected"
            
        return {
            "proposal_id": proposal_id,
            "yes_votes": yes_votes,
            "no_votes": no_votes,
            "total_votes": total_votes,
            "quorum": quorum,
            "threshold": threshold,
            "status": status,
            "executed": proposal_id in self.executed_proposals
        }
        
    async def stop(self):
        """Stop the governance service"""
        logger.info("Stopping decentralized governance service")