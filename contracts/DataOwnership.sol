// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DataOwnership
 * @dev Manages personal data ownership and monetization rights
 */
contract DataOwnership is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    bytes32 public constant DATA_CURATOR_ROLE = keccak256("DATA_CURATOR_ROLE");
    
    // Data asset structure
    struct DataAsset {
        address owner;
        string dataType;        // e.g., "medical", "financial", "behavioral"
        string encryptionKey;   // Encrypted access key (only decryptable by owner)
        uint256 accessPrice;    // Price in JoyTokens for access
        bool isAvailable;       // Whether data is available for purchase
    }
    
    // Mapping from token ID to DataAsset
    mapping(uint256 => DataAsset) public dataAssets;
    
    // Mapping from user to their data assets
    mapping(address => uint256[]) public userDataAssets;
    
    // Access grants
    mapping(uint256 => mapping(address => uint256)) public accessGrants; // tokenId => user => expiration
    
    // Events
    event DataAssetRegistered(uint256 tokenId, address owner, string dataType);
    event DataAccessGranted(uint256 tokenId, address user, uint256 expiration);
    event DataPriceUpdated(uint256 tokenId, uint256 newPrice);
    
    constructor() ERC721("Personal Data Asset", "PDA") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DATA_CURATOR_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new data asset
     */
    function registerDataAsset(
        string memory dataType,
        string memory metadataURI,
        string memory encryptionKey,
        uint256 accessPrice
    ) external returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        dataAssets[newTokenId] = DataAsset({
            owner: msg.sender,
            dataType: dataType,
            encryptionKey: encryptionKey,
            accessPrice: accessPrice,
            isAvailable: true
        });
        
        userDataAssets[msg.sender].push(newTokenId);
        
        emit DataAssetRegistered(newTokenId, msg.sender, dataType);
        
        return newTokenId;
    }
    
    /**
     * @dev Grant access to data asset
     */
    function grantAccess(uint256 tokenId, address user, uint256 duration) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(dataAssets[tokenId].isAvailable, "Data not available");
        
        uint256 expiration = block.timestamp + duration;
        accessGrants[tokenId][user] = expiration;
        
        emit DataAccessGranted(tokenId, user, expiration);
    }
    
    /**
     * @dev Check if user has access to data
     */
    function hasAccess(uint256 tokenId, address user) public view returns (bool) {
        if (ownerOf(tokenId) == user) return true;
        return accessGrants[tokenId][user] > block.timestamp;
    }
    
    /**
     * @dev Update data access price
     */
    function updateAccessPrice(uint256 tokenId, uint256 newPrice) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        dataAssets[tokenId].accessPrice = newPrice;
        
        emit DataPriceUpdated(tokenId, newPrice);
    }
    
    /**
     * @dev Get all data assets owned by a user
     */
    function getUserDataAssets(address user) external view returns (uint256[] memory) {
        return userDataAssets[user];
    }
}