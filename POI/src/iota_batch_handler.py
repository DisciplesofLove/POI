"""IOTA-based batch processing handler for free tier inference."""

import asyncio
from typing import Dict, List, Any, Optional
import logging
import time
from collections import defaultdict

from iota_sdk import Client, Wallet
from .iota_inference_handler import IOTAInferenceHandler

class IOTABatchHandler:
    def __init__(
        self,
        iota_node_url: str,
        wallet_seed: str,
        batch_size: int = 32,
        max_latency_ms: float = 100.0
    ):
        self.iota_handler = IOTAInferenceHandler(iota_node_url, wallet_seed)
        self.batch_size = batch_size
        self.max_latency = max_latency_ms / 1000.0
        self.batches: Dict[str, Dict] = {}  # model_id -> batch info
        
    def start(self):
        """Start the batch processor."""
        asyncio.create_task(self._process_batches())
        
    async def add_request(
        self,
        model_id: str,
        input_data: Dict[str, Any]
    ) -> Optional[str]:
        """Add request to batch queue."""
        if model_id not in self.batches:
            self.batches[model_id] = {
                "requests": [],
                "start_time": time.time()
            }
            
        batch = self.batches[model_id]
        message_id = await self.iota_handler.request_inference(
            model_id, input_data
        )
        
        batch["requests"].append({
            "message_id": message_id,
            "time": time.time()
        })
        
        # Execute batch if full or timed out
        if self._should_execute_batch(model_id):
            await self._execute_batch(model_id)
            
        return message_id
        
    def _should_execute_batch(self, model_id: str) -> bool:
        """Check if batch should be executed."""
        batch = self.batches.get(model_id)
        if not batch:
            return False
            
        return (
            len(batch["requests"]) >= self.batch_size or
            (time.time() - batch["start_time"]) >= self.max_latency
        )
        
    async def _execute_batch(self, model_id: str):
        """Execute a batch of requests."""
        try:
            batch = self.batches[model_id]
            message_ids = [req["message_id"] for req in batch["requests"]]
            
            # Wait for all results
            results = await asyncio.gather(*[
                self.iota_handler.receive_inference_result(
                    model_id,
                    message_id
                )
                for message_id in message_ids
            ])
            
            # Calculate latencies
            for i, result in enumerate(results):
                if result:
                    latency = int((time.time() - batch["requests"][i]["time"]) * 1000)
                    result["latency_ms"] = latency
                    
            # Log metrics
            successful = sum(1 for r in results if r is not None)
            avg_latency = sum(r["latency_ms"] for r in results if r) / max(successful, 1)
            logging.info(
                f"Batch complete: {successful}/{len(results)} successful, "
                f"avg latency: {avg_latency:.1f}ms"
            )
            
        except Exception as e:
            logging.error(f"Error executing batch: {e}")
            
        finally:
            # Clear batch
            self.batches[model_id] = {
                "requests": [],
                "start_time": time.time()
            }
            
    async def _process_batches(self):
        """Background task to process batches."""
        while True:
            try:
                for model_id in list(self.batches.keys()):
                    if self._should_execute_batch(model_id):
                        await self._execute_batch(model_id)
            except Exception as e:
                logging.error(f"Error in batch processor: {e}")
                
            await asyncio.sleep(0.010)  # 10ms check interval