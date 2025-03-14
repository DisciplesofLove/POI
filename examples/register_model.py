"""
Example script for registering a model on the marketplace
"""
import os
import torch
import ipfsapi
from web3 import Web3
from eth_account import Account
from pathlib import Path
from dotenv import load_dotenv

from src.model_marketplace import ModelMarketplace

def upload_model(model_path: str, ipfs_client: ipfsapi.Client):
    """Upload model to IPFS."""
    # Load model
    model = torch.load(model_path)
    
    # Save model metadata
    metadata = {
        'name': 'Example CNN',
        'description': 'Example CNN model for image classification',
        'input_shape': [1, 3, 224, 224],
        'output_shape': [1, 1000],
        'framework': 'pytorch'
    }
    
    # Add files to IPFS
    metadata_hash = ipfs_client.add_json(metadata)
    model_hash = ipfs_client.add(model_path)
    
    return metadata_hash, model_hash['Hash']

def main():
    load_dotenv()
    
    # Connect to IPFS
    ipfs = ipfsapi.Client(
        os.getenv('IPFS_HOST', 'localhost'),
        int(os.getenv('IPFS_PORT', 5001))
    )
    
    # Load model and upload to IPFS
    model_path = Path('models/example_cnn.pt')
    metadata_hash, model_hash = upload_model(model_path, ipfs)
    
    # Initialize marketplace client
    marketplace = ModelMarketplace(
        os.getenv('PRIVATE_KEY'),
        os.getenv('MARKETPLACE_ADDRESS'),
        os.getenv('WEB3_PROVIDER', 'http://localhost:8545')
    )
    
    # Register model
    price = Web3.to_wei(0.1, 'ether')  # 0.1 JOY tokens per inference
    model_id = Web3.keccak(text=metadata_hash)
    success = marketplace.register_model(
        model_id.hex(),
        metadata_hash,
        price
    )
    
    if success:
        print(f"Model registered successfully!")
        print(f"Model ID: {model_id.hex()}")
        print(f"IPFS Metadata: {metadata_hash}")
        print(f"IPFS Model: {model_hash}")
    else:
        print("Failed to register model")

if __name__ == "__main__":
    main()