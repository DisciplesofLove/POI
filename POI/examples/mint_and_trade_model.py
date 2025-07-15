"""
Example script for minting an AI model as NFT and performing various operations
"""
import os
import json
import torch
from web3 import Web3
from eth_account import Account
from pathlib import Path
from dotenv import load_dotenv

from src.model_marketplace import ModelMarketplace
from src.utils.ipfs_utils import IPFSStorage
from src.utils.merkle_utils import compute_model_merkle_root

def mint_model(
    model_path: str,
    marketplace: ModelMarketplace,
    ipfs_storage: IPFSStorage,
    metadata: dict,
    is_leasable: bool = True,
    lease_price: int = 1000000000000000000,  # 1 ETH
    sale_price: int = 10000000000000000000,  # 10 ETH
):
    """Mint an AI model as an NFT."""
    # Load the model
    model = torch.load(model_path)
    
    # Compute merkle root of model weights
    merkle_root = compute_model_merkle_root(model)
    
    # Upload model and metadata to IPFS
    metadata_hash, model_hash = ipfs_storage.upload_model(model, metadata)
    
    # Mint the NFT
    token_id = marketplace.mint_model(
        model_hash,
        merkle_root,
        metadata_hash,
        is_leasable,
        lease_price,
        sale_price
    )
    
    return token_id, model_hash, metadata_hash

def rebuild_model(
    token_id: int,
    marketplace: ModelMarketplace,
    ipfs_storage: IPFSStorage
):
    """Rebuild a model from its NFT token ID."""
    # Get model metadata
    metadata = marketplace.get_model_metadata(token_id)
    
    # Verify ownership or lease
    if not marketplace.can_access_model(token_id):
        raise ValueError("You don't have permission to access this model")
    
    # Download and verify model
    model, metadata = ipfs_storage.download_model(metadata['metadata_hash'])
    
    # Verify merkle root matches
    computed_root = compute_model_merkle_root(model)
    if computed_root != metadata['merkle_root']:
        raise ValueError("Model verification failed - merkle root mismatch")
        
    return model, metadata

def main():
    # Load environment variables
    load_dotenv()
    
    # Initialize Web3 and accounts
    w3 = Web3(Web3.HTTPProvider(os.getenv("WEB3_PROVIDER")))
    account = Account.from_key(os.getenv("PRIVATE_KEY"))
    
    # Initialize marketplace and IPFS storage
    marketplace = ModelMarketplace(
        os.getenv("PRIVATE_KEY"),
        os.getenv("MARKETPLACE_ADDRESS"),
        os.getenv("WEB3_PROVIDER")
    )
    ipfs_storage = IPFSStorage()
    
    # Example: Mint a model
    model_path = "models/example_model.pt"
    metadata = {
        "name": "Example CNN",
        "description": "Example CNN model for image classification",
        "input_shape": [1, 3, 224, 224],
        "output_shape": [1, 1000],
        "framework": "pytorch"
    }
    
    token_id, model_hash, metadata_hash = mint_model(
        model_path,
        marketplace,
        ipfs_storage,
        metadata
    )
    print(f"Model minted as NFT with token ID: {token_id}")
    print(f"IPFS Model Hash: {model_hash}")
    print(f"IPFS Metadata Hash: {metadata_hash}")
    
    # Example: Rebuild model
    model, metadata = rebuild_model(token_id, marketplace, ipfs_storage)
    print("Model successfully rebuilt and verified")

if __name__ == "__main__":
    main()