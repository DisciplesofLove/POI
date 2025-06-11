"""
Main entry point for the JoyNet decentralized node
"""
import asyncio
import argparse
import json
import logging
import os
import signal
import sys
from typing import Dict, Any, Optional
import libp2p
from libp2p.crypto.secp256k1 import create_new_key_pair
from libp2p.peer.peerinfo import info_from_p2p_addr

from .p2p.discovery_service import DiscoveryService
from .p2p.message_manager import MessageManager
from .mesh_network_orchestrator import MeshNetworkOrchestrator
from .decentralized_registry import DecentralizedRegistry
from .consensus.proof_of_integrity import ProofOfIntegrity
from .decentralized_governance import DecentralizedGovernance
from .utils.ipfs_utils import IPFSStorage
from .utils.crypto_vault import CryptoVault
from .utils.config_loader import load_config

logger = logging.getLogger(__name__)

class DecentralizedNode:
    """
    Main class for the JoyNet decentralized node, integrating all components
    for a fully sovereign decentralized network.
    """
    
    def __init__(self, config_path: str, data_dir: str):
        """Initialize the decentralized node"""
        self.running = False
        self.data_dir = data_dir
        
        # Load configuration
        with open(config_path, 'r') as f:
            self.config = json.load(f)
            
        # Set up logging
        log_level = self.config.get("log_level", "info").upper()
        logging.basicConfig(
            level=getattr(logging, log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler(os.path.join(data_dir, "logs", "node.log"))
            ]
        )
        
        # Initialize components
        self.node_id = self.config.get("node_id")
        self.node_type = self.config.get("node_type", "full")
        
        # Load private key
        private_key_path = os.path.join(data_dir, "keys", "private_key")
        with open(private_key_path, 'r') as f:
            self.private_key = f.read().strip()
            
        # Initialize crypto vault
        self.crypto_vault = CryptoVault(self.private_key)
        
        # Other components will be initialized in start()
        self.host = None
        self.discovery_service = None
        self.message_manager = None
        self.mesh_orchestrator = None
        self.registry = None
        self.proof_of_integrity = None
        self.governance = None
        self.ipfs = None
        
    async def start(self):
        """Start the decentralized node and all its components"""
        logger.info(f"Starting JoyNet {self.node_type} node with ID {self.node_id}")
        self.running = True
        
        # Set up signal handlers
        for sig in [signal.SIGINT, signal.SIGTERM]:
            signal.signal(sig, self._signal_handler)
            
        # Initialize libp2p host
        key_pair = create_new_key_pair()
        self.host = await libp2p.new_host(key_pair=key_pair)
        
        # Start listening on the P2P port
        p2p_port = self.config.get("p2p", {}).get("port", 9000)
        await self.host.get_network().listen(f"/ip4/0.0.0.0/tcp/{p2p_port}")
        logger.info(f"P2P node listening on port {p2p_port}")
        
        # Initialize IPFS
        self.ipfs = IPFSStorage(
            api_url=f"http://localhost:{self.config.get('ipfs', {}).get('api_port', 5001)}"
        )
        
        # Initialize message manager
        self.message_manager = MessageManager(self.host)
        await self.message_manager.start()
        
        # Initialize discovery service
        bootstrap_peers = self.config.get("p2p", {}).get("bootstrap_peers", [])
        self.discovery_service = DiscoveryService(self.host, bootstrap_peers)
        await self.discovery_service.start()
        
        # Initialize mesh network orchestrator
        self.mesh_orchestrator = MeshNetworkOrchestrator(
            node_id=self.node_id,
            discovery_service=self.discovery_service,
            message_manager=self.message_manager
        )
        await self.mesh_orchestrator.start()
        
        # Initialize decentralized registry
        self.registry = DecentralizedRegistry(
            node_id=self.node_id,
            private_key=self.private_key,
            message_manager=self.message_manager,
            ipfs=self.ipfs
        )
        await self.registry.start()
        
        # Initialize proof of integrity
        self.proof_of_integrity = ProofOfIntegrity(
            node_id=self.node_id,
            private_key=self.private_key,
            message_manager=self.message_manager
        )
        await self.proof_of_integrity.start()
        
        # Initialize governance (for full and validator nodes)
        if self.node_type in ["full", "validator"]:
            self.governance = DecentralizedGovernance(
                node_id=self.node_id,
                private_key=self.private_key,
                message_manager=self.message_manager,
                ipfs=self.ipfs
            )
            await self.governance.start()
            
        # Register node in the decentralized registry
        await self._register_node()
        
        logger.info(f"JoyNet {self.node_type} node started successfully")
        
    async def _register_node(self):
        """Register this node in the decentralized registry"""
        node_info = {
            "id": self.node_id,
            "type": self.node_type,
            "addrs": [str(addr) for addr in self.host.get_addrs()],
            "services": self.config.get("services", {}),
            "version": "1.0.0",
            "region": self.config.get("region", "unknown"),
            "started_at": asyncio.get_event_loop().time()
        }
        
        await self.registry.register_entity("node", self.node_id, node_info)
        logger.info(f"Registered node in decentralized registry")
        
    def _signal_handler(self, sig, frame):
        """Handle termination signals"""
        logger.info(f"Received signal {sig}, shutting down...")
        asyncio.create_task(self.stop())
        
    async def stop(self):
        """Stop the decentralized node and all its components"""
        if not self.running:
            return
            
        logger.info("Stopping JoyNet node...")
        self.running = False
        
        # Stop components in reverse order
        if self.governance:
            await self.governance.stop()
            
        if self.proof_of_integrity:
            await self.proof_of_integrity.stop()
            
        if self.registry:
            await self.registry.stop()
            
        if self.mesh_orchestrator:
            await self.mesh_orchestrator.stop()
            
        if self.discovery_service:
            await self.discovery_service.stop()
            
        if self.message_manager:
            await self.message_manager.stop()
            
        if self.host:
            await self.host.close()
            
        logger.info("JoyNet node stopped")
        
    async def run_forever(self):
        """Run the node until stopped"""
        while self.running:
            await asyncio.sleep(1)
            
def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="JoyNet Decentralized Node")
    parser.add_argument("--config", required=True, help="Path to config file")
    parser.add_argument("--data-dir", required=True, help="Path to data directory")
    args = parser.parse_args()
    
    # Create node instance
    node = DecentralizedNode(args.config, args.data_dir)
    
    # Run the node
    loop = asyncio.get_event_loop()
    loop.run_until_complete(node.start())
    
    try:
        loop.run_until_complete(node.run_forever())
    except KeyboardInterrupt:
        pass
    finally:
        loop.run_until_complete(node.stop())
        
if __name__ == "__main__":
    main()