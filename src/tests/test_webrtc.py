"""
Tests for WebRTC and messaging components.
"""
import pytest
import asyncio
import json
from pathlib import Path
import tempfile
import aioipfs

from ..p2p.stun_turn_server import STUNTURNServer
from ..p2p.webrtc_manager import WebRTCManager, Message
from ..p2p.message_manager import MessageManager
from ..ai.analyzer import ContentAnalyzer

@pytest.fixture
async def stun_turn_server():
    server = STUNTURNServer("127.0.0.1")
    await server.start()
    yield server
    await server.stop()
    
@pytest.fixture
async def ipfs_client():
    client = aioipfs.AsyncIPFS()
    yield client
    await client.close()
    
@pytest.fixture
def webrtc_config():
    return {
        "use_internal_servers": True,
        "stun_servers": [
            {"urls": "stun:127.0.0.1:3478"}
        ],
        "turn_servers": [
            {
                "urls": "turn:127.0.0.1:3479",
                "username": "test",
                "credential": "test123"
            }
        ],
        "storage": {
            "ipfs": {
                "enabled": True,
                "pin_files": True,
                "max_file_size": 1048576,  # 1MB for testing
                "allowed_mime_types": ["text/*", "image/*", "application/pdf"]
            },
            "message_retention": {
                "enabled": True,
                "store_messages": True,
                "encryption": True,
                "max_age_days": 30
            }
        },
        "ai_analysis": {
            "enabled": True,
            "analyze_on_upload": True,
            "supported_types": ["text/plain", "image/*", "application/pdf"],
            "features": [
                "content_moderation",
                "text_classification",
                "sentiment_analysis"
            ]
        }
    }
    
@pytest.fixture
async def webrtc_manager(stun_turn_server, webrtc_config):
    manager = WebRTCManager(stun_turn_server, webrtc_config)
    await manager.start()
    yield manager
    await manager.stop()
    
@pytest.fixture
async def message_manager(ipfs_client, webrtc_config):
    return MessageManager(ipfs_client, webrtc_config)
    
@pytest.mark.asyncio
async def test_stun_turn_server(stun_turn_server):
    """Test STUN/TURN server functionality"""
    # Add test user
    stun_turn_server.add_user("test", "test123")
    
    # Test STUN request
    peer_id = "test_peer"
    candidates = await stun_turn_server.get_peer_candidates(peer_id)
    assert len(candidates) > 0
    assert candidates[0].type == "srflx"
    assert candidates[0].ip == "127.0.0.1"
    
@pytest.mark.asyncio
async def test_webrtc_connection(webrtc_manager):
    """Test WebRTC peer connection establishment"""
    peer_id = "test_peer"
    connection = await webrtc_manager.create_peer_connection(peer_id)
    assert connection["peer_id"] == peer_id
    assert connection["status"] == "connecting"
    assert "ice_candidates" in connection
    
@pytest.mark.asyncio
async def test_data_channel(webrtc_manager):
    """Test WebRTC data channel creation"""
    peer_id = "test_peer"
    channel_id = "test_channel"
    
    # Create connection first
    await webrtc_manager.create_peer_connection(peer_id)
    
    # Create data channel
    channel = await webrtc_manager.create_data_channel(peer_id, channel_id)
    assert channel["id"] == channel_id
    assert channel["peer_id"] == peer_id
    assert channel["status"] == "connecting"
    
@pytest.mark.asyncio
async def test_message_storage(message_manager):
    """Test message storage and retrieval"""
    channel_id = "test_channel"
    message = Message(
        sender="test_sender",
        content="Hello, World!",
        timestamp=asyncio.get_event_loop().time(),
        message_type="text",
        metadata={}
    )
    
    # Store message
    message_hash = await message_manager.store_message(channel_id, message)
    assert message_hash is not None
    
    # Retrieve messages
    messages = await message_manager.get_messages(channel_id)
    assert len(messages) == 1
    assert messages[0].content == "Hello, World!"
    
@pytest.mark.asyncio
async def test_file_storage(message_manager):
    """Test file storage in IPFS"""
    # Create temporary test file
    with tempfile.NamedTemporaryFile(suffix=".txt") as f:
        f.write(b"Test content")
        f.flush()
        
        # Store file
        metadata = {"description": "Test file"}
        ipfs_hash = await message_manager.store_file(f.name, metadata)
        assert ipfs_hash is not None
        
@pytest.mark.asyncio
async def test_content_analysis():
    """Test AI content analysis"""
    analyzer = ContentAnalyzer()
    
    # Test text analysis
    text = "This is a test message that should be safe."
    result = await analyzer.moderate_content(text, "text/plain")
    assert result["safe"] is True
    
    # Test text classification
    result = await analyzer.classify_text(text)
    assert "label" in result
    assert "confidence" in result
    
    # Test sentiment analysis
    result = await analyzer.analyze_sentiment(text)
    assert "sentiment" in result
    assert "confidence" in result