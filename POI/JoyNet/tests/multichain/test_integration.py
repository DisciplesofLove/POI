"""
Integration tests for JoyNet's multi-chain functionality
"""

import pytest
import asyncio
from web3 import Web3
from solana.rpc.async_api import AsyncClient as SolanaClient
from iota_client import IotaClient
from ...src.multichain.ChainOrchestrator import ChainOrchestrator

# Test configuration
TEST_CONFIG = {
    'polygon': {
        'rpc_url': 'http://localhost:8545',  # Local testnet
        'chain_id': 1337,
        'account': '0x1234...',  # Test account
        'private_key': '0xabcd...'  # Test private key
    },
    'solana': {
        'rpc_url': 'http://localhost:8899',  # Local testnet
        'keypair_path': './test-keypair.json'
    },
    'iota': {
        'node_url': 'http://localhost:14265',  # Local testnet
        'local_pow': True
    },
    'contracts': {
        'polygon_address': '0x...',
        'polygon_abi': './test_abi.json',
        'solana_bridge': '0x...',
        'iota_bridge': '0x...'
    }
}

@pytest.fixture
async def orchestrator():
    """Create ChainOrchestrator instance for testing"""
    orchestrator = ChainOrchestrator(TEST_CONFIG)
    yield orchestrator
    # Cleanup
    await orchestrator.shutdown()

@pytest.fixture
async def polygon_contract(orchestrator):
    """Get Polygon contract instance"""
    return orchestrator.polygon_contract

@pytest.fixture
async def solana_client(orchestrator):
    """Get Solana client instance"""
    return orchestrator.solana_client

@pytest.fixture
async def iota_client(orchestrator):
    """Get IOTA client instance"""
    return orchestrator.iota_client

@pytest.mark.asyncio
async def test_model_tokenization(orchestrator, polygon_contract):
    """Test tokenizing an AI model on Polygon Supernet"""
    # Test data
    model_id = Web3.keccak(text='test_model').hex()
    metadata_uri = 'ipfs://QmTest...'
    collaborators = ['0x1111...', '0x2222...']
    royalty_shares = [60, 40]  # 60-40 split
    
    # Submit tokenization transaction
    await orchestrator.tx_queues['polygon'].put({
        'type': 'marketplace',
        'action': 'tokenize',
        'model_id': model_id,
        'metadata_uri': metadata_uri,
        'collaborators': collaborators,
        'royalty_shares': royalty_shares
    })
    
    # Wait for processing
    await orchestrator.tx_queues['polygon'].join()
    
    # Verify model was tokenized
    model = await polygon_contract.functions.models(model_id).call()
    assert model['owner'] == TEST_CONFIG['polygon']['account']
    assert model['metadataURI'] == metadata_uri
    assert model['isActive'] == True

@pytest.mark.asyncio
async def test_solana_inference_payment(orchestrator, solana_client):
    """Test AI inference payment on Solana"""
    # Test data
    model_id = 'test_model_123'
    amount = 1000000  # lamports
    payer = 'test_payer_pubkey'
    
    # Submit inference payment
    await orchestrator.tx_queues['solana'].put({
        'type': 'inference',
        'model_id': model_id,
        'amount': amount,
        'payer': payer
    })
    
    # Wait for processing
    await orchestrator.tx_queues['solana'].join()
    
    # Verify payment was processed
    tx_history = await solana_client.get_transaction_history(payer)
    assert any(tx['amount'] == amount for tx in tx_history)

@pytest.mark.asyncio
async def test_iota_data_stream(orchestrator, iota_client):
    """Test IoT data stream on IOTA"""
    # Test data
    provider = 'provider_address'
    consumer = 'consumer_address'
    rate = 100  # tokens per second
    
    # Start data stream
    await orchestrator.tx_queues['iota'].put({
        'type': 'stream',
        'provider': provider,
        'consumer': consumer,
        'rate': rate
    })
    
    # Wait for processing
    await orchestrator.tx_queues['iota'].join()
    
    # Verify stream was created
    messages = await iota_client.get_messages_by_address(provider)
    assert any(
        m['type'] == 'stream' and
        m['consumer'] == consumer and
        m['rate'] == rate
        for m in messages
    )

@pytest.mark.asyncio
async def test_cross_chain_royalty_distribution(orchestrator, polygon_contract):
    """Test royalty distribution across chains"""
    # Test data
    model_id = Web3.keccak(text='test_model_royalties').hex()
    amount = 1000000
    
    # Create test model with royalties
    await test_model_tokenization(orchestrator, polygon_contract)
    
    # Simulate Solana payment
    await test_solana_inference_payment(orchestrator, orchestrator.solana_client)
    
    # Verify royalties were distributed on Polygon
    await orchestrator.notify_polygon_royalties(model_id, amount)
    await orchestrator.tx_queues['polygon'].join()
    
    model = await polygon_contract.functions.models(model_id).call()
    assert model['revenue'] == amount

