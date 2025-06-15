"""
Tests for Joy Sovereign token economics
"""
import pytest
from decimal import Decimal
from ..core.token_economics import TokenEconomics

def test_genesis_allocation():
    """Test genesis token allocation"""
    economics = TokenEconomics()
    
    # Test default allocation
    assert economics.initialize_genesis()
    assert economics.genesis_complete
    assert economics.circulating_supply == economics.total_supply
    assert economics.treasury_balance == economics.total_supply * Decimal("0.4")
    
    # Test custom allocation
    economics = TokenEconomics()
    custom_allocation = {
        "treasury": Decimal("0.5"),
        "validators": Decimal("0.3"),
        "development": Decimal("0.1"),
        "contingency": Decimal("0.1")
    }
    assert economics.initialize_genesis(custom_allocation)
    assert economics.treasury_balance == economics.total_supply * Decimal("0.5")

def test_fixed_transaction_fee():
    """Test fixed transaction fee logic"""
    economics = TokenEconomics()
    
    # Test fee amount
    assert economics.get_transaction_fee() == Decimal("0.0001")
    
    # Test fee processing
    assert economics.process_transaction_fee(Decimal("0.0001"))
    assert economics.fee_pool == Decimal("0.0001")
    
    # Test invalid fee amount
    assert not economics.process_transaction_fee(Decimal("0.0002"))

def test_supply_cap():
    """Test hard supply cap enforcement"""
    economics = TokenEconomics()
    economics.initialize_genesis()
    
    # Test transfer validation
    assert economics.validate_transfer(
        "0x123", "0x456", Decimal("100")
    )
    
    # Test no new issuance
    assert not economics.validate_transfer(
        "0x0", "0x123", Decimal("100")
    )
    
    # Test decimal precision
    assert not economics.validate_transfer(
        "0x123", "0x456", Decimal("0.000000001")
    )