"""
Tests for JoyNet Governance System
"""
import pytest
from web3 import Web3
from eth_account import Account
import json
import yaml

@pytest.fixture
def governance_config():
    """Load governance configuration."""
    with open('config/governance.yaml') as f:
        return yaml.safe_load(f)

@pytest.fixture
def web3():
    """Initialize Web3."""
    return Web3(Web3.HTTPProvider('http://localhost:8545'))

@pytest.fixture
def accounts(web3):
    """Create test accounts."""
    return [Account.create() for _ in range(10)]

@pytest.fixture
def joy_token(web3, accounts):
    """Deploy test JOY token."""
    with open('contracts/JoyToken.sol') as f:
        contract_source = f.read()
        
    # Deploy token contract
    contract = web3.eth.contract(
        abi=json.loads(contract_source)['abi'],
        bytecode=contract_source['bytecode']
    )
    
    tx_hash = contract.constructor().transact({'from': accounts[0].address})
    tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    
    return web3.eth.contract(
        address=tx_receipt.contractAddress,
        abi=json.loads(contract_source)['abi']
    )

@pytest.fixture
def governance(web3, accounts, joy_token, governance_config):
    """Deploy governance contracts."""
    # Deploy timelock
    timelock = web3.eth.contract(
        abi=json.loads(open('contracts/TimelockController.sol').read())['abi'],
        bytecode=open('contracts/TimelockController.sol').read()['bytecode']
    )
    
    tx_hash = timelock.constructor(
        governance_config['root_dao']['execution']['timelock_delay'],
        [accounts[0].address],
        [accounts[0].address]
    ).transact({'from': accounts[0].address})
    
    timelock_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Deploy governance
    governance = web3.eth.contract(
        abi=json.loads(open('contracts/JoyNetGovernance.sol').read())['abi'],
        bytecode=open('contracts/JoyNetGovernance.sol').read()['bytecode']
    )
    
    tx_hash = governance.constructor(
        joy_token.address,
        timelock_receipt.contractAddress,
        governance_config['root_dao']['voting']['delay'],
        governance_config['root_dao']['voting']['period'],
        governance_config['root_dao']['voting']['proposal_threshold'],
        governance_config['root_dao']['voting']['quorum_numerator']
    ).transact({'from': accounts[0].address})
    
    governance_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    
    return web3.eth.contract(
        address=governance_receipt.contractAddress,
        abi=json.loads(open('contracts/JoyNetGovernance.sol').read())['abi']
    )

def test_initial_governance_state(governance, governance_config):
    """Test initial governance configuration."""
    assert governance.functions.votingDelay().call() == governance_config['root_dao']['voting']['delay']
    assert governance.functions.votingPeriod().call() == governance_config['root_dao']['voting']['period']
    assert governance.functions.proposalThreshold().call() == governance_config['root_dao']['voting']['proposal_threshold']
    assert governance.functions.quorumNumerator().call() == governance_config['root_dao']['voting']['quorum_numerator']

def test_platform_fee_update_proposal(web3, governance, accounts, joy_token):
    """Test creating and executing a platform fee update proposal."""
    # Prepare proposal
    new_fee = 300  # 3%
    calldata = governance.encodeABI(fn_name='updatePlatformFee', args=[new_fee])
    
    # Create proposal
    tx_hash = governance.functions.propose(
        [governance.address],
        [0],
        [calldata],
        "Update platform fee to 3%"
    ).transact({'from': accounts[0].address})
    
    proposal_id = web3.eth.wait_for_transaction_receipt(tx_hash)['logs'][0]['args']['proposalId']
    
    # Advance time past voting delay
    web3.testing.mine(governance.functions.votingDelay().call() + 1)
    
    # Cast votes
    for account in accounts[:6]:  # 60% yes votes
        governance.functions.castVote(
            proposal_id,
            1  # Yes vote
        ).transact({'from': account.address})
    
    # Advance time past voting period
    web3.testing.mine(governance.functions.votingPeriod().call() + 1)
    
    # Queue proposal
    tx_hash = governance.functions.queue(
        [governance.address],
        [0],
        [calldata],
        web3.keccak(text="Update platform fee to 3%")
    ).transact({'from': accounts[0].address})
    
    web3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Advance time past timelock
    web3.testing.mine(governance.functions.getTimelockDelay().call() + 1)
    
    # Execute proposal
    tx_hash = governance.functions.execute(
        [governance.address],
        [0],
        [calldata],
        web3.keccak(text="Update platform fee to 3%")
    ).transact({'from': accounts[0].address})
    
    web3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Verify fee update
    assert governance.functions.platformFeePercent().call() == new_fee

