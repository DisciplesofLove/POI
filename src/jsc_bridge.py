"""
JSC Bridge interface for interacting with the JSC bridge contract and JSC network.
"""

import json
import os
from typing import Optional
from web3 import Web3
from eth_typing import HexStr
from eth_utils import to_checksum_address
import monero.wallet
import monero.daemon
from monero.transaction import Transaction

class JSCBridge:
    """Interface for the JSC bridge contract and JSC network."""

    def __init__(
        self,
        bridge_address: str,
        web3_provider: str = "http://localhost:8545",
        jsc_rpc: str = "http://localhost:18081",
        wallet_file: Optional[str] = None,
        password: Optional[str] = None
    ):
        """Initialize the JSC bridge interface.

        Args:
            bridge_address: Address of the JSC bridge contract
            web3_provider: Ethereum node RPC URL
            jsc_rpc: JSC node RPC URL
            wallet_file: Path to JSC wallet file (optional)
            password: Password for JSC wallet (optional)
        """
        # Setup Web3 connection
        self.web3 = Web3(Web3.HTTPProvider(web3_provider))
        self.bridge_address = to_checksum_address(bridge_address)
        
        # Load contract ABI
        abi_path = os.path.join(os.path.dirname(__file__), "../contracts/JSCBridge.json")
        with open(abi_path) as f:
            contract_json = json.load(f)
        self.contract = self.web3.eth.contract(
            address=self.bridge_address,
            abi=contract_json["abi"]
        )

        # Setup JSC connection
        self.daemon = monero.daemon.Daemon(rpc_url=jsc_rpc)
        
        # Setup wallet if provided
        self.wallet = None
        if wallet_file and password:
            self.wallet = monero.wallet.Wallet(
                wallet_file=wallet_file,
                password=password,
                daemon=self.daemon
            )

    def deposit_joy(
        self,
        amount: int,
        jsc_address: str,
        from_address: str,
        private_key: str
    ) -> HexStr:
        """Deposit JOY tokens to receive JSC.

        Args:
            amount: Amount of JOY tokens to deposit
            jsc_address: JSC address to receive coins
            from_address: Ethereum address sending JOY tokens
            private_key: Private key for the Ethereum address

        Returns:
            Transaction hash
        """
        # Convert JSC address to bytes32
        jsc_address_bytes = Web3.toBytes(hexstr=jsc_address)
        if len(jsc_address_bytes) != 32:
            raise ValueError("Invalid JSC address format")

        # Build transaction
        nonce = self.web3.eth.get_transaction_count(from_address)
        tx = self.contract.functions.deposit(
            amount,
            jsc_address_bytes
        ).build_transaction({
            'from': from_address,
            'nonce': nonce,
            'gas': 200000,
            'gasPrice': self.web3.eth.gas_price
        })

        # Sign and send transaction
        signed_tx = self.web3.eth.account.sign_transaction(tx, private_key)
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        return tx_hash.hex()

    def withdraw_jsc(
        self,
        amount: int,
        joy_address: str,
        jsc_tx_hash: str
    ) -> Transaction:
        """Withdraw JSC to receive JOY tokens.

        Args:
            amount: Amount of JSC to withdraw
            joy_address: Ethereum address to receive JOY tokens
            jsc_tx_hash: JSC transaction hash for verification

        Returns:
            JSC transaction object
        """
        if not self.wallet:
            raise ValueError("Wallet not initialized")

        # Verify joy_address format
        if not Web3.is_address(joy_address):
            raise ValueError("Invalid Ethereum address format")

        # Create JSC transaction
        tx = self.wallet.transfer(
            address=joy_address,
            amount=amount,
            priority=2,  # Medium priority
            relay=True   # Send to network immediately
        )

        return tx

    def get_deposit_events(
        self,
        from_block: int,
        to_block: Optional[int] = None
    ) -> list:
        """Get deposit events from the bridge contract.

        Args:
            from_block: Start block number
            to_block: End block number (optional, defaults to latest)

        Returns:
            List of deposit events
        """
        if not to_block:
            to_block = self.web3.eth.block_number

        events = self.contract.events.Deposit.get_logs(
            fromBlock=from_block,
            toBlock=to_block
        )
        return events

    def get_withdrawal_events(
        self,
        from_block: int,
        to_block: Optional[int] = None
    ) -> list:
        """Get withdrawal events from the bridge contract.

        Args:
            from_block: Start block number
            to_block: End block number (optional, defaults to latest)

        Returns:
            List of withdrawal events
        """
        if not to_block:
            to_block = self.web3.eth.block_number

        events = self.contract.events.Withdrawal.get_logs(
            fromBlock=from_block,
            toBlock=to_block
        )
        return events

    def is_bridge_paused(self) -> bool:
        """Check if the bridge is paused.

        Returns:
            True if bridge is paused, False otherwise
        """
        return self.contract.functions.paused().call()

    def get_jsc_balance(self) -> float:
        """Get JSC wallet balance.

        Returns:
            Balance in JSC
        """
        if not self.wallet:
            raise ValueError("Wallet not initialized")
        return self.wallet.balance()