"""
Tests for the LOL DAO governance system
"""
import pytest
import asyncio
import time
from typing import Dict, Any
from ..lol_dao import LolDAO, LolRole, ProposalStage
from ..p2p.message_manager import MessageManager
from ..utils.ipfs_utils import IPFSStorage
from ..utils.crypto_vault import CryptoVault

@pytest.fixture
def message_manager():
    """Create message manager fixture"""
    return MessageManager("test_node")

@pytest.fixture
def ipfs_storage():
    """Create IPFS storage fixture"""
    return IPFSStorage()

@pytest.fixture
def crypto_vault():
    """Create crypto vault fixture"""
    return CryptoVault("test_vault.joy")

@pytest.fixture
def lol_dao(message_manager, ipfs_storage):
    """Create LOL DAO fixture"""
    return LolDAO(
        node_id="test_node",
        private_key="test_key",
        message_manager=message_manager,
        ipfs=ipfs_storage
    )

@pytest.mark.asyncio
async def test_role_assignment(lol_dao):
    """Test role assignment"""
    # Test Elder role assignment
    result = await lol_dao.assign_role(
        node_id="test_node",
        role=LolRole.ELDER,
        reputation=1500,
        stake=150000
    )
    assert result is True
    assert LolRole.ELDER in lol_dao.roles["test_node"]
    
    # Test insufficient requirements
    result = await lol_dao.assign_role(
        node_id="low_stake_node",
        role=LolRole.ELDER,
        reputation=1500,
        stake=1000  # Too low stake
    )
    assert result is False
    assert "low_stake_node" not in lol_dao.roles

@pytest.mark.asyncio
async def test_proposal_creation(lol_dao):
    """Test proposal creation and stages"""
    # Create test proposal
    proposal_id = await lol_dao.create_proposal(
        proposal_type="parameter_change",
        title="Test Proposal",
        description="Test description",
        params={"param_name": "test_param", "param_value": 123}
    )
    
    assert proposal_id in lol_dao.proposals
    assert lol_dao.proposal_stages[proposal_id] == ProposalStage.SUBMITTED

@pytest.mark.asyncio
async def test_proposal_stages(lol_dao):
    """Test proposal stage advancement"""
    # Setup roles
    await lol_dao.assign_role("watchman1", LolRole.WATCHMAN, 1000, 60000)
    await lol_dao.assign_role("watchman2", LolRole.WATCHMAN, 1000, 60000)
    await lol_dao.assign_role("elder1", LolRole.ELDER, 1500, 150000)
    await lol_dao.assign_role("elder2", LolRole.ELDER, 1500, 150000)
    
    # Create proposal
    proposal_id = await lol_dao.create_proposal(
        proposal_type="parameter_change",
        title="Test Proposal",
        description="Test description",
        params={"param_name": "test_param", "param_value": 123}
    )
    
    # Simulate stage advancement
    lol_dao.stage_approvals[proposal_id][LolRole.WATCHMAN] = {
        "watchman1": True,
        "watchman2": True
    }
    
    await lol_dao._advance_proposal_stages()
    assert lol_dao.proposal_stages[proposal_id] == ProposalStage.ELDERS_REVIEW
    
    lol_dao.stage_approvals[proposal_id][LolRole.ELDER] = {
        "elder1": True,
        "elder2": True
    }
    
    await lol_dao._advance_proposal_stages()
    assert lol_dao.proposal_stages[proposal_id] == ProposalStage.STEWARDS_VOTE

@pytest.mark.asyncio
async def test_validator_proposal(lol_dao):
    """Test validator node proposal"""
    # Create validator proposal
    proposal_id = await lol_dao.propose_validator(
        node_id="test_validator",
        stake=100000,
        reputation=500
    )
    
    assert proposal_id in lol_dao.proposals
    assert lol_dao.proposals[proposal_id]["params"]["type"] == "validator_proposal"
    
    # Simulate approval
    lol_dao.proposal_stages[proposal_id] = ProposalStage.APPROVED
    await lol_dao._handle_validator_proposal(lol_dao.proposals[proposal_id])
    
    assert "test_validator" in lol_dao.whitelisted_validators
    assert lol_dao.validator_stakes["test_validator"] == 100000

@pytest.mark.asyncio
async def test_freeze_protocol(lol_dao):
    """Test Guardian Freeze Protocol"""
    # Propose freeze
    proposal_id = await lol_dao.propose_freeze(
        reason="Security threat detected"
    )
    
    assert proposal_id in lol_dao.proposals
    assert lol_dao.proposals[proposal_id]["params"]["type"] == "freeze_proposal"
    
    # Simulate approval
    lol_dao.proposal_stages[proposal_id] = ProposalStage.APPROVED
    await lol_dao._handle_freeze_proposal(lol_dao.proposals[proposal_id])
    
    assert lol_dao.is_frozen() is True
    assert proposal_id in lol_dao.freeze_proposals

@pytest.mark.asyncio
async def test_role_removal(lol_dao):
    """Test role removal"""
    # First assign role
    await lol_dao.assign_role(
        node_id="test_node",
        role=LolRole.WATCHMAN,
        reputation=1000,
        stake=60000
    )
    
    assert LolRole.WATCHMAN in lol_dao.roles["test_node"]
    
    # Remove role
    await lol_dao.remove_role("test_node", LolRole.WATCHMAN)
    assert LolRole.WATCHMAN not in lol_dao.roles["test_node"]

@pytest.mark.asyncio
async def test_proposal_execution(lol_dao):
    """Test proposal execution"""
    # Create and approve proposal
    proposal_id = await lol_dao.create_proposal(
        proposal_type="parameter_change",
        title="Test Parameter Change",
        description="Change test parameter",
        params={
            "param_name": "test_param",
            "param_value": 123,
            "type": "parameter_change"
        }
    )
    
    # Simulate full approval process
    lol_dao.proposal_stages[proposal_id] = ProposalStage.APPROVED
    await lol_dao._execute_proposal(proposal_id, lol_dao.proposals[proposal_id])
    
    assert proposal_id in lol_dao.executed_proposals