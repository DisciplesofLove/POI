"""
JSC Bridge Service - Monitors and processes bridge transactions between JSC and JoyToken.
"""

import os
import time
import logging
from typing import Optional
from web3 import Web3
from jsc_bridge import JSCBridge

# Configure logging
logging.basicConfig(
    level=os.getenv('LOG_LEVEL', 'INFO'),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class BridgeService:
    """Service to monitor and process bridge transactions."""

    def __init__(self):
        """Initialize the bridge service."""
        # Load environment variables
        self.web3_provider = os.getenv('WEB3_PROVIDER', 'http://localhost:8545')
        self.jsc_rpc = os.getenv('JSC_RPC', 'http://localhost:19081')
        self.bridge_address = os.getenv('BRIDGE_ADDRESS')
        self.wallet_file = os.getenv('WALLET_FILE')
        self.wallet_password = os.getenv('WALLET_PASSWORD')

        if not all([self.bridge_address, self.wallet_file, self.wallet_password]):
            raise ValueError("Missing required environment variables")

        # Initialize bridge interface
        self.bridge = JSCBridge(
            bridge_address=self.bridge_address,
            web3_provider=self.web3_provider,
            jsc_rpc=self.jsc_rpc,
            wallet_file=self.wallet_file,
            password=self.wallet_password
        )

        # Track last processed block
        self.last_block = self._get_last_processed_block()

    def _get_last_processed_block(self) -> int:
        """Get the last processed block number from persistent storage."""
        try:
            with open('/data/last_block.txt', 'r') as f:
                return int(f.read().strip())
        except FileNotFoundError:
            return self.bridge.web3.eth.block_number

    def _save_last_processed_block(self, block_number: int):
        """Save the last processed block number to persistent storage."""
        with open('/data/last_block.txt', 'w') as f:
            f.write(str(block_number))

    def process_deposits(self, from_block: int, to_block: int):
        """Process deposit events in the given block range."""
        try:
            events = self.bridge.get_deposit_events(from_block, to_block)
            for event in events:
                logger.info(f"Processing deposit event: {event}")
                
                # Extract event data
                user = event.args.user
                amount = event.args.amount
                jsc_address = event.args.jscAddress.hex()

                try:
                    # Create JSC transaction
                    tx = self.bridge.withdraw_jsc(amount, user, jsc_address)
                    logger.info(f"Created JSC transaction: {tx.hash}")
                except Exception as e:
                    logger.error(f"Failed to process deposit: {e}")

        except Exception as e:
            logger.error(f"Failed to get deposit events: {e}")

    def run(self):
        """Run the bridge service main loop."""
        logger.info("Starting bridge service...")

        while True:
            try:
                # Get current block
                current_block = self.bridge.web3.eth.block_number

                if current_block > self.last_block:
                    # Process new blocks
                    logger.info(f"Processing blocks {self.last_block + 1} to {current_block}")
                    self.process_deposits(self.last_block + 1, current_block)
                    
                    # Update last processed block
                    self.last_block = current_block
                    self._save_last_processed_block(current_block)

                # Check if bridge is paused
                if self.bridge.is_bridge_paused():
                    logger.warning("Bridge is paused, waiting...")
                    time.sleep(60)
                    continue

                # Wait for new blocks
                time.sleep(15)

            except Exception as e:
                logger.error(f"Error in main loop: {e}")
                time.sleep(30)

if __name__ == '__main__':
    service = BridgeService()
    service.run()