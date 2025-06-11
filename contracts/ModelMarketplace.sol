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
    // Core contracts
    IERC20 public joyToken;
    ProofOfUse public pouContract;
    ModelLicense public licenseContract;
    MarketplaceGovernance public governanceContract;
    RevenueLogger public revenueLogger;
    
    // Structure to store store information
    struct Store {
        string name;
        string description;
        bool isActive;
        uint256 modelCount;
        mapping(uint256 => bytes32) modelIds; // Array of model IDs in the store
    }

    // Structure to store user contract information
    struct UserContract {
        address owner;
        string name;
        string version;
        address deployedAddress;
        string sourceCodeHash;  // IPFS hash of the contract source code
        string abiHash;        // IPFS hash of the contract ABI
        bool isVerified;
        uint256 createdAt;
        uint256 lastUpdated;
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
        bytes32[] contracts;  // Associated smart contracts
    }
    
    // Mapping of model IDs to their info
    mapping(bytes32 => Model) public models;
    
    // Mapping of store IDs to store info
    mapping(bytes32 => Store) public stores;
    
    // Mapping of address to their store IDs
    mapping(address => bytes32) public ownerToStore;

    // Mapping of contract IDs to their info
    mapping(bytes32 => UserContract) public userContracts;
    
    // Mapping of address to their contract IDs
    mapping(address => bytes32[]) public ownerToContracts;
    
    // Events
    event StoreCreated(bytes32 indexed storeId, address indexed owner, string name);
    event StoreUpdated(bytes32 indexed storeId, string name, string description);
    event ModelRegistered(bytes32 indexed modelId, address indexed owner, bytes32 indexed storeId);
    event ModelUpdated(bytes32 indexed modelId, string name, string version);
    event ModelUsed(bytes32 indexed modelId, bytes32 indexed executionId);
    event ModelDeactivated(bytes32 indexed modelId);
    event ContractRegistered(bytes32 indexed contractId, address indexed owner, string name);
    event ContractUpdated(bytes32 indexed contractId, string name, string version);
    event ContractDeployed(bytes32 indexed contractId, address deployedAddress);
    event ContractVerified(bytes32 indexed contractId);
    
    constructor(
        address _joyToken,
        address _pouContract,
        address _licenseContract,
        address _governanceContract,
        address _revenueLogger
    ) {
        joyToken = IERC20(_joyToken);
        pouContract = ProofOfUse(_pouContract);
        licenseContract = ModelLicense(_licenseContract);
        governanceContract = MarketplaceGovernance(_governanceContract);
        revenueLogger = RevenueLogger(_revenueLogger);
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
    function useModel(bytes32 modelId, bytes32 executionId, uint256 licenseId) external {
        Model storage model = models[modelId];
        require(model.isActive, "Model not active");
        
        // Verify license if provided
        if (licenseId > 0) {
            require(licenseContract.ownerOf(licenseId) == msg.sender, "Not license owner");
            require(licenseContract.isValidLicense(licenseId), "Invalid license");
            licenseContract.recordUsage(licenseId);
        } else {
            // Pay per use if no license
            require(
                joyToken.transferFrom(msg.sender, model.owner, model.price),
                "Payment failed"
            );
        }
        
        // Update usage stats
        model.totalUses++;
        model.revenue += model.price;
        
        // Log revenue
        bytes32 txHash = keccak256(abi.encodePacked(modelId, executionId, block.timestamp));
        revenueLogger.logRevenue(
            txHash,
            modelId,
            model.owner,
            msg.sender,
            model.price,
            model.price * governanceContract.platformFee() / 10000
        );
        
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

    /**
     * @dev Register a new smart contract
     */
    function registerContract(
        bytes32 contractId,
        string memory name,
        string memory version,
        string memory sourceCodeHash,
        string memory abiHash
    ) external {
        require(userContracts[contractId].owner == address(0), "Contract ID already exists");
        
        userContracts[contractId] = UserContract({
            owner: msg.sender,
            name: name,
            version: version,
            deployedAddress: address(0),
            sourceCodeHash: sourceCodeHash,
            abiHash: abiHash,
            isVerified: false,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        ownerToContracts[msg.sender].push(contractId);
        emit ContractRegistered(contractId, msg.sender, name);
    }

    /**
     * @dev Update contract information
     */
    function updateContract(
        bytes32 contractId,
        string memory name,
        string memory version,
        string memory sourceCodeHash,
        string memory abiHash
    ) external {
        UserContract storage userContract = userContracts[contractId];
        require(msg.sender == userContract.owner, "Not contract owner");
        
        userContract.name = name;
        userContract.version = version;
        userContract.sourceCodeHash = sourceCodeHash;
        userContract.abiHash = abiHash;
        userContract.lastUpdated = block.timestamp;
        
        emit ContractUpdated(contractId, name, version);
    }

    /**
     * @dev Set deployed contract address
     */
    function setContractAddress(bytes32 contractId, address deployedAddress) external {
        UserContract storage userContract = userContracts[contractId];
        require(msg.sender == userContract.owner, "Not contract owner");
        require(userContract.deployedAddress == address(0), "Contract already deployed");
        
        userContract.deployedAddress = deployedAddress;
        emit ContractDeployed(contractId, deployedAddress);
    }

    /**
     * @dev Mark contract as verified
     */
    function verifyContract(bytes32 contractId) external onlyOwner {
        UserContract storage userContract = userContracts[contractId];
        require(!userContract.isVerified, "Contract already verified");
        
        userContract.isVerified = true;
        emit ContractVerified(contractId);
    }

    /**
     * @dev Get contract information
     */
    function getContractInfo(bytes32 contractId) external view returns (
        address owner,
        string memory name,
        string memory version,
        address deployedAddress,
        string memory sourceCodeHash,
        string memory abiHash,
        bool isVerified,
        uint256 createdAt,
        uint256 lastUpdated
    ) {
        UserContract storage userContract = userContracts[contractId];
        return (
            userContract.owner,
            userContract.name,
            userContract.version,
            userContract.deployedAddress,
            userContract.sourceCodeHash,
            userContract.abiHash,
            userContract.isVerified,
            userContract.createdAt,
            userContract.lastUpdated
        );
    }

    /**
     * @dev Get user's contracts
     */
    function getUserContracts(address user) external view returns (bytes32[] memory) {
        return ownerToContracts[user];
    }

    /**
     * @dev Associate a contract with a model
     */
    function associateContractWithModel(bytes32 modelId, bytes32 contractId) external {
        Model storage model = models[modelId];
        UserContract storage userContract = userContracts[contractId];
        require(msg.sender == model.owner, "Not model owner");
        require(userContract.owner == msg.sender, "Not contract owner");
        
        model.contracts.push(contractId);
    }
}