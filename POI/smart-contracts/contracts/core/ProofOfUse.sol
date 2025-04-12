// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PermaNetDomainRegistry.sol";
import "./PermaNetDAORegistry.sol";

/**
 * @title ProofOfUse
 * @dev Manages Proof of Use (POU) verification for domains
 */
contract ProofOfUse is Ownable, ReentrancyGuard {
    PermaNetDomainRegistry public domainRegistry;
    PermaNetDAORegistry public daoRegistry;
    
    // Default POU period (180 days)
    uint256 public constant DEFAULT_POU_PERIOD = 180 days;
    
    struct POUConfig {
        uint256 requiredPeriod;      // How often POU must be submitted
        uint256 gracePeriod;         // Grace period after missing POU
        bool requiresProof;          // If false, domain remains active without POU
    }
    
    struct POUStatus {
        uint256 lastProofTime;       // Last time POU was submitted
        string lastProofHash;        // IOTA message ID of last proof
        bool isActive;               // Current activity status
    }
    
    // Mapping from TLD to its POU configuration
    mapping(string => POUConfig) public tldPOUConfig;
    
    // Mapping from domain hash to its POU status
    mapping(bytes32 => POUStatus) public domainPOUStatus;
    
    // Events
    event POUSubmitted(string domain, string proofHash, uint256 timestamp);
    event POUConfigUpdated(string tld, uint256 requiredPeriod, uint256 gracePeriod);
    event DomainDeactivated(string domain, uint256 timestamp);
    
    constructor(address _domainRegistry, address _daoRegistry) {
        domainRegistry = PermaNetDomainRegistry(_domainRegistry);
        daoRegistry = PermaNetDAORegistry(_daoRegistry);
        
        // Set default configurations for initial TLDs
        setDefaultConfig("joy");
        setDefaultConfig("dao");
        setDefaultConfig("ai");
    }
    
    /**
     * @dev Set default POU configuration for a TLD
     */
    function setDefaultConfig(string memory tld) internal {
        tldPOUConfig[tld] = POUConfig({
            requiredPeriod: DEFAULT_POU_PERIOD,
            gracePeriod: 30 days,
            requiresProof: true
        });
    }
    
    /**
     * @dev Update POU configuration for a TLD (only through DAO)
     */
    function updatePOUConfig(
        string memory tld,
        uint256 newRequiredPeriod,
        uint256 newGracePeriod,
        bool newRequiresProof
    ) external {
        require(msg.sender == address(daoRegistry), "Only DAO can update config");
        
        tldPOUConfig[tld] = POUConfig({
            requiredPeriod: newRequiredPeriod,
            gracePeriod: newGracePeriod,
            requiresProof: newRequiresProof
        });
        
        emit POUConfigUpdated(tld, newRequiredPeriod, newGracePeriod);
    }
    
    /**
     * @dev Submit a Proof of Use for a domain
     */
    function submitProof(
        string memory name,
        string memory tld,
        string memory proofHash
    ) external {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        
        // Verify domain ownership
        (address owner,,,,) = domainRegistry.getDomainInfo(name, tld);
        require(owner == msg.sender, "Not domain owner");
        
        // Update POU status
        POUStatus storage status = domainPOUStatus[domainHash];
        status.lastProofTime = block.timestamp;
        status.lastProofHash = proofHash;
        status.isActive = true;
        
        emit POUSubmitted(string(abi.encodePacked(name, ".", tld)), proofHash, block.timestamp);
    }
    
    /**
     * @dev Check if a domain is compliant with POU requirements
     */
    function checkPOUCompliance(string memory name, string memory tld) public view returns (bool) {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        POUStatus storage status = domainPOUStatus[domainHash];
        POUConfig storage config = tldPOUConfig[tld];
        
        if (!config.requiresProof) {
            return true;
        }
        
        if (status.lastProofTime == 0) {
            return false;
        }
        
        uint256 timeSinceLastProof = block.timestamp - status.lastProofTime;
        return timeSinceLastProof <= (config.requiredPeriod + config.gracePeriod);
    }
    
    /**
     * @dev Deactivate domains that haven't met POU requirements
     */
    function deactivateNonCompliantDomain(string memory name, string memory tld) external {
        require(!checkPOUCompliance(name, tld), "Domain is compliant");
        
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        POUStatus storage status = domainPOUStatus[domainHash];
        status.isActive = false;
        
        emit DomainDeactivated(string(abi.encodePacked(name, ".", tld)), block.timestamp);
    }
    
    /**
     * @dev Get POU status for a domain
     */
    function getPOUStatus(string memory name, string memory tld) external view returns (
        uint256 lastProofTime,
        string memory lastProofHash,
        bool isActive,
        bool isCompliant
    ) {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        POUStatus storage status = domainPOUStatus[domainHash];
        
        return (
            status.lastProofTime,
            status.lastProofHash,
            status.isActive,
            checkPOUCompliance(name, tld)
        );
    }
}