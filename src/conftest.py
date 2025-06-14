"""Test configuration and fixtures for JoyNet platform."""

import os
import pytest
import tempfile
from pathlib import Path

@pytest.fixture(scope="session")
def test_dir():
    """Create a temporary directory for test files."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        yield Path(tmp_dir)

@pytest.fixture(scope="session")
def config_dir(test_dir):
    """Create a test configuration directory."""
    config_dir = test_dir / "config"
    config_dir.mkdir()
    return config_dir

@pytest.fixture(scope="session")
def p2p_config(config_dir):
    """Create a test P2P configuration."""
    config = {
        "node": {
            "host": "127.0.0.1",
            "port": 4001,
            "max_connections": 10
        },
        "discovery": {
            "bootstrap_peers": [],
            "mdns_enabled": False,
            "dht_enabled": False
        },
        "storage": {
            "ipfs_host": "127.0.0.1",
            "ipfs_port": 5001,
            "cache_size": 1048576
        }
    }
    config_file = config_dir / "p2p_config.yaml"
    with open(config_file, "w") as f:
        import yaml
        yaml.dump(config, f)
    return config_file

@pytest.fixture(scope="session")
def test_models_dir(test_dir):
    """Create a test models directory."""
    models_dir = test_dir / "models"
    models_dir.mkdir()
    return models_dir

@pytest.fixture(scope="session")
def test_data_dir(test_dir):
    """Create a test data directory."""
    data_dir = test_dir / "data"
    data_dir.mkdir()
    return data_dir

@pytest.fixture(scope="function")
def mock_ipfs(monkeypatch):
    """Mock IPFS client for testing."""
    class MockIPFS:
        def add(self, *args, **kwargs):
            return {"Hash": "QmTest123"}
        
        def cat(self, *args, **kwargs):
            return b"test_data"
        
        def pin(self, *args, **kwargs):
            return None
    
    monkeypatch.setattr("ipfshttpclient.connect", lambda *args, **kwargs: MockIPFS())
    return MockIPFS()

@pytest.fixture(scope="function")
def mock_web3(monkeypatch):
    """Mock Web3 for testing."""
    class MockWeb3:
        class MockEth:
            def contract(self, *args, **kwargs):
                return MockContract()
            
            def get_balance(self, *args, **kwargs):
                return 1000
        
        eth = MockEth()
    
    class MockContract:
        def functions(self):
            return self
        
        def call(self, *args, **kwargs):
            return True
    
    monkeypatch.setattr("web3.Web3", lambda *args, **kwargs: MockWeb3())
    return MockWeb3()

@pytest.fixture(scope="function")
def test_env(monkeypatch):
    """Set up test environment variables."""
    env_vars = {
        "NODE_ID": "test_node",
        "ENVIRONMENT": "test",
        "WEB3_PROVIDER": "http://localhost:8545",
        "CHAIN_ID": "1337",
        "JOY_TOKEN_ADDRESS": "0x1234567890123456789012345678901234567890",
        "MARKETPLACE_ADDRESS": "0x0987654321098765432109876543210987654321"
    }
    for key, value in env_vars.items():
        monkeypatch.setenv(key, value)
    return env_vars