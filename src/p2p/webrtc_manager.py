"""
WebRTC manager for handling peer connections and data channels.
"""
import asyncio
import json
import logging
from typing import Dict, List, Optional, Callable
import hashlib
from dataclasses import dataclass
import ipfs_api

from libp2p import new_host
from libp2p.peer.peerinfo import info_from_p2p_addr
from libp2p.typing.primitive_interfaces import IPrivateKey

logger = logging.getLogger(__name__)

@dataclass
class Message:
    sender: str
    content: str
    timestamp: float
    message_type: str  # 'text', 'file', 'image', etc
    metadata: dict  # For files: name, size, type, etc
    ipfs_hash: Optional[str] = None  # For stored content

class WebRTCManager:
    def __init__(self, stun_turn_server, ipfs_client):
        self.stun_turn = stun_turn_server
        self.ipfs = ipfs_client
        self.peers: Dict[str, dict] = {}  # peer_id -> connection info
        self.data_channels: Dict[str, dict] = {}  # channel_id -> channel info
        self.message_handlers: List[Callable] = []
        self._host = None
        
    async def start(self):
        """Start the WebRTC manager"""
        # Create libp2p host
        self._host = await new_host(
            transport_opt=["/ip4/0.0.0.0/tcp/0"],
            security_opt=["noise", "secio"],
        )
        
        # Start listening
        await self._host.get_network().listen()
        logger.info(f"WebRTC manager started")
        
        # Register protocol handlers
        self._host.set_stream_handler("/webrtc/signal/1.0.0", self._handle_signaling)
        
    async def create_peer_connection(self, peer_id: str) -> dict:
        """Create a new WebRTC peer connection"""
        # Get ICE candidates from our STUN/TURN server
        candidates = await self.stun_turn.get_peer_candidates(peer_id)
        
        connection_info = {
            "peer_id": peer_id,
            "ice_candidates": candidates,
            "data_channels": {},
            "status": "connecting"
        }
        
        self.peers[peer_id] = connection_info
        return connection_info
        
    async def create_data_channel(self, peer_id: str, channel_id: str, config: dict = None) -> dict:
        """Create a new data channel with a peer"""
        if peer_id not in self.peers:
            raise ValueError(f"No connection to peer {peer_id}")
            
        channel_info = {
            "id": channel_id,
            "peer_id": peer_id,
            "config": config or {},
            "status": "connecting"
        }
        
        self.data_channels[channel_id] = channel_info
        self.peers[peer_id]["data_channels"][channel_id] = channel_info
        return channel_info
        
    async def send_message(self, channel_id: str, content: str, message_type: str = "text", 
                          metadata: dict = None) -> Message:
        """Send a message through a data channel"""
        if channel_id not in self.data_channels:
            raise ValueError(f"Data channel {channel_id} not found")
            
        message = Message(
            sender=self._host.get_id().pretty(),
            content=content,
            timestamp=asyncio.get_event_loop().time(),
            message_type=message_type,
            metadata=metadata or {}
        )
        
        # If it's a file, upload to IPFS first
        if message_type in ["file", "image", "pdf"]:
            message.ipfs_hash = await self.ipfs.add_bytes(content.encode())
            message.content = message.ipfs_hash  # Store only the hash
            
        # Send through data channel
        channel = self.data_channels[channel_id]
        await self._send_through_channel(channel, message)
        
        return message
        
    async def _send_through_channel(self, channel: dict, message: Message):
        """Send a message through a specific data channel"""
        try:
            stream = await self._host.new_stream(channel["peer_id"], "/webrtc/data/1.0.0")
            await stream.write(json.dumps(message.__dict__).encode())
            await stream.close()
        except Exception as e:
            logger.error(f"Error sending message: {e}")
            raise
            
    def add_message_handler(self, handler: Callable[[Message], None]):
        """Add a handler for incoming messages"""
        self.message_handlers.append(handler)
        
    async def _handle_signaling(self, stream):
        """Handle WebRTC signaling messages"""
        while True:
            try:
                data = await stream.read()
                if not data:
                    break
                    
                signal = json.loads(data)
                peer_id = signal.get("peer_id")
                
                if signal["type"] == "offer":
                    # Handle incoming connection offer
                    connection = await self.create_peer_connection(peer_id)
                    response = {
                        "type": "answer",
                        "peer_id": self._host.get_id().pretty(),
                        "ice_candidates": connection["ice_candidates"]
                    }
                    await stream.write(json.dumps(response).encode())
                    
                elif signal["type"] == "answer":
                    # Handle connection answer
                    if peer_id in self.peers:
                        self.peers[peer_id]["status"] = "connected"
                        
                elif signal["type"] == "ice-candidate":
                    # Handle new ICE candidate
                    if peer_id in self.peers:
                        self.peers[peer_id]["ice_candidates"].append(signal["candidate"])
                        
            except Exception as e:
                logger.error(f"Error handling signaling: {e}")
                break
                
    async def stop(self):
        """Stop the WebRTC manager"""
        if self._host:
            await self._host.close()
            self._host = None