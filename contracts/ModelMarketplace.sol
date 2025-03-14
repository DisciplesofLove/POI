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
    
    // Structure to store model information
    struct Model {
        address owner;
        string metadata;  // IPFS hash pointing to model metadata
        uint256 price;    // Price per inference in JOY tokens
        bool isActive;
        uint256 totalUses;
        uint256 revenue;
    }
    
    // Mapping of model IDs to their info
    mapping(bytes32 => Model) public models;
    
    // Events
    event ModelRegistered(bytes32 indexed modelId, address indexed owner);
    event ModelUsed(bytes32 indexed modelId, bytes32 indexed executionId);
    event ModelDeactivated(bytes32 indexed modelId);
    
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
        uint256 price
    ) external {
        require(!models[modelId].isActive, "Model ID already exists");
        
        models[modelId] = Model({
            owner: msg.sender,
            metadata: metadata,
            price: price,
            isActive: true,
            totalUses: 0,
            revenue: 0
        });
        
        emit ModelRegistered(modelId, msg.sender);
    }
    
    /**
     * @dev Pay for model usage and record execution
     */
    function useModel(bytes32 modelId, bytes32 executionId) external {
        Model storage model = models[modelId];
        require(model.isActive, "Model not active");
        
        // Transfer payment
        require(
            joyToken.transferFrom(msg.sender, model.owner, model.price),
            "Payment failed"
        );
        
        // Update usage stats
        model.totalUses++;
        model.revenue += model.price;
        
        emit ModelUsed(modelId, executionId);
    }
    
    /**
     * @dev Get model information
     */
    function getModelInfo(bytes32 modelId) external view returns (
        address owner,
        string memory metadata,
        uint256 price,
        bool isActive,
        uint256 totalUses,
        uint256 revenue
    ) {
        Model storage model = models[modelId];
        return (
            model.owner,
            model.metadata,
            model.price,
            model.isActive,
            model.totalUses,
            model.revenue
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
     * @dev Update model price
     */
    function updateModelPrice(bytes32 modelId, uint256 newPrice) external {
        Model storage model = models[modelId];
        require(msg.sender == model.owner, "Not model owner");
        model.price = newPrice;
    }
}