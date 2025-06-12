"""
Decentralized storage module supporting multiple providers and storage durations.

Supports:
- IPFS for short-term storage (hours to days)
- Filecoin for mid-term storage (months)
- Arweave for long-term/permanent storage (years)
"""
from abc import ABC, abstractmethod
import os
import json
from enum import Enum
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, Union, BinaryIO
import ipfsapi
import torch
import requests
from web3 import Web3

class StorageDuration(Enum):
    SHORT_TERM = "short"  # IPFS - hours to days
    MID_TERM = "mid"      # Filecoin - months
    LONG_TERM = "long"    # Arweave - years/permanent

class StorageProvider(ABC):
    @abstractmethod
    def store(self, data: Union[bytes, BinaryIO], metadata: Optional[Dict[str, Any]] = None) -> str:
        """Store data and return content identifier"""
        pass
    
    @abstractmethod
    def retrieve(self, content_id: str) -> bytes:
        """Retrieve data by content identifier"""
        pass
    
    @abstractmethod
    def verify(self, content_id: str) -> bool:
        """Verify data is still accessible"""
        pass

class IPFSProvider(StorageProvider):
    def __init__(self, host: str = "localhost", port: int = 5001):
        self.client = ipfsapi.Client(host, port)
        
    def store(self, data: Union[bytes, BinaryIO], metadata: Optional[Dict[str, Any]] = None) -> str:
        if isinstance(data, bytes):
            content_id = self.client.add_bytes(data)
        else:
            content_id = self.client.add(data)['Hash']
            
        if metadata:
            metadata['content_id'] = content_id
            self.client.add_json(metadata)
            
        return content_id
        
    def retrieve(self, content_id: str) -> bytes:
        return self.client.cat(content_id)
        
    def verify(self, content_id: str) -> bool:
        try:
            self.client.ls(content_id)
            return True
        except:
            return False

class FilecoinProvider(StorageProvider):
    def __init__(self, api_token: str, endpoint: str = "https://api.filecoin.io"):
        self.api_token = api_token
        self.endpoint = endpoint
        
    def store(self, data: Union[bytes, BinaryIO], metadata: Optional[Dict[str, Any]] = None) -> str:
        # First store on IPFS
        ipfs = IPFSProvider()
        ipfs_cid = ipfs.store(data, metadata)
        
        # Make Filecoin storage deal
        headers = {"Authorization": f"Bearer {self.api_token}"}
        deal_params = {
            "cid": ipfs_cid,
            "duration": 2880, # 6 months in epochs
            "replication": 3,
            "verified": True
        }
        
        response = requests.post(
            f"{self.endpoint}/storage/deals/make",
            headers=headers,
            json=deal_params
        )
        response.raise_for_status()
        
        return ipfs_cid # Return IPFS CID which can be used to retrieve
        
    def retrieve(self, content_id: str) -> bytes:
        # Retrieval works through IPFS gateway
        ipfs = IPFSProvider() 
        return ipfs.retrieve(content_id)
        
    def verify(self, content_id: str) -> bool:
        # Check deal status
        headers = {"Authorization": f"Bearer {self.api_token}"}
        response = requests.get(
            f"{self.endpoint}/storage/deals/{content_id}",
            headers=headers
        )
        if response.ok:
            deal = response.json()
            return deal["status"] == "active"
        return False

class ArweaveProvider(StorageProvider):
    def __init__(self, wallet_file: str):
        """Initialize with path to Arweave wallet key file"""
        with open(wallet_file) as f:
            self.wallet = json.load(f)
            
    def store(self, data: Union[bytes, BinaryIO], metadata: Optional[Dict[str, Any]] = None) -> str:
        # Implement Arweave transaction creation and posting
        # This is a simplified version - production code would need proper transaction
        # signing and posting to Arweave network
        
        if isinstance(data, bytes):
            data_bytes = data
        else:
            data_bytes = data.read()
            
        transaction = {
            "data": data_bytes,
            "tags": metadata or {}
        }
        
        # Sign and post transaction
        # Returns transaction ID
        return "ar_transaction_id"  # Placeholder
        
    def retrieve(self, content_id: str) -> bytes:
        response = requests.get(f"https://arweave.net/{content_id}")
        response.raise_for_status()
        return response.content
        
    def verify(self, content_id: str) -> bool:
        try:
            response = requests.head(f"https://arweave.net/{content_id}")
            return response.ok
        except:
            return False

class DecentralizedStorage:
    """Main storage interface that handles multiple providers"""
    
    def __init__(self, 
                 ipfs_host: str = "localhost",
                 ipfs_port: int = 5001,
                 filecoin_token: Optional[str] = None,
                 arweave_keyfile: Optional[str] = None):
        
        self.providers = {
            StorageDuration.SHORT_TERM: IPFSProvider(ipfs_host, ipfs_port)
        }
        
        if filecoin_token:
            self.providers[StorageDuration.MID_TERM] = FilecoinProvider(filecoin_token)
            
        if arweave_keyfile:
            self.providers[StorageDuration.LONG_TERM] = ArweaveProvider(arweave_keyfile)
            
    def store(self, 
             data: Union[bytes, BinaryIO, torch.Tensor],
             duration: StorageDuration,
             metadata: Optional[Dict[str, Any]] = None) -> str:
        """Store data using appropriate provider based on duration"""
        
        if duration not in self.providers:
            raise ValueError(f"No provider configured for {duration.value} term storage")
            
        # Convert torch tensor to bytes if needed
        if isinstance(data, torch.Tensor):
            data = data.detach().cpu().numpy().tobytes()
            
        return self.providers[duration].store(data, metadata)
        
    def retrieve(self, content_id: str, duration: StorageDuration) -> bytes:
        """Retrieve data from appropriate provider"""
        if duration not in self.providers:
            raise ValueError(f"No provider configured for {duration.value} term storage")
            
        return self.providers[duration].retrieve(content_id)
        
    def verify(self, content_id: str, duration: StorageDuration) -> bool:
        """Verify data is still accessible"""
        if duration not in self.providers:
            raise ValueError(f"No provider configured for {duration.value} term storage")
            
        return self.providers[duration].verify(content_id)
        
    def store_model(self,
                   model: torch.nn.Module,
                   metadata: Dict[str, Any],
                   duration: StorageDuration) -> Tuple[str, str]:
        """Store PyTorch model and metadata"""
        
        # Save model to temp file
        temp_path = Path("temp_model.pt")
        torch.save(model, temp_path)
        
        try:
            # Store model file
            with open(temp_path, 'rb') as f:
                model_id = self.store(f, duration)
                
            # Add model ID to metadata
            metadata['model_id'] = model_id
            
            # Store metadata
            metadata_id = self.store(
                json.dumps(metadata).encode(),
                duration
            )
            
            return metadata_id, model_id
            
        finally:
            if temp_path.exists():
                temp_path.unlink()
                
    def load_model(self,
                  metadata_id: str,
                  duration: StorageDuration) -> Tuple[torch.nn.Module, Dict[str, Any]]:
        """Load PyTorch model and metadata"""
        
        # Get metadata
        metadata_bytes = self.retrieve(metadata_id, duration)
        metadata = json.loads(metadata_bytes)
        
        # Get model data
        model_bytes = self.retrieve(metadata['model_id'], duration)
        
        # Save to temp file and load
        temp_path = Path("temp_model.pt")
        try:
            with open(temp_path, 'wb') as f:
                f.write(model_bytes)
            model = torch.load(temp_path)
            return model, metadata
        finally:
            if temp_path.exists():
                temp_path.unlink()