// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ModelMarketplace.sol";
import "./JoyToken.sol";

/**
 * @title ModelFusionContract
 * @dev Handles the creation and management of fused AI models
 */
contract ModelFusionContract is Ownable, ReentrancyGuard {
    // Core contracts
    JoyToken public joyToken;
    ModelMarketplace public modelMarketplace;
    
    // Structure for fused models
    struct FusedModel {
        bytes32 fusedModelId;
        address creator;
        bytes32[] componentModelIds;
        address[] componentOwners;
        uint256[] royaltyShares;  // Percentage shares (out of 10000)
        string metadataURI;
        uint256 price;
        uint256 totalUses;
        uint256 totalRevenue;
        bool isActive;
        uint256 createdAt;
    }
    
    // Mapping of fused model IDs to their info
    mapping(bytes32 => FusedModel) public fusedModels;
    
    // Platform fee percentage (1%)
    uint256 public constant PLATFORM_FEE = 100;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Events
    event FusedModelCreated(
        bytes32 indexed fusedModelId,
        address indexed creator,
        bytes32[] componentModelIds,
        uint256 price
    );
    
    event FusedModelUsed(
        bytes32 indexed fusedModelId,
        address indexed user,
        uint256 price
    );
    
    event RoyaltiesDistributed(
        bytes32 indexed fusedModelId,
        address[] recipients,
        uint256[] amounts
    );
    
    constructor(
        address _joyToken,
        address _modelMarketplace
    ) {
        joyToken = JoyToken(_joyToken);
        modelMarketplace = ModelMarketplace(_modelMarketplace);
    }
    
    /**
     * @dev Create a new fused model from component models
     */
    function createFusedModel(
        bytes32[] memory componentModelIds,
        uint256[] memory royaltyShares,
        string memory metadataURI,
        uint256 price
    ) external nonReentrant returns (bytes32) {
        require(componentModelIds.length >= 2, "Need at least 2 component models");
        require(componentModelIds.length == royaltyShares.length, "Component and royalty arrays must match");
        
        // Validate royalty shares add up to 10000 (100%)
        uint256 totalShares = 0;
        for (uint256 i = 0; i < royaltyShares.length; i++) {
            totalShares += royaltyShares[i];
        }
        require(totalShares == FEE_DENOMINATOR, "Royalty shares must total 100%");
        
        // Generate a unique ID for the fused model
        bytes32 fusedModelId = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            componentModelIds
        ));
        
        // Get component model owners
        address[] memory componentOwners = new address[](componentModelIds.length);
        for (uint256 i = 0; i < componentModelIds.length; i++) {
            (address owner, , , , , , , ) = modelMarketplace.getModel(componentModelIds[i]);
            componentOwners[i] = owner;
        }
        
        // Create the fused model
        fusedModels[fusedModelId] = FusedModel({
            fusedModelId: fusedModelId,
            creator: msg.sender,
            componentModelIds: componentModelIds,
            componentOwners: componentOwners,
            royaltyShares: royaltyShares,
            metadataURI: metadataURI,
            price: price,
            totalUses: 0,
            totalRevenue: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit FusedModelCreated(fusedModelId, msg.sender, componentModelIds, price);
        
        return fusedModelId;
    }
    
    /**
     * @dev Use a fused model and distribute royalties
     */
    function useFusedModel(bytes32 fusedModelId) external nonReentrant {
        FusedModel storage model = fusedModels[fusedModelId];
        require(model.isActive, "Fused model is not active");
        
        uint256 price = model.price;
        uint256 platformFee = (price * PLATFORM_FEE) / FEE_DENOMINATOR;
        uint256 royaltyAmount = price - platformFee;
        
        // Transfer platform fee
        require(
            joyToken.transferFrom(msg.sender, address(this), price),
            "Payment failed"
        );
        
        // Distribute royalties
        uint256[] memory royaltyAmounts = new uint256[](model.componentOwners.length);
        for (uint256 i = 0; i < model.componentOwners.length; i++) {
            royaltyAmounts[i] = (royaltyAmount * model.royaltyShares[i]) / FEE_DENOMINATOR;
            require(
                joyToken.transfer(model.componentOwners[i], royaltyAmounts[i]),
                "Royalty transfer failed"
            );
        }
        
        // Update model stats
        model.totalUses++;
        model.totalRevenue += price;
        
        emit FusedModelUsed(fusedModelId, msg.sender, price);
        emit RoyaltiesDistributed(fusedModelId, model.componentOwners, royaltyAmounts);
    }
    
    /**
     * @dev Update a fused model's price or metadata
     */
    function updateFusedModel(
        bytes32 fusedModelId,
        uint256 newPrice,
        string memory newMetadataURI
    ) external {
        FusedModel storage model = fusedModels[fusedModelId];
        require(msg.sender == model.creator, "Not the creator");
        
        model.price = newPrice;
        model.metadataURI = newMetadataURI;
    }
    
    /**
     * @dev Deactivate a fused model
     */
    function deactivateFusedModel(bytes32 fusedModelId) external {
        FusedModel storage model = fusedModels[fusedModelId];
        require(msg.sender == model.creator || msg.sender == owner(), "Not authorized");
        
        model.isActive = false;
    }
    
    /**
     * @dev Get fused model details
     */
    function getFusedModel(bytes32 fusedModelId) external view returns (
        address creator,
        bytes32[] memory componentModelIds,
        address[] memory componentOwners,
        uint256[] memory royaltyShares,
        string memory metadataURI,
        uint256 price,
        uint256 totalUses,
        uint256 totalRevenue,
        bool isActive,
        uint256 createdAt
    ) {
        FusedModel storage model = fusedModels[fusedModelId];
        return (
            model.creator,
            model.componentModelIds,
            model.componentOwners,
            model.royaltyShares,
            model.metadataURI,
            model.price,
            model.totalUses,
            model.totalRevenue,
            model.isActive,
            model.createdAt
        );
    }
    
    /**
     * @dev Withdraw platform fees
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = joyToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(joyToken.transfer(owner(), balance), "Transfer failed");
    }
}