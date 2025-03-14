"""
Example script for running model inference
"""
import os
import torch
import ipfsapi
from web3 import Web3
from eth_account import Account
from pathlib import Path
from dotenv import load_dotenv

from src.inference_node import InferenceNode
from src.model_marketplace import ModelMarketplace

def load_model_from_ipfs(model_id: str, ipfs_client: ipfsapi.Client):
    """Load model files from IPFS."""
    # Get model info
    marketplace = ModelMarketplace(
        os.getenv('PRIVATE_KEY'),
        os.getenv('MARKETPLACE_ADDRESS')
    )
    info = marketplace.get_model_info(model_id)
    
    # Get metadata and model from IPFS
    metadata = ipfs_client.get_json(info['metadata'])
    model_path = ipfs_client.get(metadata['model_hash'])
    
    return model_path

def main():
    load_dotenv()
    
    # Connect to IPFS
    ipfs = ipfsapi.Client(
        os.getenv('IPFS_HOST', 'localhost'),
        int(os.getenv('IPFS_PORT', 5001))
    )
    
    # Initialize inference node
    node = InferenceNode(
        os.getenv('PRIVATE_KEY'),
        os.getenv('POI_ADDRESS'),
        os.getenv('WEB3_PROVIDER', 'http://localhost:8545')
    )
    
    # Load model
    model_id = '0x1234...' # Replace with actual model ID
    model_path = load_model_from_ipfs(model_id, ipfs)
    node.load_model(model_id, model_path)
    
    # Prepare input
    input_data = torch.randn(1, 3, 224, 224)
    
    # Run inference
    result = node.execute_inference(model_id, input_data)
    
    print(f"Inference completed!")
    print(f"Execution ID: {result['executionId']}")
    print(f"Output shape: {result['output'].shape}")
    print(f"ZK Proof: {result['proof']}")
    
    # Validate execution
    is_valid = node.validate_inference(result['executionId'])
    print(f"Execution validated: {is_valid}")

if __name__ == "__main__":
    main()