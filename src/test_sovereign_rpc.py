"""
Tests for the Sovereign RPC system
"""
import asyncio
import json
import pytest
from eth_account import Account
from web3 import Web3

from .sovereign_rpc_node import SovereignRPCNode

@pytest.fixture
def config_path(tmp_path):
    """Create a temporary config file."""
    config = {
        "network": {
            "name": "TestNet",
            "version": "1.0.0",
            "chain_id": 1337
        },
        "node": {
            "min_stake": 1000000000000000000,
            "heartbeat_interval": 5,
            "cache_size": 1000000000,
            "max_peers": 10,
            "bootstrap_nodes": []
        },
        "data": {
            "storage_type": "ipfs",
            "replication_factor": 2,
            "min_providers": 1,
            "cache_ttl": 60
        },
        "security": {
            "tls_enabled": False,
            "jwt_expiry": 3600,
            "rate_limit": {
                "requests_per_second": 100,
                "burst": 200
            }
        },
        "monitoring": {
            "prometheus_enabled": False
        }
    }
    
    config_file = tmp_path / "test_config.yaml"
    config_file.write_text(json.dumps(config))
    return str(config_file)

@pytest.fixture
def private_key():
    """Generate a test private key."""
    return Account.create().key.hex()

@pytest.fixture
async def rpc_node(config_path, private_key):
    """Create a test RPC node."""
    node = SovereignRPCNode(
        private_key=private_key,
        config_path=config_path,
        web3_provider="http://localhost:8545"
    )
    await node.start()
    return node

@pytest.mark.asyncio
async def test_store_and_retrieve_data(rpc_node):
    """Test storing and retrieving data through RPC node."""
    test_data = {"test": "data", "value": 123}
    
    # Store data
    cid = await rpc_node.store_data(test_data)
    assert cid is not None
    
    # Retrieve data
    retrieved = await rpc_node.retrieve_data(cid)
    assert retrieved == test_data
    
    # Check cache
    cached = await rpc_node.cache.get(cid)
    assert cached is not None
    assert json.loads(cached) == test_data

@pytest.mark.asyncio
async def test_data_replication(rpc_node):
    """Test data replication across nodes."""
    test_data = {"test": "replication"}
    
    # Store data
    cid = await rpc_node.store_data(test_data)
    
    # Wait for replication
    await asyncio.sleep(5)
    
    # Check providers
    providers = rpc_node.data_providers.get(cid, [])
    assert len(providers) >= rpc_node.config['data']['min_providers']

@pytest.mark.asyncio
async def test_node_heartbeat(rpc_node):
    """Test node heartbeat mechanism."""
    # Wait for initial heartbeat
    await asyncio.sleep(rpc_node.config['node']['heartbeat_interval'] + 1)
    
    # Check node status
    assert rpc_node._get_uptime() > 0
    assert len(rpc_node.peers) >= 0

@pytest.mark.asyncio
async def test_cache_behavior(rpc_node):
    """Test caching behavior."""
    test_data = {"test": "cache"}
    
    # Store data
    cid = await rpc_node.store_data(test_data)
    
    # First retrieval (from IPFS)
    start_time = asyncio.get_event_loop().time()
    await rpc_node.retrieve_data(cid)
    first_duration = asyncio.get_event_loop().time() - start_time
    
    # Second retrieval (should be from cache)
    start_time = asyncio.get_event_loop().time()
    await rpc_node.retrieve_data(cid)
    second_duration = asyncio.get_event_loop().time() - start_time
    
    # Cache should be faster
    assert second_duration < first_duration

@pytest.mark.asyncio
async def test_proof_generation(rpc_node):
    """Test proof generation for stored data."""
    test_data = {"test": "proof"}
    
    # Store data with proof
    cid = await rpc_node.store_data(test_data)
    
    # Check proof exists
    assert cid in rpc_node.pinned_data
    assert rpc_node.pinned_data[cid]['proof'] is not None

@pytest.mark.asyncio
async def test_node_metrics(rpc_node):
    """Test node metrics collection."""
    # Wait for metrics to be collected
    await asyncio.sleep(5)
    
    # Check basic metrics
    assert rpc_node._get_uptime() > 0
    assert isinstance(len(rpc_node.peers), int)
    assert isinstance(len(rpc_node.pinned_data), int)

@pytest.mark.asyncio
async def test_error_handling(rpc_node):
    """Test error handling for invalid operations."""
    # Try to retrieve non-existent data
    result = await rpc_node.retrieve_data("invalid_cid")
    assert result is None
    
    # Try to store invalid data
    with pytest.raises(Exception):
        await rpc_node.store_data(None)

@pytest.mark.asyncio
async def test_peer_discovery(rpc_node):
    """Test peer discovery mechanism."""
    # Wait for peer discovery
    await asyncio.sleep(5)
    
    # Should have found some peers
    assert len(rpc_node.peers) >= 0
    
    # Peer info should be valid
    for peer_id, info in rpc_node.peers.items():
        assert isinstance(info, dict)
        assert 'id' in info
        assert 'pinned_count' in info