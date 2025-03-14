// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Identity
 * @dev Manages self-sovereign identity and access control
 */
contract Identity is Ownable {
    // Identity types
    enum IdentityType { Individual, Business, Developer, Node }
    
    // Identity structure
    struct UserIdentity {
        address owner;
        IdentityType idType;
        bytes32 metadataHash;  // IPFS hash of additional metadata
        bool isVerified;
        uint256 reputation;
        uint256 timestamp;
    }
    
    // Mapping of addresses to identities
    mapping(address => UserIdentity) public identities;
    
    // Events
    event IdentityCreated(address indexed user, IdentityType idType);
    event IdentityVerified(address indexed user);
    event IdentityUpdated(address indexed user, bytes32 newMetadataHash);
    
    /**
     * @dev Create a new identity
     */
    function createIdentity(
        IdentityType idType,
        bytes32 metadataHash
    ) external {
        require(identities[msg.sender].owner == address(0), "Identity exists");
        
        identities[msg.sender] = UserIdentity({
            owner: msg.sender,
            idType: idType,
            metadataHash: metadataHash,
            isVerified: false,
            reputation: 100,
            timestamp: block.timestamp
        });
        
        emit IdentityCreated(msg.sender, idType);
    }
    
    /**
     * @dev Verify an identity (only owner)
     */
    function verifyIdentity(address user) external onlyOwner {
        require(identities[user].owner != address(0), "Identity not found");
        identities[user].isVerified = true;
        emit IdentityVerified(user);
    }
    
    /**
     * @dev Update identity metadata
     */
    function updateMetadata(bytes32 newMetadataHash) external {
        require(identities[msg.sender].owner != address(0), "Identity not found");
        identities[msg.sender].metadataHash = newMetadataHash;
        emit IdentityUpdated(msg.sender, newMetadataHash);
    }
    
    /**
     * @dev Check if an address has a verified identity
     */
    function isVerified(address user) external view returns (bool) {
        return identities[user].isVerified;
    }
    
    /**
     * @dev Get identity type
     */
    function getIdentityType(address user) external view returns (IdentityType) {
        require(identities[user].owner != address(0), "Identity not found");
        return identities[user].idType;
    }
    
    /**
     * @dev Get identity reputation
     */
    function getReputation(address user) external view returns (uint256) {
        require(identities[user].owner != address(0), "Identity not found");
        return identities[user].reputation;
    }
}