def test_treasury_allocation_update(web3, governance, accounts):
    """Test updating treasury allocation."""
    new_allocation = {
        'nodeRewards': 45,
        'stakingRewards': 25,
        'development': 20,
        'community': 10
    }
    
    calldata = governance.encodeABI(
        fn_name='updateTreasuryAllocation',
        args=[list(new_allocation.values())]
    )
    
    # Create and execute proposal
    tx_hash = governance.functions.propose(
        [governance.address],
        [0],
        [calldata],
        "Update treasury allocation"
    ).transact({'from': accounts[0].address})
    
    # Verify proposal created
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    assert len(receipt['logs']) > 0

def test_tld_approval(web3, governance, accounts):
    """Test TLD approval process."""
    tld = "joy"
    dao_address = accounts[1].address
    
    calldata = governance.encodeABI(
        fn_name='approveTld',
        args=[tld, dao_address]
    )
    
    # Create proposal
    tx_hash = governance.functions.propose(
        [governance.address],
        [0],
        [calldata],
        f"Approve .{tld} TLD"
    ).transact({'from': accounts[0].address})
    
    # Verify proposal created
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    assert len(receipt['logs']) > 0

def test_proposal_support_requirements(governance):
    """Test different support requirements for different actions."""
    assert governance.functions.requiredSupport(
        governance.functions.UPDATE_PLATFORM_FEE().call()
    ).call() == 75
    
    assert governance.functions.requiredSupport(
        governance.functions.UPDATE_RPC_LOGIC().call()
    ).call() == 80
    
    assert governance.functions.requiredSupport(
        governance.functions.UPDATE_TREASURY_ALLOCATION().call()
    ).call() == 70
    
    assert governance.functions.requiredSupport(
        governance.functions.APPROVE_TLD().call()
    ).call() == 60

def test_quorum_calculation(web3, governance, accounts, joy_token):
    """Test quorum calculation with different vote distributions."""
    # Create proposal
    calldata = governance.encodeABI(fn_name='updatePlatformFee', args=[300])
    
    tx_hash = governance.functions.propose(
        [governance.address],
        [0],
        [calldata],
        "Test proposal"
    ).transact({'from': accounts[0].address})
    
    proposal_id = web3.eth.wait_for_transaction_receipt(tx_hash)['logs'][0]['args']['proposalId']
    
    # Advance time past voting delay
    web3.testing.mine(governance.functions.votingDelay().call() + 1)
    
    # Test different voting scenarios
    scenarios = [
        {'for': 7, 'against': 3, 'expected': True},  # 70% support
        {'for': 5, 'against': 5, 'expected': False},  # 50% support
        {'for': 8, 'against': 2, 'expected': True},  # 80% support
        {'for': 4, 'against': 6, 'expected': False}  # 40% support
    ]
    
    for scenario in scenarios:
        # Reset votes
        web3.provider.make_request("evm_revert", [web3.eth.block_number])
        
        # Cast votes according to scenario
        for i in range(scenario['for']):
            governance.functions.castVote(
                proposal_id,
                1  # Yes vote
            ).transact({'from': accounts[i].address})
            
        for i in range(scenario['against']):
            governance.functions.castVote(
                proposal_id,
                0  # No vote
            ).transact({'from': accounts[i + scenario['for']].address})
        
        # Check quorum
        assert governance.functions.quorumReached(proposal_id).call() == scenario['expected']