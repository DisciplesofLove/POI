"""
IPFS utilities for model and data storage
"""
import os
import json
from pathlib import Path
from typing import Dict, Any, Tuple
import ipfsapi
import torch

class IPFSStorage:
    def __init__(self, host: str = "localhost", port: int = 5001):
        """Initialize IPFS storage client.
        
        Args:
            host: IPFS daemon host
            port: IPFS daemon port
        """
        self.client = ipfsapi.Client(host, port)
        
    def upload_model(self, model: torch.nn.Module, metadata: Dict[str, Any]) -> Tuple[str, str]:
        """Upload model and metadata to IPFS.
        
        Args:
            model: PyTorch model to upload
            metadata: Model metadata dictionary
            
        Returns:
            Tuple of (metadata_hash, model_hash)
        """
        # Save model to temp file
        temp_path = Path("temp_model.pt")
        torch.save(model, temp_path)
        
        try:
            # Upload model file
            model_result = self.client.add(str(temp_path))
            model_hash = model_result['Hash']
            
            # Add model hash to metadata
            metadata['model_hash'] = model_hash
            
            # Upload metadata
            metadata_hash = self.client.add_json(metadata)
            
            return metadata_hash, model_hash
            
        finally:
            # Clean up temp file
            if temp_path.exists():
                temp_path.unlink()
                
    def download_model(self, metadata_hash: str) -> Tuple[torch.nn.Module, Dict[str, Any]]:
        """Download model and metadata from IPFS.
        
        Args:
            metadata_hash: IPFS hash of model metadata
            
        Returns:
            Tuple of (model, metadata)
        """
        # Get metadata
        metadata = self.client.get_json(metadata_hash)
        
        # Get model file
        temp_path = Path("temp_model.pt")
        self.client.get(metadata['model_hash'], str(temp_path))
        
        try:
            # Load model
            model = torch.load(temp_path)
            return model, metadata
            
        finally:
            # Clean up
            if temp_path.exists():
                temp_path.unlink()
                
    def upload_data(self, data: Any, metadata: Dict[str, Any] = None) -> str:
        """Upload input/output data to IPFS.
        
        Args:
            data: Data to upload
            metadata: Optional metadata
            
        Returns:
            IPFS hash
        """
        # Convert to bytes if needed
        if isinstance(data, torch.Tensor):
            data = data.detach().cpu().numpy().tobytes()
        elif not isinstance(data, bytes):
            data = str(data).encode()
            
        # Add to IPFS
        result = self.client.add_bytes(data)
        
        # Store metadata if provided
        if metadata:
            metadata['data_hash'] = result
            self.client.add_json(metadata)
            
        return result
        
    def download_data(self, ipfs_hash: str) -> bytes:
        """Download data from IPFS.
        
        Args:
            ipfs_hash: IPFS hash of data
            
        Returns:
            Data bytes
        """
        return self.client.cat(ipfs_hash)