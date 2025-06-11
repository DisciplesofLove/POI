// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title DecentralizedIdentity
 * @dev Self-sovereign identity management for users
 */
contract DecentralizedIdentity is AccessControl {
    using ECDSA for bytes32;
    
    bytes32 public constant IDENTITY_MANAGER_ROLE = keccak256("IDENTITY_MANAGER_ROLE");
    
    // Identity structure
    struct Identity {
        address owner;
        string didDocument;      // IPFS hash of DID document
        mapping(string) string verifiableCredentials; // credential type => IPFS hash
        uint256 reputationScore;
        bool isActive;
        uint256 lastUpdated;
    }
    
    // Mapping from address to Identity
    mapping(address => Identity) public identities;
    
    // Mapping from DID to owner address
    mapping(string => address) public didToAddress;
    
    // Events
    event IdentityCreated(address indexed owner, string didDocument);
    event CredentialAdded(address indexed owner, string credentialType);
    event IdentityUpdated(address indexed owner, string didDocument);
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(IDENTITY_MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new decentralized identity
     */
    function createIdentity(string memory didDocument) external {
        require(bytes(identities[msg.sender].didDocument).length == 0, "Identity already exists");
        
        identities[msg.sender].owner = msg.sender;
        identities[msg.sender].didDocument = didDocument;
        identities[msg.sender].reputationScore = 50; // Start with neutral score
        identities[msg.sender].isActive = true;
        identities[msg.sender].lastUpdated = block.timestamp;
        
        didToAddress[didDocument] = msg.sender;
        
        emit IdentityCreated(msg.sender, didDocument);
    }
    
    /**
     * @dev Add a verifiable credential to identity
     */
    function addCredential(string memory credentialType, string memory credentialHash) external {
        require(identities[msg.sender].isActive, "Identity not active");
        
        identities[msg.sender].verifiableCredentials[credentialType] = credentialHash;
        identities[msg.sender].lastUpdated = block.timestamp;
        
        emit CredentialAdded(msg.sender, credentialType);
    }
    
    /**
     * @dev Update identity DID document
     */
    function updateIdentity(string memory newDidDocument) external {
        require(identities[msg.sender].isActive, "Identity not active");
        
        // Remove old DID mapping
        delete didToAddress[identities[msg.sender].didDocument];
        
        // Update to new DID
        identities[msg.sender].didDocument = newDidDocument;
        identities[msg.sender].lastUpdated = block.timestamp;
        
        // Add new DID mapping
        didToAddress[newDidDocument] = msg.sender;
        
        emit IdentityUpdated(msg.sender, newDidDocument);
    }
    
    /**
     * @dev Verify a signed message from a DID owner
     */
    function verifySignature(
        address signer,
        bytes32 messageHash,
        bytes memory signature
    ) external pure returns (bool) {
        return messageHash.recover(signature) == signer;
    }
    
    /**
     * @dev Get identity information
     */
    function getIdentity(address owner) external view returns (
        string memory didDocument,
        uint256 reputationScore,
        bool isActive,
        uint256 lastUpdated
    ) {
        Identity storage identity = identities[owner];
        require(identity.isActive, "Identity not active");
        
        return (
            identity.didDocument,
            identity.reputationScore,
            identity.isActive,
            identity.lastUpdated
        );
    }
    
    /**
     * @dev Get credential by type
     */
    function getCredential(address owner, string memory credentialType) external view returns (string memory) {
        require(identities[owner].isActive, "Identity not active");
        return identities[owner].verifiableCredentials[credentialType];
    }
}