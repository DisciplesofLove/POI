// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./JoyNetDomainRegistry.sol";

/**
 * @title ProofOfIntegrity
 * @dev Manages Proof of Integrity (POI) for data and models
 */
contract ProofOfIntegrity is Ownable, ReentrancyGuard {
    JoyNetDomainRegistry public domainRegistry;
    
    struct IntegrityProof {
        string ipfsHash;             // IPFS content hash
        string iotaMessageId;        // IOTA message ID containing attestation
        uint256 timestamp;           // When the proof was submitted
        string version;              // Version label (e.g., "v1", "v2")
        bool isActive;               // Whether this is the current version
    }
    
    struct ModelMetadata {
        string description;          // Model description
        string[] inputTypes;         // Expected input types
        string[] outputTypes;        // Expected output types
        uint256 lastUpdated;         // Last update timestamp
    }
    
    // Mapping from domain hash to array of integrity proofs
    mapping(bytes32 => IntegrityProof[]) public domainProofs;
    
    // Mapping from domain hash to model metadata
    mapping(bytes32 => ModelMetadata) public modelMetadata;
    
    // Events
    event IntegrityProofSubmitted(
        string domain,
        string ipfsHash,
        string iotaMessageId,
        string version
    );
    event ModelMetadataUpdated(
        string domain,
        string description,
        string[] inputTypes,
        string[] outputTypes
    );
    
    constructor(address _domainRegistry) {
        domainRegistry = PermaNetDomainRegistry(_domainRegistry);
    }
    
    /**
     * @dev Submit a new integrity proof for a domain
     */
    function submitIntegrityProof(
        string memory name,
        string memory tld,
        string memory ipfsHash,
        string memory iotaMessageId,
        string memory version
    ) external {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        
        // Verify domain ownership
        (address owner,,,,) = domainRegistry.getDomainInfo(name, tld);
        require(owner == msg.sender, "Not domain owner");
        
        // Deactivate previous version if it exists
        IntegrityProof[] storage proofs = domainProofs[domainHash];
        if (proofs.length > 0) {
            proofs[proofs.length - 1].isActive = false;
        }
        
        // Add new proof
        proofs.push(IntegrityProof({
            ipfsHash: ipfsHash,
            iotaMessageId: iotaMessageId,
            timestamp: block.timestamp,
            version: version,
            isActive: true
        }));
        
        emit IntegrityProofSubmitted(
            string(abi.encodePacked(name, ".", tld)),
            ipfsHash,
            iotaMessageId,
            version
        );
    }
    
    /**
     * @dev Update model metadata
     */
    function updateModelMetadata(
        string memory name,
        string memory tld,
        string memory description,
        string[] memory inputTypes,
        string[] memory outputTypes
    ) external {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        
        // Verify domain ownership
        (address owner,,,,) = domainRegistry.getDomainInfo(name, tld);
        require(owner == msg.sender, "Not domain owner");
        
        modelMetadata[domainHash] = ModelMetadata({
            description: description,
            inputTypes: inputTypes,
            outputTypes: outputTypes,
            lastUpdated: block.timestamp
        });
        
        emit ModelMetadataUpdated(
            string(abi.encodePacked(name, ".", tld)),
            description,
            inputTypes,
            outputTypes
        );
    }
    
    /**
     * @dev Get the current active integrity proof for a domain
     */
    function getCurrentProof(string memory name, string memory tld) external view returns (
        string memory ipfsHash,
        string memory iotaMessageId,
        uint256 timestamp,
        string memory version
    ) {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        IntegrityProof[] storage proofs = domainProofs[domainHash];
        
        require(proofs.length > 0, "No proofs submitted");
        IntegrityProof storage current = proofs[proofs.length - 1];
        
        return (
            current.ipfsHash,
            current.iotaMessageId,
            current.timestamp,
            current.version
        );
    }
    
    /**
     * @dev Get all integrity proofs for a domain
     */
    function getProofHistory(string memory name, string memory tld) external view returns (
        string[] memory ipfsHashes,
        string[] memory iotaMessageIds,
        uint256[] memory timestamps,
        string[] memory versions
    ) {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        IntegrityProof[] storage proofs = domainProofs[domainHash];
        
        ipfsHashes = new string[](proofs.length);
        iotaMessageIds = new string[](proofs.length);
        timestamps = new uint256[](proofs.length);
        versions = new string[](proofs.length);
        
        for (uint i = 0; i < proofs.length; i++) {
            ipfsHashes[i] = proofs[i].ipfsHash;
            iotaMessageIds[i] = proofs[i].iotaMessageId;
            timestamps[i] = proofs[i].timestamp;
            versions[i] = proofs[i].version;
        }
        
        return (ipfsHashes, iotaMessageIds, timestamps, versions);
    }
    
    /**
     * @dev Verify if a specific hash matches the current version
     */
    function verifyIntegrity(
        string memory name,
        string memory tld,
        string memory ipfsHash
    ) external view returns (bool) {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        IntegrityProof[] storage proofs = domainProofs[domainHash];
        
        if (proofs.length == 0) {
            return false;
        }
        
        IntegrityProof storage current = proofs[proofs.length - 1];
        return keccak256(bytes(current.ipfsHash)) == keccak256(bytes(ipfsHash));
    }
}