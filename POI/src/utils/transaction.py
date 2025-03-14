"""Transaction handling utilities."""
from typing import Dict, Any
from web3 import Web3
from eth_typing import Hash32

from ..constants import TRANSACTION_TIMEOUT, GAS_ESTIMATE_MARGIN
from .blockchain import with_retry, estimate_gas_with_margin

async def build_and_send_transaction(
    web3: Web3,
    contract_func: Any,
    account: Any,
    retry_nonce: bool = True
) -> Dict[str, Any]:
    """Build and send a transaction with proper gas estimation and nonce handling.
    
    Args:
        web3: Web3 instance
        contract_func: Contract function to call
        account: Account to send from
        retry_nonce: Whether to retry with new nonce if transaction fails
        
    Returns:
        Transaction receipt
        
    Raises:
        RuntimeError: If transaction fails after retries
    """
    async def estimate_gas():
        return await contract_func.estimate_gas({'from': account.address})
        
    # Get gas estimate with retries
    gas_estimate = await with_retry(estimate_gas)
    gas_limit = estimate_gas_with_margin(gas_estimate)
    
    async def send_tx(nonce: int = None):
        if nonce is None:
            nonce = web3.eth.get_transaction_count(account.address)
            
        # Build transaction
        tx = contract_func.build_transaction({
            'from': account.address,
            'gas': gas_limit,
            'gasPrice': web3.eth.gas_price,
            'nonce': nonce
        })
        
        # Sign and send
        signed_tx = web3.eth.account.sign_transaction(tx, account.key)
        tx_hash = await web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        # Wait for receipt
        receipt = await web3.eth.wait_for_transaction_receipt(tx_hash, timeout=TRANSACTION_TIMEOUT)
        if receipt['status'] != 1:
            raise RuntimeError("Transaction failed")
        return receipt
        
    try:
        return await with_retry(lambda: send_tx())
    except Exception as e:
        if retry_nonce and "nonce too low" in str(e).lower():
            # Retry with fresh nonce
            nonce = web3.eth.get_transaction_count(account.address)
            return await send_tx(nonce)
        raise