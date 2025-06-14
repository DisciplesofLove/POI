"""
STUN/TURN server implementation integrated with libp2p network.
"""
import asyncio
import logging
from typing import Dict, List, Optional
import json
import hashlib
from dataclasses import dataclass
import ipaddress

from libp2p import new_host
from libp2p.peer.peerinfo import info_from_p2p_addr
from libp2p.typing.primitive_interfaces import IPrivateKey
from libp2p.security.secio import SecIOTransport
from libp2p.security.noise import NoiseTransport

logger = logging.getLogger(__name__)

@dataclass
class ICECandidate:
    ip: str
    port: int
    type: str  # 'host', 'srflx', 'relay'
    priority: int
    protocol: str  # 'udp', 'tcp'
    
class STUNTURNServer:
    def __init__(self, host_ip: str, stun_port: int = 3478, turn_port: int = 3479):
        self.host_ip = host_ip
        self.stun_port = stun_port
        self.turn_port = turn_port
        self.peers: Dict[str, List[ICECandidate]] = {}
        self.credentials: Dict[str, str] = {}  # username -> password hash
        self._host = None
        
    async def start(self):
        """Start the STUN/TURN server integrated with libp2p"""
        # Create libp2p host
        self._host = await new_host(
            transport_opt=["/ip4/0.0.0.0/tcp/0"],
            security_opt=[SecIOTransport(), NoiseTransport()],
        )
        
        # Start listening
        await self._host.get_network().listen()
        logger.info(f"STUN/TURN server listening on {self.host_ip}:{self.stun_port}/{self.turn_port}")
        
        # Register protocol handlers
        self._host.set_stream_handler("/stun/1.0.0", self._handle_stun)
        self._host.set_stream_handler("/turn/1.0.0", self._handle_turn)
        
    async def _handle_stun(self, stream):
        """Handle incoming STUN requests"""
        while True:
            try:
                data = await stream.read()
                if not data:
                    break
                    
                request = json.loads(data)
                peer_id = request.get("peer_id")
                
                # Create ICE candidate for peer
                candidate = ICECandidate(
                    ip=stream.get_remote_address(),
                    port=self.stun_port,
                    type="srflx",
                    priority=65535,
                    protocol="udp"
                )
                
                self.peers[peer_id] = self.peers.get(peer_id, []) + [candidate]
                
                # Send back the discovered IP/port
                response = {
                    "type": "success",
                    "ip": candidate.ip,
                    "port": candidate.port
                }
                await stream.write(json.dumps(response).encode())
                
            except Exception as e:
                logger.error(f"Error handling STUN request: {e}")
                break
                
    async def _handle_turn(self, stream):
        """Handle incoming TURN requests"""
        while True:
            try:
                data = await stream.read()
                if not data:
                    break
                    
                request = json.loads(data)
                username = request.get("username")
                password = request.get("password")
                peer_id = request.get("peer_id")
                
                # Authenticate
                if not self._authenticate(username, password):
                    response = {"type": "error", "message": "Authentication failed"}
                    await stream.write(json.dumps(response).encode())
                    continue
                
                # Create relay candidate
                candidate = ICECandidate(
                    ip=self.host_ip,
                    port=self.turn_port,
                    type="relay",
                    priority=65535,
                    protocol="udp"
                )
                
                self.peers[peer_id] = self.peers.get(peer_id, []) + [candidate]
                
                # Send back relay address
                response = {
                    "type": "success",
                    "ip": candidate.ip,
                    "port": candidate.port
                }
                await stream.write(json.dumps(response).encode())
                
            except Exception as e:
                logger.error(f"Error handling TURN request: {e}")
                break
                
    def _authenticate(self, username: str, password: str) -> bool:
        """Authenticate TURN credentials"""
        if username not in self.credentials:
            return False
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        return self.credentials[username] == password_hash
        
    def add_user(self, username: str, password: str):
        """Add a new user with TURN credentials"""
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        self.credentials[username] = password_hash
        
    async def get_peer_candidates(self, peer_id: str) -> List[ICECandidate]:
        """Get all ICE candidates for a peer"""
        return self.peers.get(peer_id, [])
        
    async def stop(self):
        """Stop the server"""
        if self._host:
            await self._host.close()
            self._host = None