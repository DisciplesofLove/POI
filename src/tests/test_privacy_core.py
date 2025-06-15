"""
Tests for the privacy core implementation
"""
import pytest
import time
from typing import List, Dict, Any
from ..privacy.privacy_core import PrivacyCore, Transaction, RingMember
from ..utils.crypto_vault import CryptoVault

@pytest.fixture
def crypto_vault():
    """Create crypto vault fixture"""
    return CryptoVault("test_vault.joy")

@pytest.fixture
def privacy_core(crypto_vault):
    """Create privacy core fixture"""
    return PrivacyCore("test_node", crypto_vault)

def test_transaction_creation(privacy_core):
    """Test private transaction creation"""
    # Create transaction
    tx = privacy_core.create_transaction(
        amount=100,
        recipient="recipient_address"
    )
    
    assert isinstance(tx, Transaction)
    assert tx.ring_size == privacy_core.ring_size
    assert len(tx.ring_members) == tx.ring_size
    assert tx.destination == "recipient_address"
    assert isinstance(tx.timestamp, float)

def test_transaction_verification(privacy_core):
    """Test transaction verification"""
    # Create and verify valid transaction
    tx = privacy_core.create_transaction(
        amount=100,
        recipient="recipient_address"
    )
    
    assert privacy_core.verify_transaction(tx) is True
    
    # Test invalid ring size
    invalid_tx = Transaction(
        tx_id="test_id",
        ring_size=11,
        ring_members=[],  # Empty ring
        bulletproof="test_proof",
        amount_commitment="test_commitment",
        destination="recipient_address",
        timestamp=time.time()
    )
    
    assert privacy_core.verify_transaction(invalid_tx) is False

def test_ring_signature(privacy_core):
    """Test ring signature creation and verification"""
    # Create ring signature
    msg = "test_message"
    public_keys = [f"key_{i}" for i in range(privacy_core.ring_size)]
    
    ring_members = privacy_core._create_ring_signature(msg, public_keys)
    
    assert len(ring_members) == privacy_core.ring_size
    assert all(isinstance(m, RingMember) for m in ring_members)
    
    # Verify ring signature
    assert privacy_core._verify_ring_signature(ring_members, msg) is True
    
    # Test invalid signature
    invalid_member = RingMember(
        public_key="invalid_key",
        commitment="invalid_commitment",
        signature="invalid_signature"
    )
    invalid_ring = [invalid_member] * privacy_core.ring_size
    
    assert privacy_core._verify_ring_signature(invalid_ring, msg) is False

def test_bulletproof(privacy_core):
    """Test bulletproof creation and verification"""
    amount = 100
    commitment = privacy_core._create_amount_commitment(amount)
    bulletproof = privacy_core._generate_bulletproof(amount)
    
    assert privacy_core._verify_bulletproof(bulletproof, commitment) is True
    
    # Test invalid bulletproof
    invalid_bulletproof = "invalid_proof"
    assert privacy_core._verify_bulletproof(invalid_bulletproof, commitment) is False

def test_shielded_transfer(privacy_core):
    """Test shielded transfer creation and verification"""
    # Create shielded transfer
    transfer = privacy_core.create_shielded_transfer(
        pool_id="test_pool",
        amount=100,
        recipient="recipient_address"
    )
    
    assert "pool_id" in transfer
    assert "proof" in transfer
    assert "note_commitment" in transfer
    assert "nullifier" in transfer
    assert "timestamp" in transfer
    
    # Initialize pool for verification
    privacy_core.shielded_pools["test_pool"] = {
        "notes": set(),
        "nullifiers": set()
    }
    
    # Verify transfer
    assert privacy_core.verify_shielded_transfer(transfer) is True
    
    # Test double-spend protection
    privacy_core.shielded_pools["test_pool"]["nullifiers"].add(
        transfer["nullifier"]
    )
    assert privacy_core.verify_shielded_transfer(transfer) is False

def test_amount_commitment(privacy_core):
    """Test amount commitment creation"""
    amount = 100
    commitment = privacy_core._create_amount_commitment(amount)
    
    assert isinstance(commitment, str)
    assert len(commitment) == 64  # SHA256 hex digest length

def test_nullifier_generation(privacy_core):
    """Test nullifier generation"""
    nullifier1 = privacy_core._generate_nullifier()
    nullifier2 = privacy_core._generate_nullifier()
    
    assert isinstance(nullifier1, str)
    assert len(nullifier1) == 64  # SHA256 hex digest length
    assert nullifier1 != nullifier2  # Should be unique

def test_note_commitment(privacy_core):
    """Test note commitment creation"""
    amount = 100
    recipient = "recipient_address"
    
    commitment = privacy_core._create_note_commitment(amount, recipient)
    
    assert isinstance(commitment, str)
    assert len(commitment) == 64  # SHA256 hex digest length