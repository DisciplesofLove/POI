"""
Decentralized node discovery service for the JoyNet platform
"""
import asyncio
import json
import logging
import random
import time
from typing import Dict, List, Set, Optional
import libp2p
from libp2p.peer.peerinfo import info_from_p2p_addr
from libp2p.pubsub.pubsub import Pubsub
from libp2p.pubsub.gossipsub import GossipSub
from ..utils.config_loader import load_config

logger = logging.getLogger(__name__)

class DiscoveryService:
    """Service for discovering and maintaining connections to peers in the network"""
    
    def __init__(self, host, bootstrap_peers=None):
        """Initialize the discovery service"""
        self.host = host
        self.peers = set()
        self.active_peers = set()
        self.bootstrap_peers = bootstrap_peers or []
        self.config = load_config("p2p_config.yaml")
        self.gossipsub = GossipSub(host)
        self.discovery_topic = self.gossipsub.subscribe("joynet/discovery")
        self.last_discovery = 0
        self.node_info = {
            "id": host.get_id().pretty(),
            "addrs": [str(addr) for addr in host.get_addrs()],
            "services": ["model_fusion", "marketplace"],
            "version": "1.0.0",
            "timestamp": time.time()
        }
        
    async def start(self):
        """Start the discovery service"""
        logger.info("Starting discovery service")
        await self.gossipsub.subscribe(self.discovery_topic)
        
        # Connect to bootstrap peers
        for peer in self.bootstrap_peers:
            try:
                peer_info = info_from_p2p_addr(peer)
                await self.host.connect(peer_info)
                self.peers.add(peer_info.peer_id.pretty())
                logger.info(f"Connected to bootstrap peer: {peer_info.peer_id.pretty()}")
            except Exception as e:
                logger.error(f"Failed to connect to bootstrap peer {peer}: {e}")
                
        # Start discovery loop
        asyncio.create_task(self._discovery_loop())
        asyncio.create_task(self._heartbeat_loop())
        
    async def _discovery_loop(self):
        """Periodically broadcast node information and process incoming discovery messages"""
        while True:
            try:
                # Broadcast node info
                await self._broadcast_node_info()
                
                # Process incoming messages
                async for message in self.discovery_topic:
                    try:
                        peer_info = json.loads(message.data.decode('utf-8'))
                        peer_id = peer_info.get("id")
                        
                        if peer_id and peer_id != self.host.get_id().pretty():
                            self.peers.add(peer_id)
                            self.active_peers.add(peer_id)
                            logger.debug(f"Discovered peer: {peer_id}")
                    except Exception as e:
                        logger.error(f"Error processing discovery message: {e}")
                        
            except Exception as e:
                logger.error(f"Error in discovery loop: {e}")
                
            # Sleep before next discovery cycle
            await asyncio.sleep(self.config.get("discovery_interval", 60))
            
    async def _heartbeat_loop(self):
        """Periodically check peer connections and reconnect if needed"""
        while True:
            try:
                # Update active peers
                current_peers = set(self.host.get_network().connections.keys())
                self.active_peers = {peer_id.pretty() for peer_id in current_peers}
                
                # Try to connect to known peers that are not currently connected
                peers_to_connect = self.peers - self.active_peers
                if peers_to_connect:
                    # Select a random subset to avoid connection storms
                    sample_size = min(5, len(peers_to_connect))
                    for peer_id in random.sample(list(peers_to_connect), sample_size):
                        try:
                            # Try to reconnect
                            peer_info = await self._get_peer_info(peer_id)
                            if peer_info:
                                await self.host.connect(peer_info)
                                logger.debug(f"Reconnected to peer: {peer_id}")
                        except Exception as e:
                            logger.debug(f"Failed to reconnect to peer {peer_id}: {e}")
                            
            except Exception as e:
                logger.error(f"Error in heartbeat loop: {e}")
                
            # Sleep before next heartbeat
            await asyncio.sleep(self.config.get("heartbeat_interval", 30))
            
    async def _broadcast_node_info(self):
        """Broadcast node information to the network"""
        # Update timestamp
        self.node_info["timestamp"] = time.time()
        
        # Broadcast to discovery topic
        message = json.dumps(self.node_info).encode('utf-8')
        await self.gossipsub.publish(self.discovery_topic, message)
        self.last_discovery = time.time()
        
    async def _get_peer_info(self, peer_id: str) -> Optional[libp2p.peer.peerinfo.PeerInfo]:
        """Get peer info from peer ID"""
        # This would typically involve a DHT lookup in a full implementation
        # For now, we'll return None as we don't have the peer's addresses
        return None
        
    def get_active_peers(self) -> List[str]:
        """Get list of active peers"""
        return list(self.active_peers)
        
    def get_all_peers(self) -> List[str]:
        """Get list of all known peers"""
        return list(self.peers)
        
    def get_peer_count(self) -> Dict[str, int]:
        """Get peer counts"""
        return {
            "total": len(self.peers),
            "active": len(self.active_peers)
        }
        
    async def stop(self):
        """Stop the discovery service"""
        logger.info("Stopping discovery service")
        await self.gossipsub.unsubscribe(self.discovery_topic)