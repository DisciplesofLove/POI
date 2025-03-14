"""
AI model execution and verification engine
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

import torch
import torch.nn as nn
from transformers import AutoModelForCausalLM, AutoTokenizer

from .zk_proof import ZKProver

class InferenceEngine:
    def __init__(self, batch_size: int = 32, max_latency_ms: float = 100.0):
        self.models: Dict[str, nn.Module] = {}
        self.tokenizers: Dict[str, AutoTokenizer] = {}
        self.provers: Dict[str, ZKProver] = {}
        self.batch_size = batch_size
        self.max_latency = max_latency_ms / 1000.0  # Convert to seconds
        self.batch_queue: Dict[str, List[Dict]] = defaultdict(list)
        self.executor = ThreadPoolExecutor(max_workers=4)
        
    async def load_model(self, model_id: str, model_path: str):
        """Load an AI model for inference with hardware acceleration"""
        try:
            if model_id in self.models:
                return
                
            # Load model config
            config_path = Path(model_path) / "config.json"
            with open(config_path) as f:
                config = json.load(f)
                
            # Load model based on type
            if config["type"] == "causal_lm":
                self.models[model_id] = AutoModelForCausalLM.from_pretrained(
                    model_path,
                    device_map="auto"  # Enable automatic device placement
                )
                self.tokenizers[model_id] = AutoTokenizer.from_pretrained(
                    model_path
                )
            else:
                self.models[model_id] = torch.load(
                    Path(model_path) / "model.pt"
                )
                
            # Initialize prover
            self.provers[model_id] = ZKProver(model_id)
            
            logging.info(f"Loaded model {model_id}")
            
        except Exception as e:
            logging.error(f"Error loading model {model_id}: {e}")
            raise
            
    async def execute_inference(
        self,
        model_id: str,
        input_data: Dict[str, Any],
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Execute model inference with batching support"""
        try:
            model = self.models[model_id]
            
            start_time = time.time()
            
            # Convert input to tensor with CUDA support
            if isinstance(input_data, dict):
                input_tensors = {
                    k: torch.tensor(v, device="cuda") 
                    for k, v in input_data.items()
                }
            else:
                input_tensors = torch.tensor(input_data, device="cuda")
                
            # Add to batch queue
            batch_req = {
                "input": input_tensors,
                "user_id": user_id,
                "time": start_time
            }
            self.batch_queue[model_id].append(batch_req)
            
            # Check if we should execute batch
            should_execute = (
                len(self.batch_queue[model_id]) >= self.batch_size or
                (time.time() - self.batch_queue[model_id][0]["time"]) >= self.max_latency
            )
                
            # Run inference
            with torch.no_grad():
                if model_id in self.tokenizers:
                    # Language model inference
                    tokenizer = self.tokenizers[model_id]
                    inputs = tokenizer(
                        input_data["text"],
                        return_tensors="pt"
                    )
                    outputs = model(**inputs)
                    if should_execute:
                        # Process batch results
                        results = []
                        for i, output in enumerate(outputs):
                            text = tokenizer.decode(output, skip_special_tokens=True)
                            inference_time = int((time.time() - self.batch_queue[model_id][i]["time"]) * 1000)
                            results.append({
                                "text": text,
                                "latency_ms": inference_time
                            })
                        self.batch_queue[model_id] = []  # Clear batch queue
                        result = results[0]  # Return first result for compatibility
                    else:
                        output_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
                        result = {"text": output_text}
                        result["latency_ms"] = int((time.time() - start_time) * 1000)
                else:
                    # Generic model inference with batching
                    if should_execute:
                        # Process batch
                        stacked_inputs = torch.stack([x["input"] for x in self.batch_queue[model_id]]).cuda()
                        with torch.cuda.amp.autocast():
                            outputs = model(stacked_inputs)
                        results = []
                        for i, output in enumerate(outputs):
                            inference_time = int((time.time() - self.batch_queue[model_id][i]["time"]) * 1000)
                            results.append({
                                "outputs": output.detach().cpu().numpy().tolist(),
                                "latency_ms": inference_time
                            })
                        self.batch_queue[model_id] = []  # Clear batch queue
                        result = results[0]  # Return first result for compatibility
                    else:
                        outputs = model(input_tensors.cuda())
                        result = {
                            "outputs": outputs.detach().cpu().numpy().tolist(),
                            "latency_ms": int((time.time() - start_time) * 1000)
                        }
                    
            # Generate proof
            proof = self.provers[model_id].generate_proof(
                circuit_params={"model": model},
                input_data=input_data,
                output_data=result
            )
            result["proof"] = proof
            
            return result
            
        except Exception as e:
            logging.error(f"Inference error for model {model_id}: {e}")
            raise
            
    def validate_inference(self, execution_id: str) -> bool:
        """Validate an inference execution"""
        try:
            # Get execution details
            execution = self._get_execution(execution_id)
            if not execution:
                return False
                
            model_id = execution["model_id"]
            if model_id not in self.provers:
                return False
                
            # Verify proof
            prover = self.provers[model_id]
            return prover.verify_proof(
                execution["proof"],
                execution["input_data"],
                execution["output_data"]
            )
            
        except Exception as e:
            logging.error(f"Validation error for execution {execution_id}: {e}")
            return False
            
    def _get_execution(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """Get execution details from storage"""
        # TODO: Implement storage interface
        return None