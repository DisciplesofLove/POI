"""
System integration tests
"""
import pytest
from web3 import Web3
from eth_account import Account

from src.edge_node import EdgeNode
from src.model_marketplace import ModelMarketplace
from src.inference_node import InferenceNode

def test_full_workflow():
    """Test the full system workflow."""
    # Setup accounts
    w3 = Web3(Web3.HTTPProvider("http://localhost:8545"))
    owner = Account.create()
    node = Account.create()
    user = Account.create()
    
    # Deploy contracts (would use deployment scripts in practice)
    # This is just a test skeleton
    
    # Register model
    marketplace = ModelMarketplace(
        owner.key.hex(),
        "0x1234...", # Marketplace contract address
    )
    model_id = "0x2345..."
    assert marketplace.register_model(
        model_id,
        "ipfs://Qm...", # Model metadata
        Web3.to_wei(0.1, "ether") # Price per inference
    )
    
    # Start edge node
    edge = EdgeNode(
        node.key.hex(),
        "0x3456...", # Coordinator address
        "0x4567..." # POI address
    )
    edge.load_model(model_id, "models/test_model.pt")
    
    # Execute inference
    inference = InferenceNode(
        user.key.hex(),
        "0x4567..." # POI address
    )
    result = inference.execute_inference(
        model_id,
        [1.0, 2.0, 3.0] # Test input
    )
    
    # Verify proof
    assert "executionId" in result
    assert inference.validate_inference(result["executionId"])