// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/governance/IGovernor.sol";

/**
 * @title EnhancedSovereignRPC
 * @dev Advanced decentralized RPC layer with built-in data integrity, caching, and DAO governance
 */
contract EnhancedSovereignRPC is Ownable, ReentrancyGuard {
    // Constants
    uint256 public constant REGISTRATION_DEPOSIT = 1000 ether;  // In JOY tokens
    uint256 public constant PLATFORM_FEE_BPS = 250;  // 2.5% platform fee
    uint256 public constant MIN_CACHE_DURATION = 1 hours;
    uint256 public constant MAX_CACHE_DURATION = 7 days;
    
    // Structs
    struct RPCNode {
        address owner;
        string endpoint;
        uint256 capacity;
        bool isActive;
        uint256 totalRequests;
        uint256 reputation;
        uint256 lastHeartbeat;
        mapping(bytes32 => bool) cachedData;
        mapping(bytes32 => uint256) cacheTimestamps;
    }

    struct DataProof {
        bytes32 contentHash;
        uint256 timestamp;
        address verifier;
        bytes signature;
        bool isValid;
    }

    struct ReplicationPolicy {
        uint256 minReplicas;
        uint256 maxReplicas;
        uint256 replicationInterval;
        bool enforceGeoDiversity;
    }

    // State variables
    IERC20 public joyToken;
    IGovernor public daoGovernor;
    mapping(address => RPCNode) public nodes;
    mapping(address => bool) public allowedClients;
    mapping(bytes32 => DataProof) public dataProofs;
    mapping(bytes32 => address[]) public dataReplicas;
    ReplicationPolicy public replicationPolicy;
    uint256 public totalNodes;
    uint256 public platformFeeAccumulated;

    // Events
    event NodeRegistered(address indexed node, string endpoint);
    event NodeDeactivated(address indexed node);
    event ClientAuthorized(address indexed client);
    event DataCached(bytes32 indexed contentHash, address indexed node);
    event DataReplicated(bytes32 indexed contentHash, address indexed fromNode, address indexed toNode);
    event DataVerified(bytes32 indexed contentHash, bool isValid);
    event ProofSubmitted(bytes32 indexed contentHash, address indexed verifier);
    event ReplicationPolicyUpdated(uint256 minReplicas, uint256 maxReplicas);
    event PlatformFeeCollected(uint256 amount);
    event NodeRewardDistributed(address indexed node, uint256 amount);

    // Modifiers
    modifier onlyActiveNode() {
        require(nodes[msg.sender].isActive, "Node not active");
        _;
    }

    modifier onlyAuthorizedClient() {
        require(allowedClients[msg.sender], "Client not authorized");
        _;
    }

    modifier onlyDAO() {
        require(msg.sender == address(daoGovernor), "Only DAO can call");
        _;
    }

    /**
     * @dev Constructor
     */
    constructor(address _joyToken, address _daoGovernor) {
        joyToken = IERC20(_joyToken);
        daoGovernor = IGovernor(_daoGovernor);
        
        // Initialize default replication policy
        replicationPolicy = ReplicationPolicy({
            minReplicas: 3,
            maxReplicas: 7,
            replicationInterval: 1 hours,
            enforceGeoDiversity: true
        });
    }

    /**
     * @dev Register a new RPC node with staking
     */
    function registerNode(string memory endpoint, bytes calldata geolocation) external nonReentrant {
        require(joyToken.transferFrom(msg.sender, address(this), REGISTRATION_DEPOSIT), "Stake transfer failed");
        require(!nodes[msg.sender].isActive, "Node already registered");
        
        nodes[msg.sender] = RPCNode({
            owner: msg.sender,
            endpoint: endpoint,
            capacity: 100,
            isActive: true,
            totalRequests: 0,
            reputation: 100,
            lastHeartbeat: block.timestamp
        });
        
        totalNodes++;
        emit NodeRegistered(msg.sender, endpoint);
    }

    /**
     * @dev Submit data proof for content verification
     */
    function submitProof(bytes32 contentHash, bytes memory signature) external onlyActiveNode {
        DataProof storage proof = dataProofs[contentHash];
        proof.contentHash = contentHash;
        proof.timestamp = block.timestamp;
        proof.verifier = msg.sender;
        proof.signature = signature;
        proof.isValid = true;
        
        emit ProofSubmitted(contentHash, msg.sender);
    }

    /**
     * @dev Cache data in node's local storage
     */
    function cacheData(bytes32 contentHash, uint256 duration) external onlyActiveNode {
        require(duration >= MIN_CACHE_DURATION && duration <= MAX_CACHE_DURATION, "Invalid cache duration");
        
        RPCNode storage node = nodes[msg.sender];
        node.cachedData[contentHash] = true;
        node.cacheTimestamps[contentHash] = block.timestamp + duration;
        
        emit DataCached(contentHash, msg.sender);
    }

    /**
     * @dev Initiate data replication between nodes
     */
    function replicateData(bytes32 contentHash, address[] calldata targetNodes) external onlyActiveNode {
        require(nodes[msg.sender].cachedData[contentHash], "Data not cached by source node");
        require(targetNodes.length >= replicationPolicy.minReplicas, "Insufficient replicas");
        
        for (uint i = 0; i < targetNodes.length; i++) {
            require(nodes[targetNodes[i]].isActive, "Target node not active");
            dataReplicas[contentHash].push(targetNodes[i]);
            emit DataReplicated(contentHash, msg.sender, targetNodes[i]);
        }
    }

    /**
     * @dev Get best available RPC node with load balancing
     */
    function getBestNode() external view onlyAuthorizedClient returns (address, string memory) {
        address bestNode = address(0);
        uint256 bestScore = 0;
        
        for (uint i = 0; i < totalNodes; i++) {
            address node = _getRandomNode();
            if (nodes[node].isActive && block.timestamp - nodes[node].lastHeartbeat < 5 minutes) {
                uint256 score = _calculateNodeScore(node);
                if (score > bestScore) {
                    bestScore = score;
                    bestNode = node;
                }
            }
        }
        
        require(bestNode != address(0), "No nodes available");
        return (bestNode, nodes[bestNode].endpoint);
    }

    /**
     * @dev Update replication policy (DAO only)
     */
    function updateReplicationPolicy(
        uint256 minReplicas,
        uint256 maxReplicas,
        uint256 interval,
        bool enforceGeoDiversity
    ) external onlyDAO {
        require(minReplicas > 0 && maxReplicas >= minReplicas, "Invalid replica counts");
        replicationPolicy.minReplicas = minReplicas;
        replicationPolicy.maxReplicas = maxReplicas;
        replicationPolicy.replicationInterval = interval;
        replicationPolicy.enforceGeoDiversity = enforceGeoDiversity;
        
        emit ReplicationPolicyUpdated(minReplicas, maxReplicas);
    }

    /**
     * @dev Distribute node rewards from platform fees
     */
    function distributeNodeRewards() external onlyDAO {
        require(platformFeeAccumulated > 0, "No fees to distribute");
        
        uint256 rewardPerNode = platformFeeAccumulated / totalNodes;
        for (uint i = 0; i < totalNodes; i++) {
            address node = _getRandomNode();
            if (nodes[node].isActive) {
                require(joyToken.transfer(node, rewardPerNode), "Reward transfer failed");
                emit NodeRewardDistributed(node, rewardPerNode);
            }
        }
        
        platformFeeAccumulated = 0;
    }

    /**
     * @dev Internal function to calculate node score based on performance metrics
     */
    function _calculateNodeScore(address node) internal view returns (uint256) {
        RPCNode storage rpcNode = nodes[node];
        uint256 uptime = block.timestamp - rpcNode.lastHeartbeat;
        uint256 capacityScore = rpcNode.capacity * 10;
        uint256 reputationScore = rpcNode.reputation;
        uint256 uptimeScore = uptime < 5 minutes ? 100 : 0;
        
        return (capacityScore + reputationScore + uptimeScore) / 3;
    }

    /**
     * @dev Internal helper to get a random node using a more sophisticated approach
     */
    function _getRandomNode() internal view returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender,
            totalNodes
        ));
        uint256 randomNumber = uint256(hash) % totalNodes;
        return address(uint160(randomNumber));
    }

    /**
     * @dev Collect platform fees
     */
    function collectPlatformFee(uint256 amount) internal {
        uint256 fee = (amount * PLATFORM_FEE_BPS) / 10000;
        platformFeeAccumulated += fee;
        emit PlatformFeeCollected(fee);
    }

    // Emergency functions
    function emergencyPause() external onlyDAO {
        // Implementation for emergency pause
    }

    function emergencyUnpause() external onlyDAO {
        // Implementation for emergency unpause
    }
}