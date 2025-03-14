"""Blockchain utility functions."""
import asyncio
from web3 import Web3
from typing import Callable, Any

from ..constants import MAX_RETRIES, RETRY_DELAY, GAS_ESTIMATE_MARGIN

async def with_retry(
    func: Callable,
    max_retries: int = MAX_RETRIES,
    delay: int = RETRY_DELAY
) -> Any:
    """Execute a function with retries.
    
    Args:
        func: Function to execute
        max_retries: Maximum number of retries
        delay: Delay between retries in seconds
        
    Returns:
        Result of the function
        
    Raises:
        Exception: If all retries fail
    """
    last_error = None
    
    for attempt in range(max_retries):
        try:
            return await func()
        except Exception as e:
            last_error = e
            if attempt < max_retries - 1:
                await asyncio.sleep(delay)
            
    raise last_error

def estimate_gas_with_margin(
    gas_estimate: int,
    margin: float = GAS_ESTIMATE_MARGIN,
    max_gas: int = 5000000
) -> int:
    """Estimate gas with safety margin.
    
    Args:
        gas_estimate: Base gas estimate
        margin: Multiplier for safety margin
        max_gas: Maximum allowed gas
        
    Returns:
        Gas limit with safety margin
        
    Raises:
        ValueError: If estimated gas exceeds maximum
    """
    gas_with_margin = int(gas_estimate * margin)
    if gas_with_margin > max_gas:
        raise ValueError(f"Gas estimate {gas_with_margin} exceeds maximum {max_gas}")
    return gas_with_margin