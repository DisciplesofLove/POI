"""Model usage predictor for optimizing model loading."""

import torch
import torch.nn as nn
from collections import defaultdict
from typing import Dict, List, Set, Optional
import time
import logging

class ModelPredictor:
    def __init__(self, cache_size: int = 5):
        self.cache_size = cache_size
        self.user_history: Dict[str, List[str]] = defaultdict(list)
        self.model_usage_count: Dict[str, int] = defaultdict(int)
        self.last_used: Dict[str, float] = defaultdict(float)
        self.cached_models: Set[str] = set()
        
    def record_usage(self, user_id: str, model_id: str):
        """Record model usage for prediction."""
        self.user_history[user_id].append(model_id)
        self.model_usage_count[model_id] += 1
        self.last_used[model_id] = time.time()
        
        # Keep history bounded
        if len(self.user_history[user_id]) > 100:
            self.user_history[user_id] = self.user_history[user_id][-100:]
            
    def predict_next_models(self, user_id: str, k: int = 3) -> List[str]:
        """Predict next k models likely to be used."""
        if user_id not in self.user_history or not self.user_history[user_id]:
            # Return most commonly used models if no history
            sorted_models = sorted(
                self.model_usage_count.items(),
                key=lambda x: x[1],
                reverse=True
            )
            return [m[0] for m in sorted_models[:k]]
            
        # Use recent history and global popularity
        recent_models = self.user_history[user_id][-5:]
        scores = defaultdict(float)
        
        # Score based on recency and frequency
        for model_id in self.model_usage_count:
            # Recency score
            if model_id in recent_models:
                scores[model_id] += 3.0
                
            # Frequency score
            scores[model_id] += self.model_usage_count[model_id] / \
                              sum(self.model_usage_count.values())
                              
            # Time decay
            time_diff = time.time() - self.last_used[model_id]
            scores[model_id] *= max(0.1, 1.0 - (time_diff / (24 * 3600)))
            
        return sorted(scores, key=scores.get, reverse=True)[:k]
        
    def update_cache(self, available_gpu_memory: float):
        """Update cached models based on predictions and available GPU memory."""
        scores = defaultdict(float)
        
        # Score all models based on usage patterns
        for model_id in self.model_usage_count:
            scores[model_id] = self.model_usage_count[model_id] / \
                             max(1, time.time() - self.last_used[model_id])
                             
        # Sort by score
        sorted_models = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        # Update cache with top models that fit in memory
        new_cache = set()
        remaining_memory = available_gpu_memory
        
        for model_id, _ in sorted_models:
            if remaining_memory > 0:
                new_cache.add(model_id)
                # Assume each model takes ~2GB (can be made more precise)
                remaining_memory -= 2
            else:
                break
                
        return new_cache

    def should_cache_model(self, model_id: str) -> bool:
        """Determine if a model should be cached based on usage patterns."""
        if len(self.cached_models) < self.cache_size:
            return True
            
        # Get least used cached model
        least_used = min(
            self.cached_models,
            key=lambda m: self.model_usage_count[m]
        )
        
        return self.model_usage_count[model_id] > self.model_usage_count[least_used]