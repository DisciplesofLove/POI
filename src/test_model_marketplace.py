"""
Tests for the decentralized AI model marketplace with personal stores
"""
import pytest
from web3 import Web3
from eth_account import Account
import os
import json
from unittest.mock import MagicMock, patch
from model_marketplace import ModelMarketplace

@pytest.fixture
def web3():
    return Web3(Web3.HTTPProvider("http://localhost:8545"))

@pytest.fixture
def accounts(web3):
    return [Account.create() for _ in range(3)]

@pytest.fixture
def mock_ipfs():
    mock = MagicMock()
    mock.add.return_value = "QmTest123"
    mock.add_json.return_value = "QmTestJson456"
    mock.get_json.return_value = {"test": "metadata"}
    return mock

@pytest.fixture
def marketplace(accounts, mock_ipfs):
    with patch('model_marketplace.ipfs_client.connect', return_value=mock_ipfs):
        marketplace = ModelMarketplace(
            private_key=accounts[0].key.hex(),
            marketplace_address="0x1234567890123456789012345678901234567890",
            web3_provider="http://localhost:8545"
        )
        return marketplace

def test_create_store(marketplace, mock_ipfs):
    """Test creating a new store"""
    store_id = marketplace.create_store(
        name="Test Store",
        description="A test store for AI models"
    )
    
    assert store_id is not None
    assert len(store_id) == 64  # 32 bytes hex string

def test_register_model(marketplace, mock_ipfs):
    """Test registering a new model in a store"""
    # First create a store
    store_id = marketplace.create_store(
        name="Test Store",
        description="A test store for AI models"
    )
    
    # Then register a model
    model_id = marketplace.register_model(
        name="Test Model",
        description="A test AI model",
        version="1.0.0",
        model_path="/path/to/model.pt",
        documentation_path="/path/to/docs.md",
        sample_data_path="/path/to/samples.zip",
        tags=["test", "ai", "computer-vision"],
        price=100000000,  # 0.1 tokens
        additional_metadata={
            "input_format": "image/jpeg",
            "output_format": "json",
            "model_architecture": "ResNet50",
            "training_data_description": "ImageNet dataset",
            "performance_metrics": {
                "accuracy": 0.95,
                "f1_score": 0.94
            },
            "hardware_requirements": {
                "min_ram": "8GB",
                "min_gpu": "4GB VRAM"
            },
            "license": "MIT"
        }
    )
    
    assert model_id is not None
    assert len(model_id) == 64

def test_get_model_info(marketplace, mock_ipfs):
    """Test retrieving model information"""
    # Create store and register model first
    store_id = marketplace.create_store(
        name="Test Store",
        description="A test store for AI models"
    )
    
    model_id = marketplace.register_model(
        name="Test Model",
        description="A test AI model",
        version="1.0.0",
        model_path="/path/to/model.pt",
        documentation_path="/path/to/docs.md",
        sample_data_path="/path/to/samples.zip",
        tags=["test", "ai"],
        price=100000000
    )
    
    # Get model info
    info = marketplace.get_model_info(model_id)
    
    assert info["name"] == "Test Model"
    assert info["description"] == "A test AI model"
    assert info["version"] == "1.0.0"
    assert info["tags"] == ["test", "ai"]
    assert info["price"] == 100000000
    assert info["is_active"] is True
    assert "details" in info

def test_update_model(marketplace, mock_ipfs):
    """Test updating model information"""
    # Create store and register model first
    store_id = marketplace.create_store(
        name="Test Store",
        description="A test store for AI models"
    )
    
    model_id = marketplace.register_model(
        name="Test Model",
        description="A test AI model",
        version="1.0.0",
        model_path="/path/to/model.pt",
        documentation_path="/path/to/docs.md",
        sample_data_path="/path/to/samples.zip",
        tags=["test", "ai"],
        price=100000000
    )
    
    # Update model
    success = marketplace.update_model(
        model_id=model_id,
        name="Updated Model",
        description="An updated test AI model",
        version="1.1.0",
        tags=["test", "ai", "updated"],
        price=200000000
    )
    
    assert success is True
    
    # Verify updates
    info = marketplace.get_model_info(model_id)
    assert info["name"] == "Updated Model"
    assert info["description"] == "An updated test AI model"
    assert info["version"] == "1.1.0"
    assert info["price"] == 200000000

def test_list_store_models(marketplace, mock_ipfs):
    """Test listing all models in a store"""
    # Create store
    store_id = marketplace.create_store(
        name="Test Store",
        description="A test store for AI models"
    )
    
    # Register multiple models
    model_ids = []
    for i in range(3):
        model_id = marketplace.register_model(
            name=f"Test Model {i}",
            description=f"Test model number {i}",
            version="1.0.0",
            model_path="/path/to/model.pt",
            documentation_path="/path/to/docs.md",
            sample_data_path="/path/to/samples.zip",
            tags=["test", "ai"],
            price=100000000
        )
        model_ids.append(model_id)
    
    # List models
    models = marketplace.list_store_models(store_id)
    
    assert len(models) == 3
    assert all(m["is_active"] for m in models)
    assert sorted([m["name"] for m in models]) == sorted([f"Test Model {i}" for i in range(3)])

def test_use_model(marketplace, mock_ipfs):
    """Test using a model"""
    # Create store and register model
    store_id = marketplace.create_store(
        name="Test Store",
        description="A test store for AI models"
    )
    
    model_id = marketplace.register_model(
        name="Test Model",
        description="A test AI model",
        version="1.0.0",
        model_path="/path/to/model.pt",
        documentation_path="/path/to/docs.md",
        sample_data_path="/path/to/samples.zip",
        tags=["test", "ai"],
        price=100000000
    )
    
    # Use model
    success = marketplace.use_model(model_id)
    assert success is True
    
    # Verify usage count increased
    info = marketplace.get_model_info(model_id)
    assert info["total_uses"] == 1

def test_deactivate_model(marketplace, mock_ipfs):
    """Test deactivating a model"""
    # Create store and register model
    store_id = marketplace.create_store(
        name="Test Store",
        description="A test store for AI models"
    )
    
    model_id = marketplace.register_model(
        name="Test Model",
        description="A test AI model",
        version="1.0.0",
        model_path="/path/to/model.pt",
        documentation_path="/path/to/docs.md",
        sample_data_path="/path/to/samples.zip",
        tags=["test", "ai"],
        price=100000000
    )
    
    # Deactivate model
    success = marketplace.deactivate_model(model_id)
    assert success is True
    
    # Verify model is inactive
    info = marketplace.get_model_info(model_id)
    assert info["is_active"] is False