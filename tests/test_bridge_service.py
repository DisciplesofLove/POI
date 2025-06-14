"""
Tests for the JSC bridge service.
"""

import os
import pytest
from unittest.mock import Mock, patch, mock_open
from src.bridge_service import BridgeService

@pytest.fixture
def mock_bridge():
    """Create a mock JSC bridge instance."""
    return Mock()

@pytest.fixture
def service(mock_bridge):
    """Create a bridge service instance with mocked dependencies."""
    with patch.dict(os.environ, {
        'BRIDGE_ADDRESS': '0x1234567890123456789012345678901234567890',
        'WALLET_FILE': 'test_wallet',
        'WALLET_PASSWORD': 'test_password'
    }), patch('src.bridge_service.JSCBridge', return_value=mock_bridge):
        service = BridgeService()
        return service

def test_init_missing_env_vars():
    """Test initialization with missing environment variables."""
    with patch.dict(os.environ, {}, clear=True):
        with pytest.raises(ValueError, match="Missing required environment variables"):
            BridgeService()

def test_get_last_processed_block_new(service, mock_bridge):
    """Test getting last processed block when no file exists."""
    mock_bridge.web3.eth.block_number = 100

    with patch('builtins.open', mock_open()) as mock_file:
        mock_file.side_effect = FileNotFoundError()
        block = service._get_last_processed_block()
        
    assert block == 100

def test_get_last_processed_block_existing(service):
    """Test getting last processed block from file."""
    with patch('builtins.open', mock_open(read_data='100')):
        block = service._get_last_processed_block()
        
    assert block == 100

def test_save_last_processed_block(service):
    """Test saving last processed block."""
    mock_file = mock_open()
    with patch('builtins.open', mock_file):
        service._save_last_processed_block(100)
        
    mock_file.assert_called_once_with('/data/last_block.txt', 'w')
    mock_file().write.assert_called_once_with('100')

def test_process_deposits(service, mock_bridge):
    """Test processing deposit events."""
    # Setup mock events
    mock_event = Mock()
    mock_event.args.user = "0x1234"
    mock_event.args.amount = 1000
    mock_event.args.jscAddress.hex.return_value = "0x" + "1" * 64
    
    mock_bridge.get_deposit_events.return_value = [mock_event]
    mock_tx = Mock()
    mock_tx.hash = "0x" + "2" * 64
    mock_bridge.withdraw_jsc.return_value = mock_tx

    # Execute
    service.process_deposits(0, 100)

    # Verify
    mock_bridge.get_deposit_events.assert_called_once_with(0, 100)
    mock_bridge.withdraw_jsc.assert_called_once_with(
        1000,
        "0x1234",
        "0x" + "1" * 64
    )

def test_process_deposits_error(service, mock_bridge):
    """Test handling errors in deposit processing."""
    mock_bridge.get_deposit_events.side_effect = Exception("Test error")

    # Should not raise exception
    service.process_deposits(0, 100)

def test_run_bridge_paused(service, mock_bridge):
    """Test main loop when bridge is paused."""
    mock_bridge.is_bridge_paused.return_value = True
    mock_bridge.web3.eth.block_number = 100

    # Mock sleep to break the loop after one iteration
    with patch('time.sleep') as mock_sleep:
        mock_sleep.side_effect = [None, Exception("Stop")]
        
        with pytest.raises(Exception, match="Stop"):
            service.run()

    assert mock_sleep.call_count == 2
    mock_bridge.is_bridge_paused.assert_called_once()

def test_run_process_new_blocks(service, mock_bridge):
    """Test main loop processing new blocks."""
    service.last_block = 100
    mock_bridge.web3.eth.block_number = 110
    mock_bridge.is_bridge_paused.return_value = False

    # Mock sleep to break the loop after one iteration
    with patch('time.sleep') as mock_sleep:
        mock_sleep.side_effect = Exception("Stop")
        
        with pytest.raises(Exception, match="Stop"):
            service.run()

    mock_bridge.get_deposit_events.assert_called_once_with(101, 110)