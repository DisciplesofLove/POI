"""
Blockchain CDN Layer implementation providing edge caching, load balancing,
content verification and incentivization for CDN nodes.
"""
from abc import ABC, abstractmethod
import hashlib
import json
import time
from typing import Dict, Any, List, Optional, Union, BinaryIO
from web3 import Web3
from .decentralized_storage import StorageProvider

class CDNNode:
    """Represents a node in the CDN network"""
    def __init__(self, node_id: str, endpoint: str, stake: int = 0):
        self.node_id = node_id
        self.endpoint = endpoint
        self.stake = stake
        self.reputation = 1.0
        self.last_heartbeat = time.time()
        self.cached_content: Dict[str, bytes] = {}

class BlockchainCDNProvider(StorageProvider):
    """
    Blockchain CDN implementation that provides:
    - Edge caching
    - Load balancing
    - Content verification
    - Node rewards
    - Access control
    """
    
    def __init__(self, web3_provider: str, contract_address: str):
        """Initialize with Web3 provider and smart contract address"""
        self.web3 = Web3(Web3.HTTPProvider(web3_provider))
        self.contract = self._load_contract(contract_address)
        self.nodes: Dict[str, CDNNode] = {}
        
    def _load_contract(self, address: str):
        # Load ABI and create contract instance
        # This would load the actual contract ABI in production
        abi = []  # Contract ABI would go here
        return self.web3.eth.contract(address=address, abi=abi)
        
    def register_node(self, node_id: str, endpoint: str, stake: int) -> bool:
        """Register a new CDN node with stake"""
        if node_id in self.nodes:
            return False
            
        self.nodes[node_id] = CDNNode(node_id, endpoint, stake)
        
        # In production, this would interact with smart contract
        # self.contract.functions.registerNode(node_id).transact()
        
        return True
        
    def _select_nodes(self, content_id: str, count: int = 3) -> List[CDNNode]:
        """Select best nodes for content based on stake, reputation and location"""
        active_nodes = [
            node for node in self.nodes.values()
            if time.time() - node.last_heartbeat < 300  # 5 min timeout
        ]
        
        # Sort by stake * reputation
        sorted_nodes = sorted(
            active_nodes,
            key=lambda n: n.stake * n.reputation,
            reverse=True
        )
        
        return sorted_nodes[:count]
        
    def _verify_content(self, content: bytes, expected_hash: str) -> bool:
        """Verify content integrity"""
        content_hash = hashlib.sha256(content).hexdigest()
        return content_hash == expected_hash
        
    def store(self, data: Union[bytes, BinaryIO], metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Store content in CDN nodes with blockchain verification
        Returns content identifier
        """
        if isinstance(data, BinaryIO):
            data = data.read()
            
        # Generate content ID from hash
        content_id = hashlib.sha256(data).hexdigest()
        
        # Select nodes for storage
        target_nodes = self._select_nodes(content_id)
        
        # Store content on selected nodes
        for node in target_nodes:
            node.cached_content[content_id] = data
            
        # Record on blockchain
        # self.contract.functions.recordContent(
        #     content_id,
        #     [n.node_id for n in target_nodes]
        # ).transact()
        
        return content_id
        
    def retrieve(self, content_id: str) -> bytes:
        """
        Retrieve content from CDN nodes with load balancing
        """
        # Get nodes that have this content
        available_nodes = [
            node for node in self.nodes.values()
            if content_id in node.cached_content
        ]
        
        if not available_nodes:
            raise ValueError(f"Content {content_id} not found in CDN")
            
        # Simple round-robin load balancing
        # In production this would consider node load, latency, etc.
        node = available_nodes[hash(content_id) % len(available_nodes)]
        
        content = node.cached_content[content_id]
        
        # Verify content
        if not self._verify_content(content, content_id):
            raise ValueError("Content verification failed")
            
        # Record retrieval for rewards
        # self.contract.functions.recordRetrieval(
        #     content_id,
        #     node.node_id
        # ).transact()
        
        return content
        
    def verify(self, content_id: str) -> bool:
        """Verify content is available and valid in CDN"""
        try:
            content = self.retrieve(content_id)
            return self._verify_content(content, content_id)
        except:
            return False
            
    def reward_nodes(self):
        """
        Distribute rewards to nodes based on stake, uptime and content served
        This would be called periodically
        """
        for node in self.nodes.values():
            # Calculate reward based on:
            # - Stake amount
            # - Node uptime
            # - Content served
            # - User ratings
            reward = node.stake * node.reputation
            
            # In production this would distribute tokens
            # self.contract.functions.distributeReward(
            #     node.node_id,
            #     reward
            # ).transact()