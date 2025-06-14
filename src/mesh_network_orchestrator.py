"""
Mesh Network Orchestrator for the JoyNet decentralized platform
"""
import asyncio
import logging
import random
import time
from typing import Dict, List, Set, Any, Optional
import json
from .p2p.discovery_service import DiscoveryService
from .p2p.message_manager import MessageManager
from .utils.config_loader import load_config

logger = logging.getLogger(__name__)

class MeshNetworkOrchestrator:
    """
    Orchestrates the mesh network for the JoyNet platform, managing node roles,
    workload distribution, and network resilience.
    """
    
    def __init__(self, node_id: str, discovery_service: DiscoveryService, message_manager: MessageManager):
        """Initialize the mesh network orchestrator"""
        self.node_id = node_id
        self.discovery_service = discovery_service
        self.message_manager = message_manager
        self.config = load_config("p2p_config.yaml")
        self.node_roles = {}
        self.network_state = {
            "nodes": {},
            "regions": {},
            "services": {},
            "last_updated": time.time()
        }
        self.is_coordinator = False
        self.coordinator_id = None
        self.election_in_progress = False
        
    async def start(self):
        """Start the mesh network orchestrator"""
        logger.info("Starting mesh network orchestrator")
        
        # Subscribe to network messages
        await self.message_manager.subscribe("network_state", self._handle_network_state)
        await self.message_manager.subscribe("coordinator_election", self._handle_coordinator_election)
        await self.message_manager.subscribe("node_heartbeat", self._handle_node_heartbeat)
        
        # Start periodic tasks
        asyncio.create_task(self._heartbeat_loop())
        asyncio.create_task(self._election_check_loop())
        
    async def _heartbeat_loop(self):
        """Periodically send heartbeat and check network state"""
        while True:
            try:
                # Send heartbeat
                await self._send_heartbeat()
                
                # If coordinator, update and broadcast network state
                if self.is_coordinator:
                    await self._update_network_state()
                    await self._broadcast_network_state()
                    
            except Exception as e:
                logger.error(f"Error in heartbeat loop: {e}")
                
            # Sleep before next heartbeat
            await asyncio.sleep(self.config.get("heartbeat_interval", 30))
            
    async def _election_check_loop(self):
        """Periodically check if coordinator election is needed"""
        while True:
            try:
                # Check if we need to start an election
                if not self.coordinator_id or self.coordinator_id not in self.network_state["nodes"]:
                    if not self.election_in_progress:
                        await self._start_coordinator_election()
                        
            except Exception as e:
                logger.error(f"Error in election check loop: {e}")
                
            # Sleep before next check
            await asyncio.sleep(self.config.get("election_check_interval", 60))
            
    async def _send_heartbeat(self):
        """Send node heartbeat to the network"""
        heartbeat = {
            "node_id": self.node_id,
            "timestamp": time.time(),
            "services": self._get_node_services(),
            "resources": self._get_node_resources(),
            "region": self.config.get("region", "unknown")
        }
        
        await self.message_manager.broadcast_message(
            topic="node_heartbeat",
            message=heartbeat
        )
        
    def _get_node_services(self) -> List[str]:
        """Get services provided by this node"""
        # This would be determined by the node's configuration and capabilities
        return ["model_fusion", "marketplace", "inference"]
        
    def _get_node_resources(self) -> Dict[str, Any]:
        """Get resource information for this node"""
        # This would be determined by monitoring the node's resources
        return {
            "cpu_usage": random.uniform(10, 90),
            "memory_usage": random.uniform(20, 80),
            "gpu_usage": random.uniform(0, 100),
            "disk_usage": random.uniform(30, 70),
            "bandwidth": random.uniform(50, 200)
        }
        
    async def _update_network_state(self):
        """Update the network state (coordinator only)"""
        # Update timestamp
        self.network_state["last_updated"] = time.time()
        
        # Remove stale nodes
        current_time = time.time()
        stale_threshold = self.config.get("node_timeout", 120)
        stale_nodes = []
        
        for node_id, node_info in self.network_state["nodes"].items():
            if current_time - node_info.get("last_seen", 0) > stale_threshold:
                stale_nodes.append(node_id)
                
        for node_id in stale_nodes:
            self.network_state["nodes"].pop(node_id, None)
            
        # Update service availability
        services = {}
        for node_id, node_info in self.network_state["nodes"].items():
            for service in node_info.get("services", []):
                if service not in services:
                    services[service] = []
                services[service].append(node_id)
                
        self.network_state["services"] = services
        
        # Update region information
        regions = {}
        for node_id, node_info in self.network_state["nodes"].items():
            region = node_info.get("region", "unknown")
            if region not in regions:
                regions[region] = []
            regions[region].append(node_id)
            
        self.network_state["regions"] = regions
        
    async def _broadcast_network_state(self):
        """Broadcast network state to all nodes (coordinator only)"""
        if not self.is_coordinator:
            return
            
        await self.message_manager.broadcast_message(
            topic="network_state",
            message={
                "coordinator": self.node_id,
                "timestamp": time.time(),
                "state": self.network_state
            }
        )
        
    async def _start_coordinator_election(self):
        """Start a coordinator election"""
        logger.info("Starting coordinator election")
        self.election_in_progress = True
        
        # Create election message
        election_message = {
            "node_id": self.node_id,
            "timestamp": time.time(),
            "priority": self._calculate_election_priority()
        }
        
        # Broadcast election message
        await self.message_manager.broadcast_message(
            topic="coordinator_election",
            message=election_message
        )
        
        # Wait for election timeout
        await asyncio.sleep(self.config.get("election_timeout", 10))
        
        # If no higher priority node has claimed coordination, become coordinator
        if self.election_in_progress:
            logger.info(f"Node {self.node_id} becoming coordinator")
            self.is_coordinator = True
            self.coordinator_id = self.node_id
            self.election_in_progress = False
            
            # Broadcast coordinator announcement
            await self.message_manager.broadcast_message(
                topic="coordinator_announcement",
                message={
                    "node_id": self.node_id,
                    "timestamp": time.time()
                }
            )
            
    def _calculate_election_priority(self) -> float:
        """Calculate this node's priority for coordinator election"""
        # This would be based on node capabilities, uptime, resources, etc.
        # For now, use a random value
        return random.random()
        
    async def _handle_network_state(self, message: Dict[str, Any]):
        """Handle network state update from coordinator"""
        coordinator = message.get("coordinator")
        timestamp = message.get("timestamp", 0)
        state = message.get("state", {})
        
        # Check if this is a newer state than what we have
        if timestamp > self.network_state.get("last_updated", 0):
            self.network_state = state
            self.coordinator_id = coordinator
            
            # If we thought we were coordinator but someone else is, step down
            if self.is_coordinator and coordinator != self.node_id:
                logger.info(f"Stepping down as coordinator, new coordinator is {coordinator}")
                self.is_coordinator = False
                
    async def _handle_coordinator_election(self, message: Dict[str, Any]):
        """Handle coordinator election message"""
        node_id = message.get("node_id")
        timestamp = message.get("timestamp", 0)
        priority = message.get("priority", 0)
        
        # If the other node has higher priority, cancel our election
        our_priority = self._calculate_election_priority()
        if priority > our_priority:
            logger.debug(f"Node {node_id} has higher priority ({priority} > {our_priority})")
            self.election_in_progress = False
            
    async def _handle_node_heartbeat(self, message: Dict[str, Any]):
        """Handle node heartbeat message"""
        node_id = message.get("node_id")
        timestamp = message.get("timestamp", 0)
        services = message.get("services", [])
        resources = message.get("resources", {})
        region = message.get("region", "unknown")
        
        # Update node information in network state
        if node_id not in self.network_state["nodes"]:
            self.network_state["nodes"][node_id] = {}
            
        self.network_state["nodes"][node_id].update({
            "last_seen": timestamp,
            "services": services,
            "resources": resources,
            "region": region
        })
        
    def get_service_nodes(self, service: str) -> List[str]:
        """
        Get nodes providing a specific service
        
        Args:
            service: Service name
            
        Returns:
            List of node IDs providing the service
        """
        return self.network_state.get("services", {}).get(service, [])
        
    def get_region_nodes(self, region: str) -> List[str]:
        """
        Get nodes in a specific region
        
        Args:
            region: Region name
            
        Returns:
            List of node IDs in the region
        """
        return self.network_state.get("regions", {}).get(region, [])
        
    def get_optimal_node(self, service: str, region: Optional[str] = None) -> Optional[str]:
        """
        Get the optimal node for a service, optionally in a specific region
        
        Args:
            service: Service name
            region: Optional region name
            
        Returns:
            Node ID or None if no suitable node found
        """
        # Get nodes providing the service
        service_nodes = self.get_service_nodes(service)
        if not service_nodes:
            return None
            
        # If region specified, filter by region
        if region:
            region_nodes = self.get_region_nodes(region)
            service_nodes = [node for node in service_nodes if node in region_nodes]
            
        if not service_nodes:
            return None
            
        # Find node with lowest resource usage
        best_node = None
        best_score = float('inf')
        
        for node_id in service_nodes:
            node_info = self.network_state.get("nodes", {}).get(node_id, {})
            resources = node_info.get("resources", {})
            
            # Calculate a simple resource score (lower is better)
            score = (
                resources.get("cpu_usage", 100) +
                resources.get("memory_usage", 100) +
                resources.get("gpu_usage", 100)
            ) / 3
            
            if score < best_score:
                best_score = score
                best_node = node_id
                
        return best_node
        
    async def stop(self):
        """Stop the mesh network orchestrator"""
        logger.info("Stopping mesh network orchestrator")