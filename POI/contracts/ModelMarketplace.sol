// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ProofOfUse.sol";

/**
 * @title ModelMarketplace
 * @dev Marketplace for AI models with usage tracking and rewards
 */
contract ModelMarketplace is Ownable {
    // Token used for payments
    IERC20 public joyToken;
    
    // Proof of Use contract for tracking model usage
    ProofOfUse public pouContract;

    // Enums for licensing and storage options
    enum LicenseType { SingleUse, MultiUse, Lease, Perpetual }
    enum StorageType { IPFS, Arweave, Filecoin }
    
    // Structure for licensing terms
    struct License {
        LicenseType licenseType;
        uint256 price;          // Base price in JOY tokens
        uint256 usageLimit;     // For MultiUse license
        uint256 leaseDuration;  // For Lease license (in seconds)
    }
    
    // Structure to store model information
    struct Model {
        address owner;
        string metadata;         // IPFS hash pointing to model metadata
        string modelHash;        // Hash of the model chunks
        string aiReviewSummary; // AI-generated review summary
        string nftImage;        // URI of the NFT image
        StorageType storageType;
        License license;
        bool isActive;
        uint256 totalUses;
        uint256 revenue;
        string modelType;       // Algorithm/Dataset/Model/GPT/etc.
        string merkleRoot;      // Merkle tree root of model chunks
    }
    
    // Mapping of model IDs to their info
    mapping(bytes32 => Model) public models;
    
    // Events
    event ModelRegistered(bytes32 indexed modelId, address indexed owner, string modelType);
    event ModelUsed(bytes32 indexed modelId, bytes32 indexed executionId, LicenseType licenseType);
    event ModelDeactivated(bytes32 indexed modelId);
    event LicenseUpdated(bytes32 indexed modelId, LicenseType licenseType, uint256 price);
    
    constructor(address _joyToken, address _pouContract) {
        joyToken = IERC20(_joyToken);
        pouContract = ProofOfUse(_pouContract);
    }
    
    /**
     * @dev Register a new model
     */
    function registerModel(
        bytes32 modelId,
        string memory metadata,
        string memory modelHash,
        string memory aiReviewSummary,
        string memory nftImage,
        StorageType storageType,
        LicenseType licenseType,
        uint256 price,
        uint256 usageLimit,
        uint256 leaseDuration,
        string memory modelType,
        string memory merkleRoot
    ) external {
        require(!models[modelId].isActive, "Model ID already exists");
        
        License memory license = License({
            licenseType: licenseType,
            price: price,
            usageLimit: usageLimit,
            leaseDuration: leaseDuration
        });
        
        models[modelId] = Model({
            owner: msg.sender,
            metadata: metadata,
            modelHash: modelHash,
            aiReviewSummary: aiReviewSummary,
            nftImage: nftImage,
            storageType: storageType,
            license: license,
            isActive: true,
            totalUses: 0,
            revenue: 0,
            modelType: modelType,
            merkleRoot: merkleRoot
        });
        
        emit ModelRegistered(modelId, msg.sender, modelType);
    }

    /**
     * @dev Pay for model usage and record execution
     */
    function useModel(bytes32 modelId, bytes32 executionId) external {
        Model storage model = models[modelId];
        require(model.isActive, "Model not active");
        
        License storage license = model.license;
        require(validateLicenseUsage(license), "License conditions not met");
        
        // Transfer payment
        require(
            joyToken.transferFrom(msg.sender, model.owner, license.price),
            "Payment failed"
        );
        
        // Update usage stats
        model.totalUses++;
        model.revenue += license.price;
        
        if (license.licenseType == LicenseType.MultiUse) {
            license.usageLimit--;
        }
        
        emit ModelUsed(modelId, executionId, license.licenseType);
    }
    
    /**
     * @dev Validate license conditions
     */
    function validateLicenseUsage(License memory license) internal view returns (bool) {
        if (license.licenseType == LicenseType.SingleUse) {
            return true;
        } else if (license.licenseType == LicenseType.MultiUse) {
            return license.usageLimit > 0;
        } else if (license.licenseType == LicenseType.Lease) {
            return block.timestamp < license.leaseDuration;
        } else if (license.licenseType == LicenseType.Perpetual) {
            return true;
        }
        return false;
    }
}