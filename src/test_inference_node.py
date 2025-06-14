"""
Tests for the decentralized AI inference node
"""
import pytest
import torch
import torch.nn as nn
import numpy as np
from unittest.mock import MagicMock, patch
from inference_node import InferenceNode
from zk_prover import ZKProver

class SimpleModel(nn.Module):
    """Simple model for testing"""
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(10, 2)
        
    def forward(self, x):
        return self.fc(x)

@pytest.fixture
def mock_web3():
    """Mock Web3 instance"""
    mock = MagicMock()
    mock.eth.gas_price = 20000000000
    mock.eth.get_transaction_count.return_value = 0
    mock.eth.get_block.return_value.timestamp = 1234567890
    mock.eth.account.sign_transaction.return_value.rawTransaction = b'signed_tx'
    mock.eth.send_raw_transaction.return_value = b'tx_hash'
    mock.eth.wait_for_transaction_receipt.return_value.status = 1
    mock.to_bytes = lambda hexstr: bytes.fromhex(hexstr.replace('0x', ''))
    return mock

@pytest.fixture
def mock_contract():
    """Mock contract instance"""
    mock = MagicMock()
    mock.functions.submitInference.return_value.build_transaction.return_value = {
        'from': '0x1234',
        'gas': 2000000,
        'gasPrice': 20000000000,
        'nonce': 0
    }
    mock.functions.validateInference.return_value.build_transaction.return_value = {
        'from': '0x1234',
        'gas': 2000000,
        'gasPrice': 20000000000,
        'nonce': 0
    }
    mock.functions.executions.return_value.call.return_value = {
        'model_id': '0x1234',
        'input_hash': b'input_hash',
        'output_hash': b'output_hash',
        'proof': b'proof'
    }
    return mock

@pytest.fixture
def inference_node(mock_web3, mock_contract):
    """Create an inference node with mocked dependencies"""
    with patch('inference_node.Web3', return_value=mock_web3):
        node = InferenceNode(
            private_key='0x' + '1' * 64,
            contract_address='0x' + '2' * 40,
            web3_provider='http://localhost:8545'
        )
        node.web3 = mock_web3
        node.contract = mock_contract
        node.zk_prover = MagicMock()
        node.zk_prover.generate_proof.return_value = (b'proof', {'input_hash': 'hash1', 'output_hash': 'hash2'})
        return node

@pytest.fixture
def model():
    """Create a simple model for testing"""
    return SimpleModel()

@pytest.fixture
def model_path(tmp_path, model):
    """Save a model to a temporary path"""
    path = tmp_path / "model.pt"
    torch.save(model, path)
    return str(path)

def test_load_model(inference_node, model_path):
    """Test loading a model"""
    result = inference_node.load_model('model1', model_path)
    assert result is True
    assert 'model1' in inference_node.models

def test_generate_proof(inference_node, model):
    """Test generating a proof"""
    # Setup
    inference_node.models['model1'] = model
    input_data = torch.randn(1, 10)
    output_data = model(input_data)
    
    # Execute
    proof = inference_node.generate_proof('model1', input_data, output_data)
    
    # Verify
    assert isinstance(proof, bytes)
    assert len(proof) > 0

def test_execute_inference(inference_node, model):
    """Test executing inference"""
    # Setup
    inference_node.models['model1'] = model
    input_data = torch.randn(1, 10)
    
    # Execute
    result = inference_node.execute_inference('model1', input_data)
    
    # Verify
    assert 'output' in result
    assert 'proof' in result
    assert 'transaction_hash' in result
    assert isinstance(result['output'], np.ndarray)
    assert result['output'].shape == (1, 2)

def test_submit_proof(inference_node):
    """Test submitting a proof to the blockchain"""
    # Execute
    tx_hash = inference_node.submit_proof(
        'model1',
        b'input_hash',
        b'output_hash',
        b'proof'
    )
    
    # Verify
    assert tx_hash == b'tx_hash'
    inference_node.contract.functions.submitInference.assert_called_once()

def test_validate_inference(inference_node):
    """Test validating an inference execution"""
    # Execute
    result = inference_node.validate_inference('execution1')
    
    # Verify
    assert result is True
    inference_node.contract.functions.validateInference.assert_called_once()

def test_hash_data(inference_node):
    """Test hashing different types of data"""
    # Test tensor
    tensor_data = torch.tensor([1.0, 2.0, 3.0])
    tensor_hash = inference_node._hash_data(tensor_data)
    assert isinstance(tensor_hash, bytes)
    assert len(tensor_hash) == 32  # SHA-256 hash length
    
    # Test string
    string_hash = inference_node._hash_data("test string")
    assert isinstance(string_hash, bytes)
    assert len(string_hash) == 32
    
    # Test dict
    dict_hash = inference_node._hash_data({"key": "value"})
    assert isinstance(dict_hash, bytes)
    assert len(dict_hash) == 32