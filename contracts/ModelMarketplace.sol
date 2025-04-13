// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ProofOfUse.sol";

/**
 * @title ModelMarketplace
 * @dev Decentralized marketplace for AI models with personal stores and detailed model information
 */
contract ModelMarketplace is Ownable {
    // Token used for payments
    IERC20 public joyToken;
    
    // Proof of Use contract for tracking model usage
    ProofOfUse public pouContract;
    
    // Structure to store store information
    struct Store {
        string name;
        string description;
        bool isActive;
        uint256 modelCount;
        mapping(uint256 => bytes32) modelIds; // Array of model IDs in the store
    }

    // Structure to store model information
    struct Model {
        address owner;
        string name;
        string description;
        string version;
        string metadata;      // IPFS hash pointing to model metadata
        string documentation; // IPFS hash pointing to detailed documentation
        string sampleData;    // IPFS hash pointing to sample data/examples
        string[] tags;        // Categories/tags for the model
        uint256 price;        // Price per inference in JOY tokens
        bool isActive;
        uint256 totalUses;
        uint256 revenue;
        uint256 createdAt;
        uint256 lastUpdated;
        bytes32 storeId;      // ID of the store this model belongs to
    }
    
    // Mapping of model IDs to their info
    mapping(bytes32 => Model) public models;
    
    // Mapping of store IDs to store info
    mapping(bytes32 => Store) public stores;
    
    // Mapping of address to their store IDs
    mapping(address => bytes32) public ownerToStore;
    
    // Events
    event StoreCreated(bytes32 indexed storeId, address indexed owner, string name);
    event StoreUpdated(bytes32 indexed storeId, string name, string description);
    event ModelRegistered(bytes32 indexed modelId, address indexed owner, bytes32 indexed storeId);
    event ModelUpdated(bytes32 indexed modelId, string name, string version);
    event ModelUsed(bytes32 indexed modelId, bytes32 indexed executionId);
    event ModelDeactivated(bytes32 indexed modelId);
    
    constructor(address _joyToken, address _pouContract) {
        joyToken = IERC20(_joyToken);
        pouContract = ProofOfUse(_pouContract);
    }
    
    /**
     * @dev Create a new store for an address
     */
    function createStore(
        bytes32 storeId,
        string memory name,
        string memory description
    ) external {
        require(ownerToStore[msg.sender] == bytes32(0), "Store already exists for this address");
        require(!stores[storeId].isActive, "Store ID already exists");
        
        Store storage newStore = stores[storeId];
        newStore.name = name;
        newStore.description = description;
        newStore.isActive = true;
        newStore.modelCount = 0;
        
        ownerToStore[msg.sender] = storeId;
        
        emit StoreCreated(storeId, msg.sender, name);
    }
    
    /**
     * @dev Update store information
     */
    function updateStore(
        string memory name,
        string memory description
    ) external {
        bytes32 storeId = ownerToStore[msg.sender];
        require(storeId != bytes32(0), "No store found for this address");
        
        Store storage store = stores[storeId];
        store.name = name;
        store.description = description;
        
        emit StoreUpdated(storeId, name, description);
    }
    
    /**
     * @dev Register a new model in the owner's store
     */
    function registerModel(
        bytes32 modelId,
        string memory name,
        string memory description,
        string memory version,
        string memory metadata,
        string memory documentation,
        string memory sampleData,
        string[] memory tags,
        uint256 price
    ) external {
        bytes32 storeId = ownerToStore[msg.sender];
        require(storeId != bytes32(0), "Must create a store first");
        require(!models[modelId].isActive, "Model ID already exists");
        
        Store storage store = stores[storeId];
        store.modelIds[store.modelCount] = modelId;
        store.modelCount++;
        
        models[modelId] = Model({
            owner: msg.sender,
            name: name,
            description: description,
            version: version,
            metadata: metadata,
            documentation: documentation,
            sampleData: sampleData,
            tags: tags,
            price: price,
            isActive: true,
            totalUses: 0,
            revenue: 0,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            storeId: storeId
        });
        
        emit ModelRegistered(modelId, msg.sender, storeId);
    }
    
    /**
     * @dev Update model information
     */
    function updateModel(
        bytes32 modelId,
        string memory name,
        string memory description,
        string memory version,
        string memory metadata,
        string memory documentation,
        string memory sampleData,
        string[] memory tags,
        uint256 price
    ) external {
        Model storage model = models[modelId];
        require(msg.sender == model.owner, "Not model owner");
        
        model.name = name;
        model.description = description;
        model.version = version;
        model.metadata = metadata;
        model.documentation = documentation;
        model.sampleData = sampleData;
        model.tags = tags;
        model.price = price;
        model.lastUpdated = block.timestamp;
        
        emit ModelUpdated(modelId, name, version);
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
        string memory name,
        string memory description,
        string memory version,
        string memory metadata,
        string memory documentation,
        string memory sampleData,
        string[] memory tags,
        uint256 price,
        bool isActive,
        uint256 totalUses,
        uint256 revenue,
        uint256 createdAt,
        uint256 lastUpdated,
        bytes32 storeId
    ) {
        Model storage model = models[modelId];
        return (
            model.owner,
            model.name,
            model.description,
            model.version,
            model.metadata,
            model.documentation,
            model.sampleData,
            model.tags,
            model.price,
            model.isActive,
            model.totalUses,
            model.revenue,
            model.createdAt,
            model.lastUpdated,
            model.storeId
        );
    }
    
    /**
     * @dev Get store information
     */
    function getStoreInfo(bytes32 storeId) external view returns (
        string memory name,
        string memory description,
        bool isActive,
        uint256 modelCount
    ) {
        Store storage store = stores[storeId];
        return (
            store.name,
            store.description,
            store.isActive,
            store.modelCount
        );
    }
    
    /**
     * @dev Get store's model ID at index
     */
    function getStoreModelId(bytes32 storeId, uint256 index) external view returns (bytes32) {
        require(index < stores[storeId].modelCount, "Index out of bounds");
        return stores[storeId].modelIds[index];
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
}