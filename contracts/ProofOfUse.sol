// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProofOfUse
 * @dev Implements the Proof of Use (PoU) system for tracking AI model usage
 */
contract ProofOfUse is Ownable {
    // Token used for staking and rewards
    IERC20 public joyToken;
    
    // Structure to store AI model information
    struct AIModel {
        address creator;
        uint256 usageCount;
        uint256 rewardPerUse;
        bool isActive;
    }
    
    // Structure to store usage records
    struct UsageRecord {
        bytes32 modelId;
        address user;
        uint256 timestamp;
        bytes32 executionId;
    }
    
    // Mapping of model IDs to their info
    mapping(bytes32 => AIModel) public models;
    
    // Mapping of usage record IDs to their details
    mapping(bytes32 => UsageRecord) public usageRecords;
    
    // Events
    event ModelRegistered(bytes32 indexed modelId, address indexed creator);
    event ModelUsed(bytes32 indexed modelId, address indexed user, bytes32 executionId);
    event RewardsDistributed(bytes32 indexed modelId, address indexed creator, uint256 amount);
    
    constructor(address _joyToken) {
        joyToken = IERC20(_joyToken);
    }
    
    /**
     * @dev Register a new AI model
     */
    function registerModel(bytes32 modelId, uint256 rewardPerUse) external {
        require(!models[modelId].isActive, "Model already registered");
        
        models[modelId] = AIModel({
            creator: msg.sender,
            usageCount: 0,
            rewardPerUse: rewardPerUse,
            isActive: true
        });
        
        emit ModelRegistered(modelId, msg.sender);
    }
    
    /**
     * @dev Record usage of an AI model
     */
    function recordUsage(bytes32 modelId, bytes32 executionId) external {
        require(models[modelId].isActive, "Model not active");
        
        bytes32 usageId = keccak256(abi.encodePacked(
            modelId,
            msg.sender,
            block.timestamp,
            executionId
        ));
        
        usageRecords[usageId] = UsageRecord({
            modelId: modelId,
            user: msg.sender,
            timestamp: block.timestamp,
            executionId: executionId
        });
        
        models[modelId].usageCount++;
        
        emit ModelUsed(modelId, msg.sender, executionId);
        
        // Distribute rewards to model creator
        uint256 reward = models[modelId].rewardPerUse;
        if (reward > 0) {
            require(joyToken.transfer(models[modelId].creator, reward), "Reward transfer failed");
            emit RewardsDistributed(modelId, models[modelId].creator, reward);
        }
    }
    
    /**
     * @dev Get usage count for a model
     */
    function getModelUsageCount(bytes32 modelId) external view returns (uint256) {
        return models[modelId].usageCount;
    }
    
    /**
     * @dev Update reward per use for a model
     */
    function updateRewardPerUse(bytes32 modelId, uint256 newReward) external {
        require(msg.sender == models[modelId].creator, "Not model creator");
        models[modelId].rewardPerUse = newReward;
    }
}