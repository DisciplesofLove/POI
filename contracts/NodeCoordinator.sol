// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ProofOfInference.sol";
import "./ProofOfUse.sol";

/**
 * @title NodeCoordinator
 * @dev Coordinates edge computing nodes for decentralized AI inference
 */
contract NodeCoordinator is Ownable {
    // Contracts
    IERC20 public joyToken;
    ProofOfInference public poiContract;
    ProofOfUse public pouContract;
    
    // Node information
    struct ComputeNode {
        string ip;
        uint256 computeCapacity; // FLOPS or similar metric
        uint256 stakingAmount;
        uint256 reputation;
        bool isActive;
        uint256 lastHeartbeat;
    }
    
    // Task information
    struct ComputeTask {
        bytes32 modelId;
        address requester;
        uint256 created;
        address[] assignedNodes;
        bool isComplete;
        bytes32 executionId;
    }
    
    // Staking parameters
    uint256 public minStakeAmount;
    uint256 public heartbeatInterval;
    
    // Mappings
    mapping(address => ComputeNode) public nodes;
    mapping(bytes32 => ComputeTask) public tasks;
    mapping(bytes32 => uint256) public modelLoadBalance; // Model ID to number of nodes
    
    // Events
    event NodeRegistered(address indexed node, uint256 capacity);
    event NodeDeactivated(address indexed node);
    event TaskAssigned(bytes32 indexed taskId, address[] nodes);
    event TaskCompleted(bytes32 indexed taskId, bytes32 executionId);
    
    constructor(
        address _joyToken,
        address _poiContract,
        address _pouContract,
        uint256 _minStake,
        uint256 _heartbeatInterval
    ) {
        joyToken = IERC20(_joyToken);
        poiContract = ProofOfInference(_poiContract);
        pouContract = ProofOfUse(_pouContract);
        minStakeAmount = _minStake;
        heartbeatInterval = _heartbeatInterval;
    }
    
    /**
     * @dev Register as a compute node
     */
    function registerNode(
        string memory ip,
        uint256 computeCapacity,
        uint256 stakeAmount
    ) external {
        require(stakeAmount >= minStakeAmount, "Insufficient stake");
        require(!nodes[msg.sender].isActive, "Already registered");
        
        // Transfer stake
        require(joyToken.transferFrom(msg.sender, address(this), stakeAmount), "Stake transfer failed");
        
        // Register node
        nodes[msg.sender] = ComputeNode({
            ip: ip,
            computeCapacity: computeCapacity,
            stakingAmount: stakeAmount,
            reputation: 0,
            isActive: true,
            lastHeartbeat: block.timestamp
        });
        
        emit NodeRegistered(msg.sender, computeCapacity);
    }
    
    /**
     * @dev Send heartbeat to maintain active status
     */
    function sendHeartbeat() external {
        require(nodes[msg.sender].isActive, "Node not active");
        nodes[msg.sender].lastHeartbeat = block.timestamp;
    }
    
    /**
     * @dev Create a new compute task
     */
    function createTask(bytes32 modelId) external returns (bytes32) {
        bytes32 taskId = keccak256(abi.encodePacked(
            modelId,
            msg.sender,
            block.timestamp
        ));
        
        // Select nodes based on capacity and model distribution
        address[] memory selectedNodes = selectNodes(modelId, 3); // Select 3 nodes
        
        tasks[taskId] = ComputeTask({
            modelId: modelId,
            requester: msg.sender,
            created: block.timestamp,
            assignedNodes: selectedNodes,
            isComplete: false,
            executionId: bytes32(0)
        });
        
        // Update model load balance
        modelLoadBalance[modelId] += selectedNodes.length;
        
        emit TaskAssigned(taskId, selectedNodes);
        return taskId;
    }
    
    /**
     * @dev Complete a compute task with execution results
     */
    function completeTask(bytes32 taskId, bytes32 executionId) external {
        ComputeTask storage task = tasks[taskId];
        require(!task.isComplete, "Task already completed");
        
        bool isAssigned = false;
        for (uint i = 0; i < task.assignedNodes.length; i++) {
            if (task.assignedNodes[i] == msg.sender) {
                isAssigned = true;
                break;
            }
        }
        require(isAssigned, "Not assigned to this task");
        
        task.isComplete = true;
        task.executionId = executionId;
        modelLoadBalance[task.modelId] -= task.assignedNodes.length;
        
        // Increase node reputation
        nodes[msg.sender].reputation++;
        
        emit TaskCompleted(taskId, executionId);
    }
    
    /**
     * @dev Select nodes for task execution based on capacity and distribution
     */
    function selectNodes(bytes32 modelId, uint256 count) internal view returns (address[] memory) {
        uint256 totalNodes = 0;
        for (address node = address(1); node != address(0); node = address(uint160(node) + 1)) {
            if (nodes[node].isActive && 
                block.timestamp - nodes[node].lastHeartbeat <= heartbeatInterval) {
                totalNodes++;
            }
        }
        
        address[] memory selectedNodes = new address[](count);
        uint256 selected = 0;
        uint256 offset = uint256(keccak256(abi.encodePacked(block.timestamp))) % totalNodes;
        
        // Select nodes with lowest model load and high capacity
        for (address node = address(1); node != address(0) && selected < count; node = address(uint160(node) + 1)) {
            ComputeNode memory computeNode = nodes[node];
            if (computeNode.isActive && 
                block.timestamp - computeNode.lastHeartbeat <= heartbeatInterval &&
                computeNode.computeCapacity > 0) {
                selectedNodes[selected] = node;
                selected++;
            }
        }
        
        return selectedNodes;
    }
    
    /**
     * @dev Deactivate a node (voluntary or slashing)
     */
    function deactivateNode(address node) external {
        require(msg.sender == node || msg.sender == owner(), "Not authorized");
        require(nodes[node].isActive, "Node not active");
        
        nodes[node].isActive = false;
        
        // Return stake if voluntary exit
        if (msg.sender == node) {
            require(joyToken.transfer(node, nodes[node].stakingAmount), "Stake return failed");
        }
        
        emit NodeDeactivated(node);
    }
}