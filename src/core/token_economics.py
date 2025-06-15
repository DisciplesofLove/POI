"""
Token economics implementation for Joy Sovereign network
"""
import time
from typing import Dict, Any, Optional
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class TokenEconomics:
    """
    Implements Joy Sovereign token economics including:
    - Hard capped supply
    - Fixed transaction fees
    - Treasury management
    """
    
    # Token constants
    TOTAL_SUPPLY = 1_000_000_000  # 1 billion JOY tokens
    DECIMALS = 8
    FIXED_TX_FEE = Decimal("0.0001")  # Fixed fee per transaction
    
    # Supply allocation
    GENESIS_ALLOCATIONS = {
        "treasury": Decimal("0.4"),  # 40% to DAO treasury
        "validators": Decimal("0.3"),  # 30% to validator incentives
        "development": Decimal("0.2"),  # 20% to development fund
        "contingency": Decimal("0.1")  # 10% contingency fund
    }
    
    def __init__(self):
        """Initialize token economics"""
        self.total_supply = Decimal(self.TOTAL_SUPPLY)
        self.circulating_supply = Decimal(0)
        self.treasury_balance = Decimal(0)
        self.fee_pool = Decimal(0)
        self.genesis_complete = False
        
    def initialize_genesis(self, allocations: Optional[Dict[str, Decimal]] = None) -> bool:
        """
        Initialize genesis token allocations
        
        Args:
            allocations: Optional custom allocation ratios
            
        Returns:
            True if genesis successful
        """
        if self.genesis_complete:
            logger.error("Genesis already completed")
            return False
            
        try:
            # Use default or custom allocations
            alloc = allocations if allocations else self.GENESIS_ALLOCATIONS
            
            # Validate allocations sum to 1
            if sum(alloc.values()) != Decimal("1.0"):
                logger.error("Invalid genesis allocations - must sum to 1")
                return False
                
            # Distribute initial supply
            for purpose, ratio in alloc.items():
                amount = self.total_supply * ratio
                if purpose == "treasury":
                    self.treasury_balance = amount
                self.circulating_supply += amount
                
            self.genesis_complete = True
            logger.info("Genesis allocation completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Genesis allocation failed: {e}")
            return False
            
    def get_transaction_fee(self) -> Decimal:
        """Get the fixed transaction fee"""
        return self.FIXED_TX_FEE
        
    def process_transaction_fee(self, fee: Decimal) -> bool:
        """
        Process a transaction fee payment
        
        Args:
            fee: Fee amount collected
            
        Returns:
            True if fee processed successfully
        """
        if fee != self.FIXED_TX_FEE:
            logger.error(f"Invalid fee amount: {fee}")
            return False
            
        try:
            # Add to fee pool
            self.fee_pool += fee
            
            # If fee pool exceeds threshold, transfer to treasury
            if self.fee_pool >= 1000 * self.FIXED_TX_FEE:
                self.treasury_balance += self.fee_pool
                self.fee_pool = Decimal(0)
                
            return True
            
        except Exception as e:
            logger.error(f"Fee processing failed: {e}")
            return False
            
    def get_supply_info(self) -> Dict[str, Decimal]:
        """Get current supply information"""
        return {
            "total_supply": self.total_supply,
            "circulating_supply": self.circulating_supply,
            "treasury_balance": self.treasury_balance,
            "fee_pool": self.fee_pool
        }
        
    def validate_transfer(self, sender: str, recipient: str, 
                       amount: Decimal) -> bool:
        """
        Validate a token transfer
        
        Args:
            sender: Sender address
            recipient: Recipient address
            amount: Transfer amount
            
        Returns:
            True if transfer is valid
        """
        # Check amount format
        if amount.as_tuple().exponent < -self.DECIMALS:
            logger.error(f"Invalid amount precision: {amount}")
            return False
            
        # No new issuance beyond genesis
        if sender == "0x0":  # Issuance address
            logger.error("New token issuance not allowed")
            return False
            
        return True