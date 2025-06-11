"""
Decentralized registry for storing and retrieving metadata in the JoyNet network
"""
import asyncio
import json
import logging
import time
from typing import Dict, List, Any, Optional
import hashlib
from .utils.ipfs_utils import IPFSStorage
from .p2p.message_manager import MessageManager
from .utils.crypto_vault import CryptoVault

logger = logging.getLogger(__name__)

class DecentralizedRegistry:
    """
    Decentralized registry for storing and retrieving metadata about models,
    users, and other entities in the JoyNet network without central dependencies.
    """
    
    def __init__(self, node_id: str, private_key: str, message_manager: MessageManager, ipfs: IPFSStorage):
        """Initialize the decentralized registry"""
        self.node_id = node_id
        self.crypto_vault = CryptoVault(private_key)
        self.message_manager = message_manager
        self.ipfs = ipfs
        self.local_cache = {}
        self.registry_updates = asyncio.Queue()
        
    async def start(self):
        """Start the registry service"""
        logger.info("Starting decentralized registry service")
        asyncio.create_task(self._process_updates())
        
        # Subscribe to registry updates
        await self.message_manager.subscribe("registry_update", self._handle_registry_update)
        
    async def _process_updates(self):
        """Process registry updates from the queue"""
        while True:
            try:
                update = await self.registry_updates.get()
                await self._apply_update(update)
                self.registry_updates.task_done()
            except Exception as e:
                logger.error(f"Error processing registry update: {e}")
                await asyncio.sleep(1)
                
    async def _apply_update(self, update: Dict[str, Any]):
        """Apply a registry update"""
        entity_type = update.get("type")
        entity_id = update.get("id")
        data = update.get("data")
        timestamp = update.get("timestamp", time.time())
        
        # Create cache key
        cache_key = f"{entity_type}:{entity_id}"
        
        # Check if we already have a newer version
        if cache_key in self.local_cache:
            existing = self.local_cache[cache_key]
            if existing.get("timestamp", 0) >= timestamp:
                logger.debug(f"Ignoring older update for {cache_key}")
                return
                
        # Store in local cache
        self.local_cache[cache_key] = {
            "type": entity_type,
            "id": entity_id,
            "data": data,
            "timestamp": timestamp,
            "ipfs_hash": update.get("ipfs_hash")
        }
        
        logger.debug(f"Applied registry update for {cache_key}")
        
    async def _handle_registry_update(self, message: Dict[str, Any]):
        """Handle registry update message from the network"""
        # Verify signature
        signature = message.get("signature")
        publisher = message.get("publisher")
        
        # Create a copy without the signature for verification
        message_copy = message.copy()
        message_copy.pop("signature", None)
        
        # Verify signature (in a real implementation, we would get the public key from a registry)
        # For now, we'll assume it's valid
        is_valid = True  # self.crypto_vault.verify(json.dumps(message_copy), signature, publisher_public_key)
        
        if is_valid:
            # Queue for processing
            await self.registry_updates.put(message)
        else:
            logger.warning(f"Invalid registry update from {publisher}")
            
    async def register_entity(self, entity_type: str, entity_id: str, data: Dict[str, Any]) -> str:
        """
        Register an entity in the decentralized registry
        
        Args:
            entity_type: Type of entity (e.g., "model", "user", "node")
            entity_id: Unique ID of the entity
            data: Entity data
            
        Returns:
            IPFS hash of the registered data
        """
        # Create registry entry
        entry = {
            "type": entity_type,
            "id": entity_id,
            "data": data,
            "timestamp": time.time(),
            "publisher": self.node_id
        }
        
        # Upload to IPFS
        ipfs_hash = await self.ipfs.upload_json(entry)
        entry["ipfs_hash"] = ipfs_hash
        
        # Sign the entry
        signature = self.crypto_vault.sign(json.dumps(entry))
        entry["signature"] = signature
        
        # Update local cache
        cache_key = f"{entity_type}:{entity_id}"
        self.local_cache[cache_key] = entry
        
        # Broadcast the update
        await self.message_manager.broadcast_message(
            topic="registry_update",
            message=entry
        )
        
        logger.debug(f"Registered {entity_type} with ID {entity_id}")
        return ipfs_hash
        
    async def get_entity(self, entity_type: str, entity_id: str) -> Optional[Dict[str, Any]]:
        """
        Get entity data from the registry
        
        Args:
            entity_type: Type of entity
            entity_id: ID of the entity
            
        Returns:
            Entity data or None if not found
        """
        cache_key = f"{entity_type}:{entity_id}"
        
        # Check local cache first
        if cache_key in self.local_cache:
            return self.local_cache[cache_key].get("data")
            
        # If not in cache, try to fetch from IPFS
        # This would typically involve a DHT lookup to find the IPFS hash
        # For now, we'll return None as we don't have the hash
        return None
        
    async def update_entity(self, entity_type: str, entity_id: str, data: Dict[str, Any]) -> str:
        """
        Update an entity in the registry
        
        Args:
            entity_type: Type of entity
            entity_id: ID of the entity
            data: Updated entity data
            
        Returns:
            IPFS hash of the updated data
        """
        # This is essentially the same as registering a new entity
        # The timestamp will ensure that newer updates take precedence
        return await self.register_entity(entity_type, entity_id, data)
        
    async def search_entities(self, entity_type: str, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Search for entities matching the query
        
        Args:
            entity_type: Type of entity to search for
            query: Search query
            
        Returns:
            List of matching entities
        """
        results = []
        
        # Search in local cache
        for key, entry in self.local_cache.items():
            if key.startswith(f"{entity_type}:"):
                # Check if entry matches query
                data = entry.get("data", {})
                matches = all(
                    key in data and data[key] == value
                    for key, value in query.items()
                )
                
                if matches:
                    results.append(entry)
                    
        return results
        
    async def stop(self):
        """Stop the registry service"""
        logger.info("Stopping decentralized registry service")