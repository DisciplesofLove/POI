"""
Tests for the Blockchain CDN Layer implementation
"""
import pytest
from unittest.mock import Mock, patch
import hashlib
import time

from ..utils.blockchain_cdn import BlockchainCDNProvider, CDNNode

@pytest.fixture
def mock_web3():
    with patch('web3.Web3') as mock:
        web3 = Mock()
        mock.HTTPProvider.return_value = Mock()
        mock.return_value = web3
        yield web3

@pytest.fixture
def cdn_provider(mock_web3):
    return BlockchainCDNProvider(
        web3_provider="http://localhost:8545",
        contract_address="0x1234567890"
    )

def test_register_node(cdn_provider):
    # Test node registration
    success = cdn_provider.register_node(
        "node1",
        "http://node1:8080",
        1000  # stake amount
    )
    assert success
    assert "node1" in cdn_provider.nodes
    
    # Test duplicate registration
    success = cdn_provider.register_node(
        "node1",
        "http://node1:8080",
        1000
    )
    assert not success

def test_node_selection(cdn_provider):
    # Register test nodes
    nodes = [
        ("node1", "http://node1:8080", 1000),
        ("node2", "http://node2:8080", 2000),
        ("node3", "http://node3:8080", 500)
    ]
    
    for node_id, endpoint, stake in nodes:
        cdn_provider.register_node(node_id, endpoint, stake)
        
    # Test node selection
    selected = cdn_provider._select_nodes("test_content", count=2)
    assert len(selected) == 2
    
    # Verify nodes are sorted by stake
    assert selected[0].stake > selected[1].stake

def test_content_verification(cdn_provider):
    test_data = b"test content"
    content_hash = hashlib.sha256(test_data).hexdigest()
    
    # Test valid content
    assert cdn_provider._verify_content(test_data, content_hash)
    
    # Test invalid content
    assert not cdn_provider._verify_content(b"wrong content", content_hash)

def test_store_and_retrieve(cdn_provider):
    test_data = b"test content"
    
    # Register test nodes
    cdn_provider.register_node("node1", "http://node1:8080", 1000)
    cdn_provider.register_node("node2", "http://node2:8080", 1000)
    
    # Store content
    content_id = cdn_provider.store(test_data)
    assert content_id == hashlib.sha256(test_data).hexdigest()
    
    # Verify content is cached on nodes
    nodes_with_content = [
        node for node in cdn_provider.nodes.values()
        if content_id in node.cached_content
    ]
    assert len(nodes_with_content) > 0
    
    # Retrieve content
    retrieved = cdn_provider.retrieve(content_id)
    assert retrieved == test_data
    
    # Test retrieval of non-existent content
    with pytest.raises(ValueError):
        cdn_provider.retrieve("nonexistent")

def test_node_timeout(cdn_provider):
    # Register test node
    cdn_provider.register_node("node1", "http://node1:8080", 1000)
    node = cdn_provider.nodes["node1"]
    
    # Set last heartbeat to 10 minutes ago
    node.last_heartbeat = time.time() - 600
    
    # Node should not be selected due to timeout
    selected = cdn_provider._select_nodes("test_content")
    assert node not in selected

def test_content_verification_on_retrieval(cdn_provider):
    test_data = b"test content"
    content_id = hashlib.sha256(test_data).hexdigest()
    
    # Register node and store content
    cdn_provider.register_node("node1", "http://node1:8080", 1000)
    node = cdn_provider.nodes["node1"]
    node.cached_content[content_id] = test_data
    
    # Test successful retrieval with verification
    retrieved = cdn_provider.retrieve(content_id)
    assert retrieved == test_data
    
    # Corrupt the cached content
    node.cached_content[content_id] = b"corrupted data"
    
    # Retrieval should fail verification
    with pytest.raises(ValueError, match="Content verification failed"):
        cdn_provider.retrieve(content_id)

def test_verify_method(cdn_provider):
    test_data = b"test content"
    
    # Store content
    content_id = cdn_provider.store(test_data)
    
    # Test verification of existing content
    assert cdn_provider.verify(content_id)
    
    # Test verification of non-existent content
    assert not cdn_provider.verify("nonexistent")