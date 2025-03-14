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
    def __init__(self):
        self.models: Dict[str, nn.Module] = {}
        self.tokenizers: Dict[str, AutoTokenizer] = {}
        self.provers: Dict[str, ZKProver] = {}
        
    def load_model(self, model_id: str, model_path: str):
        """Load an AI model for inference"""
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
                    model_path
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
            
    def execute_inference(
        self,
        model_id: str,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute model inference"""
        try:
            model = self.models[model_id]
            
            # Convert inputs to tensors
            if isinstance(input_data, dict):
                input_tensors = {
                    k: torch.tensor(v) for k, v in input_data.items()
                }
            else:
                input_tensors = torch.tensor(input_data)
                
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
                    output_text = tokenizer.decode(
                        outputs.logits.argmax(dim=-1)[0]
                    )
                    result = {"text": output_text}
                else:
                    # Generic model inference
                    outputs = model(input_tensors)
                    result = {
                        "outputs": outputs.detach().cpu().numpy().tolist()
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