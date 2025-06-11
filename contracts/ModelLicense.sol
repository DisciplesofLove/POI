// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ModelMarketplace.sol";

/**
 * @title ModelLicense
 * @dev NFT-based licensing system for AI models with SBT (Soulbound Token) options
 */
contract ModelLicense is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    ModelMarketplace public marketplace;
    Counters.Counter private _tokenIds;
    
    // License types
    enum LicenseType { TRANSFERABLE, SOULBOUND }
    
    struct License {
        bytes32 modelId;
        LicenseType licenseType;
        uint256 validUntil;
        uint256 maxUses;
        uint256 usageCount;
        bool revoked;
    }
    
    // Mapping from token ID to License info
    mapping(uint256 => License) public licenses;
    
    // Events
    event LicenseIssued(uint256 tokenId, bytes32 modelId, address licensee, LicenseType licenseType);
    event LicenseRevoked(uint256 tokenId);
    event LicenseUsed(uint256 tokenId, bytes32 modelId);
    
    constructor(address _marketplace) ERC721("AI Model License", "AIML") {
        marketplace = ModelMarketplace(_marketplace);
    }
    
    /**
     * @dev Issue a new license for a model
     */
    function issueLicense(
        address to,
        bytes32 modelId,
        LicenseType licenseType,
        uint256 duration,
        uint256 maxUses,
        string memory metadataURI
    ) external returns (uint256) {
        require(msg.sender == marketplace.models(modelId).owner, "Not model owner");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        licenses[newTokenId] = License({
            modelId: modelId,
            licenseType: licenseType,
            validUntil: duration > 0 ? block.timestamp + duration : type(uint256).max,
            maxUses: maxUses,
            usageCount: 0,
            revoked: false
        });
        
        emit LicenseIssued(newTokenId, modelId, to, licenseType);
        return newTokenId;
    }
    
    /**
     * @dev Override transfer function to implement soulbound functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0)) { // Not minting
            require(
                licenses[tokenId].licenseType != LicenseType.SOULBOUND,
                "License is soulbound"
            );
        }
    }
    
    /**
     * @dev Record usage of a license
     */
    function recordUsage(uint256 tokenId) external {
        require(msg.sender == address(marketplace), "Only marketplace");
        require(!licenses[tokenId].revoked, "License revoked");
        require(block.timestamp <= licenses[tokenId].validUntil, "License expired");
        require(
            licenses[tokenId].maxUses == 0 || 
            licenses[tokenId].usageCount < licenses[tokenId].maxUses,
            "Usage limit reached"
        );
        
        licenses[tokenId].usageCount++;
        emit LicenseUsed(tokenId, licenses[tokenId].modelId);
    }
    
    /**
     * @dev Revoke a license
     */
    function revokeLicense(uint256 tokenId) external {
        bytes32 modelId = licenses[tokenId].modelId;
        require(msg.sender == marketplace.models(modelId).owner, "Not model owner");
        require(!licenses[tokenId].revoked, "Already revoked");
        
        licenses[tokenId].revoked = true;
        emit LicenseRevoked(tokenId);
    }
    
    /**
     * @dev Check if a license is valid
     */
    function isValidLicense(uint256 tokenId) public view returns (bool) {
        License memory license = licenses[tokenId];
        return !license.revoked &&
            block.timestamp <= license.validUntil &&
            (license.maxUses == 0 || license.usageCount < license.maxUses);
    }
}