"""
Tests for Joy Sovereign validator license registry
"""
import pytest
import time
from unittest.mock import Mock, AsyncMock
from ..validators.license_registry import LicenseRegistry, ValidatorLicense
from ..lol_dao import LolDAO
from ..utils.crypto_vault import CryptoVault

@pytest.fixture
def mock_dao():
    """Create mock DAO"""
    dao = Mock(spec=LolDAO)
    dao.create_proposal = AsyncMock(return_value="test_proposal")
    dao.validator_reputation = {"test_node": 1000}
    return dao

@pytest.fixture
def mock_crypto():
    """Create mock crypto vault"""
    crypto = Mock(spec=CryptoVault)
    crypto.sign = Mock(return_value="test_signature")
    return crypto

@pytest.fixture
def registry(mock_dao, mock_crypto):
    """Create license registry instance"""
    return LicenseRegistry(mock_dao, mock_crypto)

@pytest.mark.asyncio
async def test_license_issuance(registry):
    """Test validator license issuance"""
    # Valid license request
    license_id = await registry.issue_license(
        node_id="test_node",
        stake_amount=20000,
        hardware_specs={
            "platform": "Jetson AGX Orin",
            "ram_gb": 32,
            "storage_gb": 500,
            "cuda_cores": 2048
        },
        did="did:joy:test123"
    )
    
    assert license_id is not None
    assert registry.is_valid_validator("test_node")
    assert "test_node" in registry.active_validators
    
    # Invalid stake amount
    invalid_license = await registry.issue_license(
        node_id="low_stake",
        stake_amount=5000,
        hardware_specs={
            "platform": "Jetson AGX Orin",
            "ram_gb": 32,
            "storage_gb": 500,
            "cuda_cores": 2048
        },
        did="did:joy:test456"
    )
    
    assert invalid_license is None
    assert not registry.is_valid_validator("low_stake")

@pytest.mark.asyncio
async def test_license_revocation(registry):
    """Test validator license revocation"""
    # First issue a license
    license_id = await registry.issue_license(
        node_id="test_node",
        stake_amount=20000,
        hardware_specs={
            "platform": "Jetson AGX Orin",
            "ram_gb": 32,
            "storage_gb": 500,
            "cuda_cores": 2048
        },
        did="did:joy:test123"
    )
    
    # Test revocation
    assert await registry.revoke_license(
        license_id=license_id,
        reason="Compliance violation"
    )
    
    assert not registry.is_valid_validator("test_node")
    assert "test_node" not in registry.active_validators
    assert registry.licenses[license_id].status == "revoked"

def test_hardware_verification(registry):
    """Test validator hardware requirements"""
    # Valid hardware
    valid_specs = {
        "platform": "Jetson AGX Orin",
        "ram_gb": 32,
        "storage_gb": 500,
        "cuda_cores": 2048
    }
    assert registry._verify_hardware(valid_specs)
    
    # Invalid hardware
    invalid_specs = {
        "platform": "Generic x86",
        "ram_gb": 16,
        "storage_gb": 250,
        "cuda_cores": 1024
    }
    assert not registry._verify_hardware(invalid_specs)