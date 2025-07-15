"""
Utilities for computing merkle roots of model weights
"""
import torch
import hashlib
from typing import List, Dict, Any

def compute_weight_hash(weight_tensor: torch.Tensor) -> str:
    """Compute hash of a single weight tensor."""
    # Convert tensor to bytes
    tensor_bytes = weight_tensor.cpu().numpy().tobytes()
    
    # Compute SHA256 hash
    return hashlib.sha256(tensor_bytes).hexdigest()

def compute_merkle_root(hashes: List[str]) -> str:
    """Compute merkle root from a list of hashes."""
    if len(hashes) == 0:
        return hashlib.sha256(b"").hexdigest()
    
    if len(hashes) == 1:
        return hashes[0]
    
    # If odd number of hashes, duplicate the last one
    if len(hashes) % 2 == 1:
        hashes.append(hashes[-1])
    
    new_hashes = []
    for i in range(0, len(hashes), 2):
        combined = hashes[i] + hashes[i + 1]
        new_hash = hashlib.sha256(combined.encode()).hexdigest()
        new_hashes.append(new_hash)
    
    return compute_merkle_root(new_hashes)

def compute_model_merkle_root(model: torch.nn.Module) -> str:
    """Compute merkle root of model weights."""
    # Get all weight tensors
    weight_hashes = []
    for name, param in model.named_parameters():
        if param.requires_grad:
            weight_hash = compute_weight_hash(param.data)
            weight_hashes.append(weight_hash)
    
    # Compute merkle root
    return compute_merkle_root(weight_hashes)

def verify_model_weights(
    model: torch.nn.Module,
    merkle_root: str
) -> bool:
    """Verify model weights against a merkle root."""
    computed_root = compute_model_merkle_root(model)
    return computed_root == merkle_root