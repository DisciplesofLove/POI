"""
Tests for the JSC bridge interface.
"""

import pytest
from unittest.mock import Mock, patch
from web3 import Web3
from eth_account import Account
from src.jsc_bridge import JSCBridge

@pytest.fixture
def mock_web3():
    """Create a mock Web3 instance."""
    with patch('web3.Web3') as mock:
        mock.toBytes = Web3.toBytes
        mock.is_address = Web3.is_address
        yield mock

@pytest.fixture
def mock_contract():
    """Create a mock contract instance."""
    return Mock()

@pytest.fixture
def mock_wallet():
    """Create a mock JSC wallet instance."""
    return Mock()

@pytest.fixture
def bridge(mock_web3, mock_contract, mock_wallet):
    """Create a JSC bridge instance with mocked dependencies."""
    with patch('monero.daemon.Daemon'), \
         patch('monero.wallet.Wallet', return_value=mock_wallet):
        bridge = JSCBridge(
            bridge_address="0x1234567890123456789012345678901234567890",
            web3_provider="http://localhost:8545",
            jsc_rpc="http://localhost:18081",
            wallet_file="test_wallet",
            password="test_password"
        )
        bridge.web3 = mock_web3
        bridge.contract = mock_contract
        bridge.wallet = mock_wallet
        return bridge

def test_deposit_joy(bridge, mock_web3, mock_contract):
    """Test depositing JOY tokens."""
    # Setup
    amount = 1000
    jsc_address = "0x" + "1" * 64
    from_address = "0x1234567890123456789012345678901234567890"
    private_key = "0x" + "1" * 64
    
    mock_web3.eth.get_transaction_count.return_value = 1
    mock_web3.eth.gas_price = 20000000000
    mock_contract.functions.deposit.return_value.build_transaction.return_value = {
        'from': from_address,
        'nonce': 1,
        'gas': 200000,
        'gasPrice': 20000000000
    }
    
    # Execute
    tx_hash = bridge.deposit_joy(amount, jsc_address, from_address, private_key)
    
    # Verify
    assert isinstance(tx_hash, str)
    mock_contract.functions.deposit.assert_called_once_with(
        amount,
        Web3.toBytes(hexstr=jsc_address)
    )

def test_withdraw_jsc(bridge, mock_wallet):
    """Test withdrawing JSC."""
    # Setup
    amount = 1000
    joy_address = "0x1234567890123456789012345678901234567890"
    jsc_tx_hash = "0x" + "1" * 64
    
    mock_tx = Mock()
    mock_wallet.transfer.return_value = mock_tx
    
    # Execute
    tx = bridge.withdraw_jsc(amount, joy_address, jsc_tx_hash)
    
    # Verify
    assert tx == mock_tx
    mock_wallet.transfer.assert_called_once_with(
        address=joy_address,
        amount=amount,
        priority=2,
        relay=True
    )

def test_withdraw_jsc_no_wallet(bridge):
    """Test withdrawing JSC without initialized wallet."""
    bridge.wallet = None
    
    with pytest.raises(ValueError, match="Wallet not initialized"):
        bridge.withdraw_jsc(1000, "0x1234567890123456789012345678901234567890", "0x" + "1" * 64)

def test_get_deposit_events(bridge, mock_contract):
    """Test getting deposit events."""
    # Setup
    mock_events = [Mock(), Mock()]
    mock_contract.events.Deposit.get_logs.return_value = mock_events
    
    # Execute
    events = bridge.get_deposit_events(0, 100)
    
    # Verify
    assert events == mock_events
    mock_contract.events.Deposit.get_logs.assert_called_once_with(
        fromBlock=0,
        toBlock=100
    )

def test_get_withdrawal_events(bridge, mock_contract):
    """Test getting withdrawal events."""
    # Setup
    mock_events = [Mock(), Mock()]
    mock_contract.events.Withdrawal.get_logs.return_value = mock_events
    
    # Execute
    events = bridge.get_withdrawal_events(0, 100)
    
    # Verify
    assert events == mock_events
    mock_contract.events.Withdrawal.get_logs.assert_called_once_with(
        fromBlock=0,
        toBlock=100
    )

def test_is_bridge_paused(bridge, mock_contract):
    """Test checking if bridge is paused."""
    # Setup
    mock_contract.functions.paused.return_value.call.return_value = True
    
    # Execute
    is_paused = bridge.is_bridge_paused()
    
    # Verify
    assert is_paused is True
    mock_contract.functions.paused.assert_called_once()

def test_get_jsc_balance(bridge, mock_wallet):
    """Test getting JSC wallet balance."""
    # Setup
    mock_wallet.balance.return_value = 1000.0
    
    # Execute
    balance = bridge.get_jsc_balance()
    
    # Verify
    assert balance == 1000.0
    mock_wallet.balance.assert_called_once()

def test_get_jsc_balance_no_wallet(bridge):
    """Test getting JSC balance without initialized wallet."""
    bridge.wallet = None
    
    with pytest.raises(ValueError, match="Wallet not initialized"):
        bridge.get_jsc_balance()

def test_invalid_jsc_address(bridge):
    """Test depositing with invalid JSC address."""
    with pytest.raises(ValueError, match="Invalid JSC address format"):
        bridge.deposit_joy(
            1000,
            "invalid_address",
            "0x1234567890123456789012345678901234567890",
            "0x" + "1" * 64
        )

def test_invalid_joy_address(bridge):
    """Test withdrawing with invalid JOY address."""
    with pytest.raises(ValueError, match="Invalid Ethereum address format"):
        bridge.withdraw_jsc(1000, "invalid_address", "0x" + "1" * 64)