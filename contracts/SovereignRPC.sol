// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SovereignRPC
 * @dev Manages the decentralized RPC network for JoyNet
 */
contract SovereignRPC is Ownable, ReentrancyGuard {
    // JOY token contract
    IERC20 public joyToken;
    
    // Node status enum
    enum NodeStatus { Inactive, Active, Slashed }
    
    // Node information
    struct Node {
        address operator;
        uint256 stake;
        uint256 lastHeartbeat;
        NodeStatus status;
        string endpoint;
        uint256 totalRequests;
        uint256 successfulRequests;
    }
    
    // Data provider information
    struct DataProvider {
        string cid;
        address[] providers;
        uint256 timestamp;
        bytes32 proofHash;
    }
    
    // Mapping of node address to Node struct
    mapping(address => Node) public nodes;
    
    // Mapping of data CID to provider information
    mapping(string => DataProvider) public dataProviders;
    
    // Network parameters (can be updated via governance)
    uint256 public minStake;
    uint256 public heartbeatInterval;
    uint256 public slashingThreshold;
    uint256 public platformFeePercent;
    
    // Events
    event NodeRegistered(address indexed operator, string endpoint);
    event NodeHeartbeat(address indexed operator, uint256 timestamp);
    event NodeSlashed(address indexed operator, uint256 amount);
    event DataStored(string indexed cid, address[] providers, bytes32 proofHash);
    event DataRetrieved(string indexed cid, address requester);
    event StakeDeposited(address indexed operator, uint256 amount);
    event StakeWithdrawn(address indexed operator, uint256 amount);
    
    /**
     * @dev Constructor
     * @param _joyToken Address of the JOY token contract
     * @param _minStake Minimum stake required for nodes
     * @param _heartbeatInterval Required heartbeat interval in seconds
     * @param _slashingThreshold Threshold for slashing (missed heartbeats)
     * @param _platformFeePercent Platform fee percentage (x 100)
     */
    constructor(
        address _joyToken,
        uint256 _minStake,
        uint256 _heartbeatInterval,
        uint256 _slashingThreshold,
        uint256 _platformFeePercent
    ) {
        joyToken = IERC20(_joyToken);
        minStake = _minStake;
        heartbeatInterval = _heartbeatInterval;
        slashingThreshold = _slashingThreshold;
        platformFeePercent = _platformFeePercent;
    }
    
    /**
     * @dev Register a new RPC node
     * @param endpoint Node's RPC endpoint
     */
    function registerNode(string memory endpoint) external {
        require(nodes[msg.sender].operator == address(0), "Node already registered");
        require(joyToken.transferFrom(msg.sender, address(this), minStake), "Stake transfer failed");
        
        nodes[msg.sender] = Node({
            operator: msg.sender,
            stake: minStake,
            lastHeartbeat: block.timestamp,
            status: NodeStatus.Active,
            endpoint: endpoint,
            totalRequests: 0,
            successfulRequests: 0
        });
        
        emit NodeRegistered(msg.sender, endpoint);
    }
    
    /**
     * @dev Send node heartbeat
     * @param metrics JSON string of node metrics
     */
    function heartbeat(string memory metrics) external {
        require(nodes[msg.sender].status == NodeStatus.Active, "Node not active");
        nodes[msg.sender].lastHeartbeat = block.timestamp;
        emit NodeHeartbeat(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Record data storage on the network
     * @param cid IPFS CID of stored data
     * @param providers Array of node addresses storing the data
     * @param proofHash Hash of storage proof
     */
    function recordDataStorage(
        string memory cid,
        address[] memory providers,
        bytes32 proofHash
    ) external {
        require(nodes[msg.sender].status == NodeStatus.Active, "Node not active");
        
        dataProviders[cid] = DataProvider({
            cid: cid,
            providers: providers,
            timestamp: block.timestamp,
            proofHash: proofHash
        });
        
        emit DataStored(cid, providers, proofHash);
    }
    
    /**
     * @dev Record successful data retrieval
     * @param cid IPFS CID of retrieved data
     */
    function recordDataRetrieval(string memory cid) external {
        require(dataProviders[cid].timestamp > 0, "Data not found");
        emit DataRetrieved(cid, msg.sender);
    }
    
    /**
     * @dev Increase node stake
     */
    function increaseStake(uint256 amount) external nonReentrant {
        require(nodes[msg.sender].status == NodeStatus.Active, "Node not active");
        require(joyToken.transferFrom(msg.sender, address(this), amount), "Stake transfer failed");
        
        nodes[msg.sender].stake += amount;
        emit StakeDeposited(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw stake (with timelock)
     * @param amount Amount to withdraw
     */
    function withdrawStake(uint256 amount) external nonReentrant {
        Node storage node = nodes[msg.sender];
        require(node.status == NodeStatus.Active, "Node not active");
        require(node.stake >= minStake + amount, "Insufficient stake");
        
        node.stake -= amount;
        require(joyToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit StakeWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Slash a node for misbehavior
     * @param nodeAddress Address of node to slash
     * @param amount Amount to slash
     */
    function slashNode(address nodeAddress, uint256 amount) external onlyOwner {
        Node storage node = nodes[nodeAddress];
        require(node.status == NodeStatus.Active, "Node not active");
        require(node.stake >= amount, "Insufficient stake");
        
        node.stake -= amount;
        node.status = NodeStatus.Slashed;
        
        // Transfer slashed amount to treasury
        require(joyToken.transfer(owner(), amount), "Slashing transfer failed");
        
        emit NodeSlashed(nodeAddress, amount);
    }
    
    /**
     * @dev Update network parameters (only through governance)
     */
    function updateParameters(
        uint256 _minStake,
        uint256 _heartbeatInterval,
        uint256 _slashingThreshold,
        uint256 _platformFeePercent
    ) external onlyOwner {
        minStake = _minStake;
        heartbeatInterval = _heartbeatInterval;
        slashingThreshold = _slashingThreshold;
        platformFeePercent = _platformFeePercent;
    }
    
    /**
     * @dev Check if a node is active
     * @param nodeAddress Address of node to check
     */
    function isNodeActive(address nodeAddress) external view returns (bool) {
        return nodes[nodeAddress].status == NodeStatus.Active;
    }
    
    /**
     * @dev Get node information
     * @param nodeAddress Address of node
     */
    function getNodeInfo(address nodeAddress) external view returns (Node memory) {
        return nodes[nodeAddress];
    }
    
    /**
     * @dev Get data provider information
     * @param cid IPFS CID of data
     */
    function getDataProviderInfo(string memory cid) external view returns (DataProvider memory) {
        return dataProviders[cid];
    }
}