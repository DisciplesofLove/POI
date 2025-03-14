// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./JoyToken.sol";

/**
 * @title NodeCoordinator
 * @dev Manages compute nodes and task allocation for AI inference
 */
contract NodeCoordinator is Ownable {
    // JoyToken for payments
    JoyToken public joyToken;
    
    // Structure for compute nodes
    struct ComputeNode {
        address owner;
        uint256 capacity;     // Available compute units
        uint256 reputation;   // Node reputation score
        bool isActive;
        uint256 totalTasks;
        uint256 earnings;
    }
    
    // Structure for compute tasks
    struct Task {
        bytes32 modelId;
        address requester;
        uint256 fee;
        bool isComplete;
        address assignedNode;
        bytes32 resultHash;
    }
    
    // Mappings
    mapping(address => ComputeNode) public nodes;
    mapping(bytes32 => Task) public tasks;
    
    // Events
    event NodeRegistered(address indexed node, uint256 capacity);
    event TaskCreated(bytes32 indexed taskId, bytes32 indexed modelId);
    event TaskAssigned(bytes32 indexed taskId, address indexed node);
    event TaskCompleted(bytes32 indexed taskId, bytes32 resultHash);
    
    constructor(address _joyToken) {
        joyToken = JoyToken(_joyToken);
    }
    
    /**
     * @dev Register a new compute node
     */
    function registerNode(uint256 capacity) external {
        require(!nodes[msg.sender].isActive, "Node already registered");
        
        nodes[msg.sender] = ComputeNode({
            owner: msg.sender,
            capacity: capacity,
            reputation: 100,
            isActive: true,
            totalTasks: 0,
            earnings: 0
        });
        
        emit NodeRegistered(msg.sender, capacity);
    }
    
    /**
     * @dev Create a new compute task
     */
    function createTask(
        bytes32 taskId,
        bytes32 modelId,
        uint256 fee
    ) external {
        require(!tasks[taskId].isComplete, "Task ID already exists");
        require(
            joyToken.transferFrom(msg.sender, address(this), fee),
            "Payment failed"
        );
        
        tasks[taskId] = Task({
            modelId: modelId,
            requester: msg.sender,
            fee: fee,
            isComplete: false,
            assignedNode: address(0),
            resultHash: bytes32(0)
        });
        
        emit TaskCreated(taskId, modelId);
        
        // Automatically try to assign the task
        _assignTask(taskId);
    }
    
    /**
     * @dev Internal function to assign a task to a node
     */
    function _assignTask(bytes32 taskId) internal {
        Task storage task = tasks[taskId];
        
        // Find best available node (simplified version)
        address bestNode = address(0);
        uint256 highestScore = 0;
        
        // In production, this would use a more sophisticated selection algorithm
        for (uint i = 0; i < 10; i++) {
            address node = _getRandomNode();
            if (nodes[node].isActive && nodes[node].capacity > 0) {
                uint256 score = nodes[node].reputation * nodes[node].capacity;
                if (score > highestScore) {
                    highestScore = score;
                    bestNode = node;
                }
            }
        }
        
        require(bestNode != address(0), "No available nodes");
        
        task.assignedNode = bestNode;
        nodes[bestNode].capacity--;
        
        emit TaskAssigned(taskId, bestNode);
    }
    
    /**
     * @dev Complete a task and submit results
     */
    function completeTask(bytes32 taskId, bytes32 resultHash) external {
        Task storage task = tasks[taskId];
        require(msg.sender == task.assignedNode, "Not assigned node");
        require(!task.isComplete, "Task already complete");
        
        task.isComplete = true;
        task.resultHash = resultHash;
        
        // Update node stats
        ComputeNode storage node = nodes[msg.sender];
        node.capacity++;
        node.totalTasks++;
        node.earnings += task.fee;
        
        // Transfer payment
        require(
            joyToken.transfer(msg.sender, task.fee),
            "Payment failed"
        );
        
        emit TaskCompleted(taskId, resultHash);
    }
    
    /**
     * @dev Helper function to get a random node (simplified)
     */
    function _getRandomNode() internal view returns (address) {
        // In production, this would use a proper random number generator
        return address(uint160(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender
        )))));
    }
}