@pytest.mark.asyncio
async def test_governance_proposal(orchestrator, polygon_contract):
    """Test DAO governance on Polygon Supernet"""
    # Test proposal data
    description = "Test proposal"
    targets = [TEST_CONFIG['contracts']['polygon_address']]
    values = [0]
    calldatas = [
        polygon_contract.functions.setMinStake(2000).encodeABI()
    ]
    
    # Submit proposal
    await orchestrator.tx_queues['polygon'].put({
        'type': 'governance',
        'targets': targets,
        'values': values,
        'calldatas': calldatas,
        'description': description
    })
    
    # Wait for processing
    await orchestrator.tx_queues['polygon'].join()
    
    # Verify proposal was created
    proposal_count = await polygon_contract.functions.proposalCount().call()
    assert proposal_count > 0
    
    latest_proposal = await polygon_contract.functions.proposals(proposal_count).call()
    assert latest_proposal['description'] == description

@pytest.mark.asyncio
async def test_error_handling(orchestrator):
    """Test error handling and recovery"""
    # Test invalid transaction
    with pytest.raises(Exception):
        await orchestrator.tx_queues['polygon'].put({
            'type': 'invalid',
            'action': 'invalid'
        })
        await orchestrator.tx_queues['polygon'].join()
    
    # Verify system remains operational
    assert orchestrator.tx_queues['polygon'].empty()
    assert orchestrator.tx_queues['solana'].empty()
    assert orchestrator.tx_queues['iota'].empty()

@pytest.mark.asyncio
async def test_performance_under_load(orchestrator):
    """Test system performance with multiple concurrent transactions"""
    # Generate test transactions
    tx_count = 100
    tasks = []
    
    # Mix of different transaction types
    for i in range(tx_count):
        if i % 3 == 0:
            # Polygon transaction
            tasks.append(test_model_tokenization(orchestrator, orchestrator.polygon_contract))
        elif i % 3 == 1:
            # Solana transaction
            tasks.append(test_solana_inference_payment(orchestrator, orchestrator.solana_client))
        else:
            # IOTA transaction
            tasks.append(test_iota_data_stream(orchestrator, orchestrator.iota_client))
    
    # Execute all transactions concurrently
    start_time = asyncio.get_event_loop().time()
    await asyncio.gather(*tasks)
    end_time = asyncio.get_event_loop().time()
    
    # Verify performance
    duration = end_time - start_time
    tx_per_second = tx_count / duration
    assert tx_per_second >= 10  # Minimum acceptable TPS

@pytest.mark.asyncio
async def test_bridge_security(orchestrator):
    """Test security measures in cross-chain bridges"""
    # Test transaction size limits
    large_amount = int(TEST_CONFIG['bridge']['max_transfer_amount']) + 1
    
    with pytest.raises(Exception):
        await orchestrator.handle_solana_inference({
            'type': 'inference',
            'model_id': 'test_model',
            'amount': large_amount,
            'payer': 'test_payer'
        })
    
    # Test validator requirements
    min_validators = TEST_CONFIG['bridge']['min_validators']
    required_confirmations = TEST_CONFIG['bridge']['required_confirmations']
    
    assert required_confirmations <= min_validators
    assert required_confirmations > min_validators // 2  # Ensure majority

@pytest.mark.asyncio
async def test_system_recovery(orchestrator):
    """Test system recovery after simulated failures"""
    # Simulate chain disconnection
    orchestrator.polygon_web3.provider = Web3.HTTPProvider('http://invalid:8545')
    
    # Attempt transaction
    await orchestrator.tx_queues['polygon'].put({
        'type': 'marketplace',
        'action': 'tokenize',
        'model_id': 'test_model',
        'metadata_uri': 'ipfs://test',
        'collaborators': ['0x1111'],
        'royalty_shares': [100]
    })
    
    # Verify transaction is retried
    await asyncio.sleep(5)
    assert not orchestrator.tx_queues['polygon'].empty()
    
    # Restore connection
    orchestrator.polygon_web3.provider = Web3.HTTPProvider(TEST_CONFIG['polygon']['rpc_url'])
    
    # Verify transaction completes
    await orchestrator.tx_queues['polygon'].join()
    assert orchestrator.tx_queues['polygon'].empty()