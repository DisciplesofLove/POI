"""GPU memory manager for efficient model loading and unloading."""

import torch
import torch.cuda as cuda
from typing import Dict, Optional, List
import logging

class GPUMemoryManager:
    def __init__(self, buffer_ratio: float = 0.4):
        """Initialize GPU memory manager.
        
        Args:
            buffer_ratio: Ratio of GPU memory to keep free as buffer (0.4 = 40%)
        """
        self.buffer_ratio = buffer_ratio
        self.model_memory: Dict[str, int] = {}  # Model ID to memory usage
        self.cached_models: Dict[str, torch.nn.Module] = {}
        
    def get_available_memory(self) -> int:
        """Get available GPU memory in bytes."""
        if not torch.cuda.is_available():
            return 0
            
        # Get total and reserved memory
        total_memory = torch.cuda.get_device_properties(0).total_memory
        reserved = torch.cuda.memory_reserved(0)
        allocated = torch.cuda.memory_allocated(0)
        
        # Calculate free memory considering buffer
        free_memory = total_memory - reserved - allocated
        usable_memory = free_memory * (1 - self.buffer_ratio)
        
        return int(usable_memory)
        
    def can_load_model(self, model_id: str, model_size: int) -> bool:
        """Check if model can be loaded into GPU memory."""
        return model_size <= self.get_available_memory()
        
    def cache_model(self, model_id: str, model: torch.nn.Module):
        """Cache model in GPU memory."""
        if not torch.cuda.is_available():
            return
            
        try:
            # Record initial memory
            initial_memory = torch.cuda.memory_allocated(0)
            
            # Move model to GPU
            model.cuda()
            
            # Calculate memory usage
            final_memory = torch.cuda.memory_allocated(0)
            model_size = final_memory - initial_memory
            
            self.model_memory[model_id] = model_size
            self.cached_models[model_id] = model
            
        except RuntimeError as e:
            logging.error(f"Failed to cache model {model_id}: {e}")
            self.free_memory(model_id)
            raise
            
    def free_memory(self, model_id: str):
        """Free GPU memory used by model."""
        if model_id in self.cached_models:
            self.cached_models[model_id].cpu()
            del self.cached_models[model_id]
            del self.model_memory[model_id]
            
        # Force garbage collection
        torch.cuda.empty_cache()
        
    def optimize_memory(self, required_memory: int):
        """Free memory until required amount is available."""
        while self.get_available_memory() < required_memory and self.cached_models:
            # Remove least recently used model
            model_id = min(
                self.cached_models.keys(),
                key=lambda m: self.model_memory[m]
            )
            self.free_memory(model_id)
            
    def get_cached_model(self, model_id: str) -> Optional[torch.nn.Module]:
        """Get cached model if available."""
        return self.cached_models.get(model_id)