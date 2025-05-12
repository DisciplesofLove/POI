"""
Tests for the model fusion engine
"""
import pytest
from web3 import Web3
from eth_account import Account
import os
import json
from unittest.mock import MagicMock, patch
import asyncio
from model_fusion import ModelFusion
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
    mock.upload_json.return_value = "QmTestJson456"
    mock.download_json.return_value = {"name": "Test Fused Model", "description": "A test fused model"}
    mock.download_file.return_value = "/tmp/model.pt"
    return mock

@pytest.fixture
def mock_marketplace():
    mock = MagicMock()
    mock.get_model_info.return_value = {
        "id": "0x1234",
        "owner": "0xabcd",
        "details": {
            "model_file": "QmTest123",
            "model_architecture": "transformer",
            "input_format": "text",
            "output_format": "embeddings"
        }
    }
    return mock

@pytest.fixture
def fusion_engine(accounts, mock_ipfs, mock_marketplace):
    with patch('model_fusion.IPFSStorage', return_value=mock_ipfs), \
         patch('model_fusion.ModelMarketplace', return_value=mock_marketplace):
        fusion = ModelFusion(
            private_key=accounts[0].key.hex(),
            fusion_contract_address="0x1234567890123456789012345678901234567890",
            marketplace_address="0x0987654321098765432109876543210987654321",
            web3_provider="http://localhost:8545"
        )
        return fusion

def test_check_compatibility(fusion_engine, mock_marketplace):
    """Test checking compatibility between models"""
    # Set up different model architectures
    mock_marketplace.get_model_info.side_effect = [
        {
            "id": "0x1234",
            "details": {
                "model_architecture": "vision-transformer",
                "input_format": "image",
                "output_format": "embeddings"
            }
        },
        {
            "id": "0x5678",
            "details": {
                "model_architecture": "language-model",
                "input_format": "embeddings",
                "output_format": "text"
            }
        }
    ]
    
    result = fusion_engine.check_compatibility(["0x1234", "0x5678"])
    
    assert result["is_compatible"] is True
    assert result["score"] > 60.0
    assert len(result["connection_points"]) > 0
    assert "recommendations" in result

@pytest.mark.asyncio
async def test_create_fused_model(fusion_engine, mock_ipfs):
    """Test creating a fused model"""
    # Mock the contract call
    fusion_engine.fusion_contract = MagicMock()
    fusion_engine.fusion_contract.functions.createFusedModel.return_value.build_transaction.return_value = {
        'from': '0x1234',
        'gas': 3000000,
        'gasPrice': 20000000000,
        'nonce': 0
    }
    
    # Mock the transaction receipt with event logs
    receipt = {
        'logs': [{
            'address': '0x1234567890123456789012345678901234567890',
            'topics': [
                '0x1234567890123456789012345678901234567890123456789012345678901234',
                '0x0000000000000000000000000000000000000000000000000000000000000001'
            ],
            'data': '0x0000000000000000000000000000000000000000000000000000000000000001'
        }]
    }
    fusion_engine.web3.eth.wait_for_transaction_receipt = MagicMock(return_value=receipt)
    
    # Mock the event processing
    event_mock = MagicMock()
    event_mock.args = {'fusedModelId': bytes.fromhex('1234' * 8)}
    fusion_engine.fusion_contract.events.FusedModelCreated().process_log.return_value = event_mock
    
    fused_model_id = await fusion_engine.create_fused_model(
        component_model_ids=["0x1234", "0x5678"],
        royalty_shares=[5000, 5000],  # 50% each
        name="Test Fused Model",
        description="A test fused model",
        connection_config={"type": "direct"},
        price=1.0
    )
    
    assert fused_model_id is not None
    assert isinstance(fused_model_id, str)
    assert mock_ipfs.upload_json.called

def test_get_fused_model(fusion_engine, mock_ipfs):
    """Test retrieving fused model information"""
    # Mock the contract call
    fusion_engine.fusion_contract = MagicMock()
    fusion_engine.fusion_contract.functions.getFusedModel.return_value.call.return_value = [
        "0x1234567890123456789012345678901234567890",  # creator
        [bytes.fromhex("1234" * 8), bytes.fromhex("5678" * 8)],  # component_model_ids
        ["0xabcd", "0xef01"],  # component_owners
        [5000, 5000],  # royalty_shares
        "QmTestJson456",  # metadataURI
        1000000000000000000,  # price (1 ETH)
        5,  # total_uses
        5000000000000000000,  # total_revenue (5 ETH)
        True,  # is_active
        1630000000  # created_at
    ]
    
    info = fusion_engine.get_fused_model("0x1234")
    
    assert info["creator"] == "0x1234567890123456789012345678901234567890"
    assert len(info["component_model_ids"]) == 2
    assert info["price"] == 1.0
    assert info["total_uses"] == 5
    assert info["is_active"] is True
    assert "metadata" in info

def test_use_fused_model(fusion_engine):
    """Test using a fused model"""
    # Mock the contract call
    fusion_engine.fusion_contract = MagicMock()
    fusion_engine.fusion_contract.functions.useFusedModel.return_value.build_transaction.return_value = {
        'from': '0x1234',
        'gas': 2000000,
        'gasPrice': 20000000000,
        'nonce': 0
    }
    
    result = fusion_engine.use_fused_model("0x1234")
    
    assert result is True
    assert fusion_engine.fusion_contract.functions.useFusedModel.called

@pytest.mark.asyncio
async def test_test_fused_model_performance(fusion_engine, mock_ipfs, mock_marketplace):
    """Test the performance testing functionality"""
    # Mock torch.load
    with patch('torch.load', return_value=MagicMock()):
        result = await fusion_engine.test_fused_model_performance(
            component_model_ids=["0x1234", "0x5678"],
            connection_config={"type": "direct"},
            test_data={"input": "test"}
        )
        
        assert "accuracy" in result
        assert "latency" in result
        assert "throughput" in result
        assert "improvement" in result
        assert 0 <= result["accuracy"] <= 1.0
        assert result["latency"] > 0
        assert result["throughput"] > 0
        assert result["improvement"] > 0