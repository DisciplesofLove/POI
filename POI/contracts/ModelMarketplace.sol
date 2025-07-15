// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ProofOfUse.sol";
import "./TokenEconomics.sol";
import "./DynamicFees.sol";

/**
 * @title ModelMarketplace
 * @dev Marketplace for AI models with usage tracking and rewards
 */
contract ModelMarketplace is Ownable, ReentrancyGuard {
    // Platform contracts
    IERC20 public joyToken;
    ProofOfUse public pouContract;
    TokenEconomics public tokenEconomics;
    DynamicFees public feeSystem;
    
    // Structure to store model information
    struct Model {
        address owner;
        string metadata;     // IPFS hash pointing to model metadata
        uint256 basePrice;   // Base price per inference in JOY tokens
        bool isActive;
        uint256 totalUses;
        uint256 revenue;
        uint256 complexity;  // Model complexity score (1-100)
        uint256 sizeMB;     // Model size in MB
        uint256 rating;     // Average user rating (1-100)
    }
    
    // Mapping of model IDs to their info
    mapping(bytes32 => Model) public models;
    
    // User ratings for models
    mapping(bytes32 => mapping(address => uint256)) public userRatings;
    mapping(bytes32 => uint256) public totalRatings;
    
    // Events
    event ModelRegistered(bytes32 indexed modelId, address indexed owner, uint256 listingFee);
    event ModelUsed(bytes32 indexed modelId, bytes32 indexed executionId, uint256 fee);
    event ModelDeactivated(bytes32 indexed modelId);
    event ModelRated(bytes32 indexed modelId, address indexed user, uint256 rating);
    event RevenueDistributed(bytes32 indexed modelId, address indexed owner, uint256 amount);
    
    constructor(
        address _joyToken,
        address _pouContract,
        address _tokenEconomics,
        address _feeSystem
    ) {
        joyToken = IERC20(_joyToken);
        pouContract = ProofOfUse(_pouContract);
        tokenEconomics = TokenEconomics(_tokenEconomics);
        feeSystem = DynamicFees(_feeSystem);
    }
    
    /**
     * @dev Register a new model
     */
    function registerModel(
        bytes32 modelId,
        string memory metadata,
        uint256 basePrice,
        uint256 complexity,
        uint256 sizeMB
    ) external nonReentrant {
        require(!models[modelId].isActive, "Model ID already exists");
        require(complexity <= 100, "Invalid complexity score");
        
        // Calculate and charge listing fee
        uint256 listingFee = feeSystem.calculateModelListingFee(msg.sender, sizeMB);
        require(joyToken.transferFrom(msg.sender, address(this), listingFee), "Listing fee transfer failed");
        
        models[modelId] = Model({
            owner: msg.sender,
            metadata: metadata,
            basePrice: basePrice,
            isActive: true,
            totalUses: 0,
            revenue: 0,
            complexity: complexity,
            sizeMB: sizeMB,
            rating: 0
        });
        
        // Update quality score based on model registration
        tokenEconomics.updateQualityScore(msg.sender, 10); // Base score for registration
        
        emit ModelRegistered(modelId, msg.sender, listingFee);
    }
    
    /**
     * @dev Pay for model usage and record execution
     */
    function useModel(bytes32 modelId, bytes32 executionId) external nonReentrant {
        Model storage model = models[modelId];
        require(model.isActive, "Model not active");
        
        // Calculate dynamic fee
        uint256 fee = feeSystem.calculateInferenceFee(msg.sender, model.complexity);
        uint256 totalFee = model.basePrice + fee;
        
        // Transfer payment
        require(joyToken.transferFrom(msg.sender, address(this), totalFee), "Payment failed");
        
        // Distribute revenue
        uint256 platformFee = (totalFee * 10) / 100; // 10% platform fee
        uint256 ownerRevenue = totalFee - platformFee;
        
        require(joyToken.transfer(model.owner, ownerRevenue), "Owner payment failed");
        
        // Update usage stats
        model.totalUses++;
        model.revenue += ownerRevenue;
        
        // Update participation scores
        tokenEconomics.updateParticipationScore(msg.sender, 
            tokenEconomics.participationScore(msg.sender) + 1);
        
        emit ModelUsed(modelId, executionId, totalFee);
        emit RevenueDistributed(modelId, model.owner, ownerRevenue);
    }
    
    /**
     * @dev Rate a model after usage
     */
    function rateModel(bytes32 modelId, uint256 rating) external {
        require(rating >= 1 && rating <= 100, "Invalid rating");
        Model storage model = models[modelId];
        require(model.isActive, "Model not active");
        
        // Update rating
        uint256 oldRating = userRatings[modelId][msg.sender];
        if (oldRating > 0) {
            model.rating = ((model.rating * totalRatings[modelId]) - oldRating + rating) / totalRatings[modelId];
        } else {
            totalRatings[modelId]++;
            model.rating = ((model.rating * (totalRatings[modelId] - 1)) + rating) / totalRatings[modelId];
        }
        
        userRatings[modelId][msg.sender] = rating;
        
        // Update model owner's quality score based on ratings
        if (totalRatings[modelId] >= 10) {
            tokenEconomics.updateQualityScore(model.owner, model.rating);
        }
        
        emit ModelRated(modelId, msg.sender, rating);
    }
    
    /**
     * @dev Get model information
     */
    function getModelInfo(bytes32 modelId) external view returns (
        address owner,
        string memory metadata,
        uint256 basePrice,
        bool isActive,
        uint256 totalUses,
        uint256 revenue,
        uint256 complexity,
        uint256 sizeMB,
        uint256 rating,
        uint256 totalRatingCount
    ) {
        Model storage model = models[modelId];
        return (
            model.owner,
            model.metadata,
            model.basePrice,
            model.isActive,
            model.totalUses,
            model.revenue,
            model.complexity,
            model.sizeMB,
            model.rating,
            totalRatings[modelId]
        );
    }
    
    /**
     * @dev Deactivate a model
     */
    function deactivateModel(bytes32 modelId) external {
        Model storage model = models[modelId];
        require(msg.sender == model.owner || msg.sender == owner(), "Not authorized");
        model.isActive = false;
        emit ModelDeactivated(modelId);
    }
    
    /**
     * @dev Update model base price
     */
    function updateModelPrice(bytes32 modelId, uint256 newPrice) external {
        Model storage model = models[modelId];
        require(msg.sender == model.owner, "Not model owner");
        model.basePrice = newPrice;
    }
    
    /**
     * @dev Withdraw accumulated platform fees (only owner)
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = joyToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(joyToken.transfer(owner(), balance), "Transfer failed");
    }
}