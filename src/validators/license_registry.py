"""
Validator license registry for Joy Sovereign network
"""
import time
import json
import logging
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass
from ..utils.crypto_vault import CryptoVault
from ..lol_dao import LolDAO

logger = logging.getLogger(__name__)

@dataclass
class ValidatorLicense:
    """Validator license data"""
    node_id: str
    license_id: str
    stake_amount: int
    reputation_score: int
    hardware_specs: Dict[str, Any]
    did: str  # Decentralized identity
    status: str  # active, suspended, revoked
    issued_at: float
    expires_at: float
    
class LicenseRegistry:
    """
    Implements validator license management tied to LOL DAO governance
    """
    
    def __init__(self, dao: LolDAO, crypto_vault: CryptoVault):
        """Initialize license registry"""
        self.dao = dao
        self.crypto_vault = crypto_vault
        self.licenses: Dict[str, ValidatorLicense] = {}
        self.active_validators: Set[str] = set()
        
        # License requirements
        self.MIN_STAKE = 10000  # Minimum stake in JOY tokens
        self.MIN_REPUTATION = 500  # Minimum reputation score
        self.LICENSE_DURATION = 30 * 24 * 60 * 60  # 30 days in seconds
        
    async def issue_license(self, node_id: str, stake_amount: int,
                          hardware_specs: Dict[str, Any], did: str) -> Optional[str]:
        """
        Issue a new validator license if requirements are met
        
        Args:
            node_id: Validator node ID
            stake_amount: Amount of JOY tokens staked
            hardware_specs: Validator hardware specifications
            did: Validator's decentralized identity
            
        Returns:
            License ID if successful, None otherwise
        """
        # Check minimum requirements
        if stake_amount < self.MIN_STAKE:
            logger.warning(f"Insufficient stake for validator {node_id}")
            return None
            
        reputation = await self._get_reputation(node_id)
        if reputation < self.MIN_REPUTATION:
            logger.warning(f"Insufficient reputation for validator {node_id}")
            return None
            
        # Verify hardware meets requirements (e.g. Jetson AGX Orin)
        if not self._verify_hardware(hardware_specs):
            logger.warning(f"Hardware requirements not met for validator {node_id}")
            return None
            
        # Create license
        license_id = self._generate_license_id(node_id)
        license = ValidatorLicense(
            node_id=node_id,
            license_id=license_id,
            stake_amount=stake_amount,
            reputation_score=reputation,
            hardware_specs=hardware_specs,
            did=did,
            status="active",
            issued_at=time.time(),
            expires_at=time.time() + self.LICENSE_DURATION
        )
        
        # Submit to DAO for approval
        if await self._submit_license_proposal(license):
            self.licenses[license_id] = license
            self.active_validators.add(node_id)
            logger.info(f"Issued validator license {license_id} to {node_id}")
            return license_id
        else:
            logger.warning(f"License proposal rejected for {node_id}")
            return None
            
    async def revoke_license(self, license_id: str, reason: str) -> bool:
        """
        Revoke a validator license
        
        Args:
            license_id: License to revoke
            reason: Reason for revocation
            
        Returns:
            True if revocation successful
        """
        if license_id not in self.licenses:
            return False
            
        license = self.licenses[license_id]
        
        # Submit revocation proposal to DAO
        proposal_data = {
            "type": "license_revocation",
            "license_id": license_id,
            "node_id": license.node_id,
            "reason": reason
        }
        
        proposal_id = await self.dao.create_proposal(
            proposal_type="license_revocation",
            title=f"Revoke validator license {license_id}",
            description=f"Revocation reason: {reason}",
            params=proposal_data
        )
        
        # Wait for DAO decision
        decision = await self._wait_for_dao_decision(proposal_id)
        if decision:
            license.status = "revoked"
            self.active_validators.remove(license.node_id)
            logger.info(f"Revoked license {license_id}")
            return True
        else:
            logger.warning(f"License revocation rejected for {license_id}")
            return False
            
    def is_valid_validator(self, node_id: str) -> bool:
        """Check if node is an active validator"""
        return node_id in self.active_validators
        
    async def _get_reputation(self, node_id: str) -> int:
        """Get node's reputation score from DAO"""
        return self.dao.validator_reputation.get(node_id, 0)
        
    def _verify_hardware(self, specs: Dict[str, Any]) -> bool:
        """Verify hardware meets requirements"""
        required = {
            "platform": "Jetson AGX Orin",
            "min_ram": 32,  # GB
            "min_storage": 500,  # GB
            "min_cuda_cores": 2048
        }
        
        try:
            return (
                specs["platform"] == required["platform"] and
                specs["ram_gb"] >= required["min_ram"] and
                specs["storage_gb"] >= required["min_storage"] and
                specs["cuda_cores"] >= required["min_cuda_cores"]
            )
        except KeyError:
            return False
            
    def _generate_license_id(self, node_id: str) -> str:
        """Generate unique license ID"""
        return self.crypto_vault.sign(
            f"validator_license:{node_id}:{time.time()}"
        )
        
    async def _submit_license_proposal(self, license: ValidatorLicense) -> bool:
        """Submit license issuance proposal to DAO"""
        proposal_data = {
            "type": "license_issuance",
            "node_id": license.node_id,
            "license_id": license.license_id,
            "stake_amount": license.stake_amount,
            "hardware_specs": license.hardware_specs,
            "did": license.did
        }
        
        proposal_id = await self.dao.create_proposal(
            proposal_type="license_issuance",
            title=f"Issue validator license to {license.node_id}",
            description="Proposal to issue new validator license",
            params=proposal_data
        )
        
        return await self._wait_for_dao_decision(proposal_id)
        
    async def _wait_for_dao_decision(self, proposal_id: str) -> bool:
        """Wait for DAO proposal decision"""
        # In production would implement proper proposal monitoring
        # For now returning True for testing
        return True