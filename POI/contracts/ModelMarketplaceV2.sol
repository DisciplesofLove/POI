// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "./ProofOfUse.sol";
import "./interfaces/IIOTAValidator.sol";

/**
 * @title ModelMarketplaceV2
 * @dev Decentralized marketplace for AI models with IOTA integration
 */
contract ModelMarketplaceV2 {
    // Token used for governance
    IERC20 public joyToken;
    
    // Proof of Use contract for tracking model usage
    ProofOfUse public pouContract;
    
    // IOTA validator interface
    IIOTAValidator public iotaValidator;
    
    // DAO address for governance
    address public daoGovernor;
    
    // Structure to store model information
    struct Model {
        address owner;
        string metadata;  // IPFS hash pointing to model metadata
        uint256 price;    // Price per inference in JOY tokens
        bool isActive;
        uint256 totalUses;
        uint256 revenue;
        string iotaStreamId;  // IOTA Streams channel ID for this model
    }
    
    // Mapping of model IDs to their info
    mapping(bytes32 => Model) public models;
    
    // Events
    event ModelRegistered(bytes32 indexed modelId, address indexed owner, string iotaStreamId);
    event ModelUsed(bytes32 indexed modelId, bytes32 indexed executionId, string iotaMessageId);
    event ModelDeactivated(bytes32 indexed modelId);
    
    modifier onlyDAO() {
        require(msg.sender == daoGovernor, "Only DAO can perform this action");
        _;
    }
    
    constructor(
        address _joyToken,
        address _pouContract,
        address _iotaValidator,
        address _daoGovernor
    ) {
        joyToken = IERC20(_joyToken);
        pouContract = ProofOfUse(_pouContract);
        iotaValidator = IIOTAValidator(_iotaValidator);
        daoGovernor = _daoGovernor;
    }
    
    function registerModel(
        bytes32 modelId,
        string memory metadata,
        uint256 price,
        string memory iotaStreamId
    ) external {
        require(!models[modelId].isActive, "Model ID already exists");
        require(iotaValidator.validateStreamId(iotaStreamId), "Invalid IOTA stream ID");
        
        models[modelId] = Model({
            owner: msg.sender,
            metadata: metadata,
            price: price,
            isActive: true,
            totalUses: 0,
            revenue: 0,
            iotaStreamId: iotaStreamId
        });
        
        emit ModelRegistered(modelId, msg.sender, iotaStreamId);
    }
    
    function useModel(
        bytes32 modelId,
        bytes32 executionId,
        string memory iotaMessageId
    ) external {
        Model storage model = models[modelId];
        require(model.isActive, "Model not active");
        require(iotaValidator.validateMessage(iotaMessageId), "Invalid IOTA message");
        
        // If using IOTA for feeless inference, skip payment
        if (model.price > 0) {
            require(
                joyToken.transferFrom(msg.sender, model.owner, model.price),
                "Payment failed"
            );
            model.revenue += model.price;
        }
        
        model.totalUses++;
        emit ModelUsed(modelId, executionId, iotaMessageId);
    }
    
    function updateGovernance(address newDAO) external onlyDAO {
        daoGovernor = newDAO;
    }
    
    function getModelInfo(bytes32 modelId) external view returns (
        address owner,
        string memory metadata,
        uint256 price,
        bool isActive,
        uint256 totalUses,
        uint256 revenue,
        string memory iotaStreamId
    ) {
        Model storage model = models[modelId];
        return (
            model.owner,
            model.metadata,
            model.price,
            model.isActive,
            model.totalUses,
            model.revenue,
            model.iotaStreamId
        );
    }
    
    // Model owners can deactivate their own models
    function deactivateModel(bytes32 modelId) external {
        Model storage model = models[modelId];
        require(msg.sender == model.owner, "Not model owner");
        model.isActive = false;
        emit ModelDeactivated(modelId);
    }
}