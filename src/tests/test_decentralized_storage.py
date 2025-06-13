"""
Tests for the decentralized storage module
"""
import pytest
import torch
import json
from pathlib import Path
from unittest.mock import Mock, patch

from ..utils.decentralized_storage import (
    StorageDuration,
    StorageProvider,
    IPFSProvider,
    FilecoinProvider,
    ArweaveProvider,
    DecentralizedStorage
)

@pytest.fixture
def mock_ipfs():
    with patch('ipfsapi.Client') as mock:
        client = Mock()
        mock.return_value = client
        yield client

@pytest.fixture
def mock_filecoin():
    with patch('requests.post') as mock_post, \
         patch('requests.get') as mock_get:
        mock_post.return_value.ok = True
        mock_get.return_value.ok = True
        mock_get.return_value.json.return_value = {"status": "active"}
        yield (mock_post, mock_get)

@pytest.fixture
def mock_arweave():
    with patch('requests.get') as mock_get, \
         patch('requests.head') as mock_head:
        mock_get.return_value.ok = True
        mock_get.return_value.content = b"test data"
        mock_head.return_value.ok = True
        yield (mock_get, mock_head)

@pytest.fixture
def mock_cdn():
    with patch('web3.Web3') as mock_web3:
        web3 = Mock()
        mock_web3.HTTPProvider.return_value = Mock()
        mock_web3.return_value = web3
        yield web3

@pytest.fixture
def storage(mock_ipfs, mock_cdn):
    return DecentralizedStorage(
        ipfs_host="localhost",
        ipfs_port=5001,
        filecoin_token="test_token",
        arweave_keyfile="test_keyfile",
        web3_provider="http://localhost:8545",
        cdn_contract="0x1234567890"
    )

def test_ipfs_provider(mock_ipfs):
    provider = IPFSProvider()
    
    # Test store
    test_data = b"test data"
    mock_ipfs.add_bytes.return_value = "QmTest123"
    
    content_id = provider.store(test_data)
    assert content_id == "QmTest123"
    mock_ipfs.add_bytes.assert_called_with(test_data)
    
    # Test retrieve
    mock_ipfs.cat.return_value = test_data
    retrieved = provider.retrieve("QmTest123")
    assert retrieved == test_data
    mock_ipfs.cat.assert_called_with("QmTest123")
    
    # Test verify
    mock_ipfs.ls.return_value = True
    assert provider.verify("QmTest123")
    mock_ipfs.ls.assert_called_with("QmTest123")

def test_filecoin_provider(mock_ipfs, mock_filecoin):
    mock_post, mock_get = mock_filecoin
    provider = FilecoinProvider("test_token")
    
    # Test store
    test_data = b"test data"
    mock_ipfs.add_bytes.return_value = "QmTest123"
    
    content_id = provider.store(test_data)
    assert content_id == "QmTest123"
    
    # Verify Filecoin deal creation
    mock_post.assert_called_once()
    assert "test_token" in mock_post.call_args[1]["headers"]["Authorization"]
    
    # Test retrieve
    mock_ipfs.cat.return_value = test_data
    retrieved = provider.retrieve("QmTest123")
    assert retrieved == test_data
    
    # Test verify
    assert provider.verify("QmTest123")
    mock_get.assert_called_once()

def test_arweave_provider(mock_arweave):
    mock_get, mock_head = mock_arweave
    provider = ArweaveProvider("test_keyfile")
    
    # Test store
    test_data = b"test data"
    content_id = provider.store(test_data)
    assert isinstance(content_id, str)
    
    # Test retrieve
    retrieved = provider.retrieve(content_id)
    assert retrieved == b"test data"
    mock_get.assert_called_once()
    
    # Test verify
    assert provider.verify(content_id)
    mock_head.assert_called_once()

def test_decentralized_storage_model_operations(storage, mock_ipfs):
    # Create simple model
    model = torch.nn.Linear(10, 2)
    metadata = {"name": "test_model", "version": "1.0"}
    
    # Mock IPFS responses
    mock_ipfs.add.return_value = {"Hash": "QmModelTest"}
    mock_ipfs.add_bytes.return_value = "QmMetadataTest"
    mock_ipfs.cat.side_effect = [
        json.dumps({"model_id": "QmModelTest"}).encode(),
        b"model_bytes"
    ]
    
    # Test storing
    metadata_id, model_id = storage.store_model(
        model, 
        metadata,
        StorageDuration.SHORT_TERM
    )
    assert metadata_id == "QmMetadataTest"
    assert model_id == "QmModelTest"
    
    # Verify temp file cleanup
    assert not Path("temp_model.pt").exists()
    
    # Test loading
    with patch('torch.load') as mock_load:
        mock_load.return_value = model
        loaded_model, loaded_metadata = storage.load_model(
            metadata_id,
            StorageDuration.SHORT_TERM
        )
        
        assert isinstance(loaded_model, torch.nn.Module)
        assert "model_id" in loaded_metadata
        
        # Verify temp file cleanup
        assert not Path("temp_model.pt").exists()

def test_storage_duration_validation(storage):
    test_data = b"test data"
    
    # Test all valid durations
    valid_durations = [
        StorageDuration.SHORT_TERM,
        StorageDuration.MID_TERM,
        StorageDuration.LONG_TERM,
        StorageDuration.EDGE_CACHED
    ]
    
    for duration in valid_durations:
        try:
            storage.store(test_data, duration)
        except Exception as e:
            pytest.fail(f"Storage with duration {duration} failed: {str(e)}")
    
    # Test invalid duration
    class InvalidDuration(StorageDuration):
        INVALID = "invalid"
        
    with pytest.raises(ValueError):
        storage.store(test_data, InvalidDuration.INVALID)
        
def test_tensor_conversion(storage, mock_ipfs):
    # Test tensor storage
    tensor = torch.tensor([1.0, 2.0, 3.0])
    mock_ipfs.add_bytes.return_value = "QmTest123"
    
    content_id = storage.store(tensor, StorageDuration.SHORT_TERM)
    assert content_id == "QmTest123"
    
    # Verify bytes conversion
    call_args = mock_ipfs.add_bytes.call_args[0][0]
    assert isinstance(call_args, bytes)