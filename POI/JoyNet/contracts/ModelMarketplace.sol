// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./JoyToken.sol";
import "./ProofOfInference.sol";
import "./Identity.sol";
import "../contracts/TreasuryDistributor.sol";
import "../contracts/MembershipTiers.sol";

/**
 * @title ModelMarketplace
 * @dev Decentralized marketplace for AI models with verifiable inference and membership benefits
 */
contract ModelMarketplace is Ownable, ReentrancyGuard {
    // Core contracts
    JoyToken public joyToken;
    ProofOfInference public proofOfInference;
    Identity public identity;
    TreasuryDistributor public treasuryDistributor;
    MembershipTiers public membershipTiers;
    
    // Structure for AI models
    struct Model {
        address owner;
        string metadataURI;     // IPFS URI for model metadata & weights
        uint256 price;          // Price per inference in JOY tokens
        uint256 stake;          // Staked JOY tokens
        bool isActive;
        uint256 totalUses;
        uint256 revenue;
        uint256 reputation;
    }
    
    // Mapping of model IDs to their info
    mapping(bytes32 => Model) public models;
    
    // Minimum stake required to list a model
    uint256 public minStake = 1000 ether;  // 1000 JOY tokens
    
    // Platform fee percentage (2.5%)
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    // Events
    event ModelRegistered(bytes32 indexed modelId, address indexed owner, string metadataURI);
    event ModelUpdated(bytes32 indexed modelId, uint256 newPrice, string newMetadataURI);
    event ModelStaked(bytes32 indexed modelId, uint256 amount);
    event ModelUnstaked(bytes32 indexed modelId, uint256 amount);
    event InferenceExecuted(bytes32 indexed modelId, address indexed user, bytes32 executionId);
    event PlatformFeeDistributed(bytes32 indexed modelId, uint256 amount);
    
    constructor(
        address _joyToken,
        address _proofOfInference,
        address _identity,
        address _treasuryDistributor,
        address _membershipTiers
    ) {
        joyToken = JoyToken(_joyToken);
        proofOfInference = ProofOfInference(_proofOfInference);
        identity = Identity(_identity);
        treasuryDistributor = TreasuryDistributor(_treasuryDistributor);
        membershipTiers = MembershipTiers(_membershipTiers);
    }
    
    /**
     * @dev Register a new AI model
     */
    function registerModel(
        bytes32 modelId,
        string memory metadataURI,
        uint256 price,
        uint256 stakeAmount
    ) external nonReentrant {
        require(!models[modelId].isActive, "Model ID already exists");
        require(stakeAmount >= minStake, "Insufficient stake");
        require(
            identity.isVerified(msg.sender),
            "Must have verified identity"
        );
        
        // Transfer stake to contract
        require(
            joyToken.transferFrom(msg.sender, address(this), stakeAmount),
            "Stake transfer failed"
        );
        
        models[modelId] = Model({
            owner: msg.sender,
            metadataURI: metadataURI,
            price: price,
            stake: stakeAmount,
            isActive: true,
            totalUses: 0,
            revenue: 0,
            reputation: 100
        });
        
        emit ModelRegistered(modelId, msg.sender, metadataURI);
    }
    
    /**
     * @dev Execute model inference with membership benefits
     */
    function executeInference(
        bytes32 modelId,
        bytes32 executionId
    ) external nonReentrant {
        Model storage model = models[modelId];
        require(model.isActive, "Model not active");
        
        // Get user's membership tier and benefits
        (
            MembershipTiers.TierLevel tier,
            ,
            ,
            ,
            uint256 computePriority,
            ,
            
        ) = membershipTiers.getMembership(msg.sender);
        
        uint256 fee = model.price;
        
        // Apply membership discounts if applicable
        if (tier == MembershipTiers.TierLevel.Premium) {
            fee = (fee * 90) / 100; // 10% discount for Premium
        } else if (tier == MembershipTiers.TierLevel.Enterprise) {
            fee = (fee * 80) / 100; // 20% discount for Enterprise
        }
        
        // Calculate platform fee (2.5%)
        uint256 platformFee = (fee * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 ownerAmount = fee - platformFee;
        
        // Transfer fees
        require(
            joyToken.transferFrom(msg.sender, address(treasuryDistributor), platformFee),
            "Platform fee transfer failed"
        );
        require(
            joyToken.transferFrom(msg.sender, model.owner, ownerAmount),
            "Owner payment failed"
        );
        
        // Distribute platform fee across ecosystem pools
        treasuryDistributor.distributeFees(platformFee);
        
        // Update model stats
        model.totalUses++;
        model.revenue += ownerAmount;
        
        // Record usage for membership tracking
        membershipTiers.recordUsage(msg.sender, 1);
        
        // Set compute priority based on membership tier
        proofOfInference.setPriority(executionId, computePriority);
        
        emit InferenceExecuted(modelId, msg.sender, executionId);
        emit PlatformFeeDistributed(modelId, platformFee);
    }
    
    /**
     * @dev Update model details
     */
    function updateModel(
        bytes32 modelId,
        uint256 newPrice,
        string memory newMetadataURI
    ) external {
        Model storage model = models[modelId];
        require(msg.sender == model.owner, "Not model owner");
        
        model.price = newPrice;
        model.metadataURI = newMetadataURI;
        
        emit ModelUpdated(modelId, newPrice, newMetadataURI);
    }
    
    /**
     * @dev Add stake to a model
     */
    function addStake(bytes32 modelId, uint256 amount) external {
        Model storage model = models[modelId];
        require(msg.sender == model.owner, "Not model owner");
        
        require(
            joyToken.transferFrom(msg.sender, address(this), amount),
            "Stake transfer failed"
        );
        
        model.stake += amount;
        emit ModelStaked(modelId, amount);
    }
    
    /**
     * @dev Remove stake from a model
     */
    function removeStake(bytes32 modelId, uint256 amount) external {
        Model storage model = models[modelId];
        require(msg.sender == model.owner, "Not model owner");
        require(
            model.stake - amount >= minStake,
            "Must maintain minimum stake"
        );
        
        model.stake -= amount;
        require(
            joyToken.transfer(msg.sender, amount),
            "Stake return failed"
        );
        
        emit ModelUnstaked(modelId, amount);
    }
    
    /**
     * @dev Get model details
     */
    function getModel(bytes32 modelId) external view returns (
        address owner,
        string memory metadataURI,
        uint256 price,
        uint256 stake,
        bool isActive,
        uint256 totalUses,
        uint256 revenue,
        uint256 reputation
    ) {
        Model storage model = models[modelId];
        return (
            model.owner,
            model.metadataURI,
            model.price,
            model.stake,
            model.isActive,
            model.totalUses,
            model.revenue,
            model.reputation
        );
    }
    
    /**
     * @dev Update minimum stake requirement
     */
    function setMinStake(uint256 newMinStake) external onlyOwner {
        minStake = newMinStake;
    }
    
    /**
     * @dev Update core contract addresses
     */
    function updateContracts(
        address _treasuryDistributor,
        address _membershipTiers
    ) external onlyOwner {
        require(_treasuryDistributor != address(0), "Invalid treasury distributor");
        require(_membershipTiers != address(0), "Invalid membership tiers");
        
        treasuryDistributor = TreasuryDistributor(_treasuryDistributor);
        membershipTiers = MembershipTiers(_membershipTiers);
    }
}