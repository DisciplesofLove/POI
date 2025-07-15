"""Geospatial node selection and routing manager."""

from typing import List, Dict, Tuple, Optional
import math
import numpy as np
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class NodeLocation:
    node_id: str
    latitude: float
    longitude: float
    gpu_capacity: int
    current_load: int

class LocationManager:
    def __init__(self, shard_size_km: float = 100.0):
        self.shard_size = shard_size_km
        self.nodes: Dict[str, NodeLocation] = {}
        self.shards: Dict[Tuple[int, int], List[str]] = defaultdict(list)
        
    def add_node(self, node_id: str, latitude: float, longitude: float, 
                gpu_capacity: int = 1):
        """Register a new node with its location."""
        node = NodeLocation(node_id, latitude, longitude, gpu_capacity, 0)
        self.nodes[node_id] = node
        
        # Add to appropriate shard
        shard = self._get_shard(latitude, longitude)
        self.shards[shard].append(node_id)
        
    def find_nearest_nodes(self, latitude: float, longitude: float, 
                          k: int = 3) -> List[str]:
        """Find k nearest nodes to given coordinates."""
        target_shard = self._get_shard(latitude, longitude)
        candidates = []
        
        # Get nodes from target shard and adjacent shards
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                shard = (target_shard[0] + dx, target_shard[1] + dy)
                candidates.extend(self.shards.get(shard, []))
                
        # Sort by distance and load
        def score_node(node_id: str) -> float:
            node = self.nodes[node_id]
            distance = self._haversine_distance(
                latitude, longitude, 
                node.latitude, node.longitude
            )
            load_factor = node.current_load / max(1, node.gpu_capacity)
            # Combine distance and load for scoring
            return distance * (1 + load_factor)
            
        candidates.sort(key=score_node)
        return candidates[:k]
        
    def update_node_load(self, node_id: str, load: int):
        """Update current load of a node."""
        if node_id in self.nodes:
            self.nodes[node_id].current_load = load
            
    def _get_shard(self, latitude: float, longitude: float) -> Tuple[int, int]:
        """Convert coordinates to shard indices."""
        lat_idx = int((latitude + 90) / self.shard_size)
        lon_idx = int((longitude + 180) / self.shard_size)
        return (lat_idx, lon_idx)
        
    def _haversine_distance(self, lat1: float, lon1: float, 
                           lat2: float, lon2: float) -> float:
        """Calculate distance between two points on Earth in km."""
        R = 6371  # Earth's radius in km
        
        # Convert to radians
        lat1, lon1 = math.radians(lat1), math.radians(lon1)
        lat2, lon2 = math.radians(lat2), math.radians(lon2)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + \
            math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c