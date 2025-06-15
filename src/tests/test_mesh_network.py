"""
Tests for Joy Sovereign mesh networking
"""
import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch
from ..p2p.mesh_network import MeshNetwork, NetworkType

@pytest.fixture
def mesh_network():
    """Create mesh network instance"""
    return MeshNetwork("test_node")

def test_network_initialization(mesh_network):
    """Test network transport initialization"""
    # TCP/IP should always be available
    assert NetworkType.TCP_IP in mesh_network.active_networks
    
    # LoRa may be available depending on environment
    if hasattr(mesh_network, "lora"):
        assert NetworkType.LORA in mesh_network.active_networks

@pytest.mark.asyncio
async def test_message_broadcasting(mesh_network):
    """Test message broadcasting"""
    test_message = {
        "type": "transaction",
        "data": "test_data",
        "timestamp": 123456789
    }
    
    # Broadcast message
    msg_id = await mesh_network.broadcast_message(test_message)
    assert msg_id in mesh_network.message_seen
    assert msg_id in mesh_network.message_cache
    
    # Test duplicate message handling
    duplicate_id = await mesh_network.broadcast_message(test_message)
    assert duplicate_id == msg_id

@pytest.mark.asyncio
async def test_message_propagation(mesh_network):
    """Test message propagation across networks"""
    test_message = {
        "type": "transaction",
        "data": "test_data",
        "hops": 0
    }
    
    # Simulate message receipt
    await mesh_network.handle_received_message(
        msg_id="test_id",
        message=test_message,
        source_network=NetworkType.TCP_IP
    )
    
    assert "test_id" in mesh_network.message_seen
    assert mesh_network.message_cache["test_id"]["hops"] == 1

@pytest.mark.asyncio
async def test_cache_cleanup(mesh_network):
    """Test message cache cleanup"""
    # Add test message
    mesh_network.message_cache["test_id"] = {
        "data": {"test": "data"},
        "timestamp": 0,  # Expired
        "hops": 1
    }
    mesh_network.message_seen.add("test_id")
    
    # Run cleanup
    await mesh_network.cleanup_cache()
    
    assert "test_id" not in mesh_network.message_cache
    assert "test_id" not in mesh_network.message_seen

@pytest.mark.asyncio
@patch("lora.LoRa")
async def test_lora_broadcasting(mock_lora, mesh_network):
    """Test LoRa message broadcasting"""
    # Mock LoRa availability
    mesh_network.lora = mock_lora
    mesh_network.active_networks.add(NetworkType.LORA)
    
    test_message = {
        "type": "transaction",
        "data": "test_data"
    }
    
    # Test LoRa-specific broadcast
    await mesh_network.broadcast_message(
        message=test_message,
        networks=[NetworkType.LORA]
    )
    
    # Verify LoRa send was called
    mock_lora.send.assert_called_once()