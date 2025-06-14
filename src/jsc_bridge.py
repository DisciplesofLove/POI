"""
JSC Bridge - Interface for bridging JSC with JoyToken
"""

import json
import logging
from typing import Optional
from web3 import Web3
from web3.contract import Contract
import requests

logger = logging.getLogger(__name__)

class JSCBridge:
    """Interface for JSC-JoyToken bridge operations."""

    def __init__(
        self,
        bridge_address: str,
        web3_provider: str,
        jsc_rpc: str,
        wallet_file: str,
        password: str
    ):
        """Initialize the JSC bridge interface.

        Args:
            bridge_address: Address of the bridge contract
            web3_provider: Ethereum RPC endpoint
            jsc_rpc: JSC RPC endpoint
            wallet_file: Path to JSC wallet file
            password: Password for JSC wallet
        """
        # Web3 setup
        self.web3 = Web3(Web3.HTTPProvider(web3_provider))
        
        # Load bridge contract
        with open('contracts/JSCBridge.json') as f:
            contract_json = json.load(f)
        self.bridge_contract = self.web3.eth.contract(
            address=bridge_address,
            abi=contract_json['abi']
        )

        # JSC RPC setup
        self.jsc_rpc = jsc_rpc
        self.wallet_file = wallet_file
        self.password = password

        # Open JSC wallet
        self._open_wallet()

    def _open_wallet(self):
        """Open the JSC wallet."""
        try:
            response = requests.post(
                self.jsc_rpc + '/json_rpc',
                json={
                    'jsonrpc': '2.0',
                    'id': '0',
                    'method': 'open_wallet',
                    'params': {
                        'filename': self.wallet_file,
                        'password': self.password
                    }
                }
            )
            response.raise_for_status()
            result = response.json()
            if 'error' in result:
                raise Exception(f"Failed to open wallet: {result['error']}")
            
        except Exception as e:
            logger.error(f"Failed to open JSC wallet: {e}")
            raise

    def get_deposit_events(self, from_block: int, to_block: int):
        """Get deposit events from the bridge contract.

        Args:
            from_block: Start block number
            to_block: End block number

        Returns:
            List of deposit events
        """
        deposit_filter = self.bridge_contract.events.Deposit.createFilter(
            fromBlock=from_block,
            toBlock=to_block
        )
        return deposit_filter.get_all_entries()

    def get_withdrawal_events(self, from_block: int, to_block: int):
        """Get withdrawal events from the bridge contract.

        Args:
            from_block: Start block number
            to_block: End block number

        Returns:
            List of withdrawal events
        """
        withdrawal_filter = self.bridge_contract.events.Withdrawal.createFilter(
            fromBlock=from_block,
            toBlock=to_block
        )
        return withdrawal_filter.get_all_entries()

    def withdraw_jsc(self, amount: int, user: str, jsc_address: str) -> dict:
        """Process JSC withdrawal.

        Args:
            amount: Amount to withdraw
            user: Ethereum address of user
            jsc_address: JSC address to send funds to

        Returns:
            Transaction details
        """
        try:
            # Create JSC transaction
            response = requests.post(
                self.jsc_rpc + '/json_rpc',
                json={
                    'jsonrpc': '2.0',
                    'id': '0',
                    'method': 'transfer',
                    'params': {
                        'destinations': [{
                            'amount': amount,
                            'address': jsc_address
                        }],
                        'priority': 1,
                        'ring_size': 11
                    }
                }
            )
            response.raise_for_status()
            result = response.json()
            
            if 'error' in result:
                raise Exception(f"JSC transfer failed: {result['error']}")
                
            return result['result']

        except Exception as e:
            logger.error(f"Failed to process JSC withdrawal: {e}")
            raise

    def is_bridge_paused(self) -> bool:
        """Check if bridge is paused.

        Returns:
            True if bridge is paused
        """
        return self.bridge_contract.functions.paused().call()

    def get_bridge_limits(self) -> tuple:
        """Get bridge limits.

        Returns:
            Tuple of (min_deposit, max_deposit, daily_limit)
        """
        min_deposit = self.bridge_contract.functions.minDeposit().call()
        max_deposit = self.bridge_contract.functions.maxDeposit().call()
        daily_limit = self.bridge_contract.functions.dailyLimit().call()
        return (min_deposit, max_deposit, daily_limit)