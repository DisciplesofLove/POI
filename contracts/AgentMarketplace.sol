// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./LoveViceScore.sol";

/**
 * @title AgentMarketplace
 * @dev Marketplace for AI agents with auto-matching engine
 */
contract AgentMarketplace is Ownable, ReentrancyGuard {
    IERC20 public joyToken;
    LoveViceScore public scoreContract;
    
    struct Agent {
        address owner;
        string metadata;
        uint256 pricePerTask;
        string[] capabilities;
        uint256 reputation;
        bool isActive;
        uint256 completedTasks;
    }
    
    struct TaskRequest {
        address requester;
        string requirements;
        uint256 budget;
        uint256 deadline;
        bool isMatched;
        bytes32 matchedAgent;
        TaskStatus status;
    }
    
    enum TaskStatus { PENDING, MATCHED, IN_PROGRESS, COMPLETED, CANCELLED }
    
    mapping(bytes32 => Agent) public agents;
    mapping(bytes32 => TaskRequest) public taskRequests;
    mapping(bytes32 => bytes32[]) public agentCapabilities; // capability => agent[]
    
    bytes32[] public activeAgents;
    bytes32[] public pendingTasks;
    
    event AgentRegistered(bytes32 indexed agentId, address owner);
    event TaskRequested(bytes32 indexed taskId, address requester);
    event TaskMatched(bytes32 indexed taskId, bytes32 indexed agentId);
    event TaskCompleted(bytes32 indexed taskId, bytes32 indexed agentId);
    
    constructor(address _joyToken, address _scoreContract) {
        joyToken = IERC20(_joyToken);
        scoreContract = LoveViceScore(_scoreContract);
    }
    
    function registerAgent(
        bytes32 agentId,
        string memory metadata,
        uint256 pricePerTask,
        string[] memory capabilities
    ) external nonReentrant {
        require(!agents[agentId].isActive, "Agent already registered");
        
        agents[agentId] = Agent({
            owner: msg.sender,
            metadata: metadata,
            pricePerTask: pricePerTask,
            capabilities: capabilities,
            reputation: scoreContract.getReputationScore(msg.sender),
            isActive: true,
            completedTasks: 0
        });
        
        // Index by capabilities
        for (uint i = 0; i < capabilities.length; i++) {
            bytes32 capHash = keccak256(bytes(capabilities[i]));
            agentCapabilities[capHash].push(agentId);
        }
        
        activeAgents.push(agentId);
        emit AgentRegistered(agentId, msg.sender);
    }
    
    function requestTask(
        bytes32 taskId,
        string memory requirements,
        uint256 budget,
        uint256 deadline
    ) external nonReentrant {
        require(joyToken.transferFrom(msg.sender, address(this), budget), "Budget transfer failed");
        
        taskRequests[taskId] = TaskRequest({
            requester: msg.sender,
            requirements: requirements,
            budget: budget,
            deadline: deadline,
            isMatched: false,
            matchedAgent: bytes32(0),
            status: TaskStatus.PENDING
        });
        
        pendingTasks.push(taskId);
        emit TaskRequested(taskId, msg.sender);
        
        // Trigger auto-matching
        _autoMatch(taskId);
    }
    
    function _autoMatch(bytes32 taskId) internal {
        TaskRequest storage task = taskRequests[taskId];
        if (task.isMatched) return;
        
        bytes32 bestAgent = _findBestAgent(task.requirements, task.budget);
        if (bestAgent != bytes32(0)) {
            task.isMatched = true;
            task.matchedAgent = bestAgent;
            task.status = TaskStatus.MATCHED;
            
            emit TaskMatched(taskId, bestAgent);
        }
    }
    
    function _findBestAgent(string memory requirements, uint256 budget) internal view returns (bytes32) {
        bytes32 bestAgent = bytes32(0);
        uint256 bestScore = 0;
        
        for (uint i = 0; i < activeAgents.length; i++) {
            bytes32 agentId = activeAgents[i];
            Agent memory agent = agents[agentId];
            
            if (!agent.isActive || agent.pricePerTask > budget) continue;
            
            uint256 score = _calculateMatchScore(agent, requirements);
            if (score > bestScore) {
                bestScore = score;
                bestAgent = agentId;
            }
        }
        
        return bestAgent;
    }
    
    function _calculateMatchScore(Agent memory agent, string memory requirements) internal pure returns (uint256) {
        // Simplified scoring based on reputation and price competitiveness
        uint256 reputationScore = agent.reputation * 100;
        uint256 experienceScore = agent.completedTasks * 10;
        
        return reputationScore + experienceScore;
    }
    
    function completeTask(bytes32 taskId) external nonReentrant {
        TaskRequest storage task = taskRequests[taskId];
        require(task.isMatched, "Task not matched");
        
        Agent storage agent = agents[task.matchedAgent];
        require(msg.sender == agent.owner, "Not agent owner");
        
        // Transfer payment
        require(joyToken.transfer(agent.owner, task.budget), "Payment failed");
        
        // Update stats
        agent.completedTasks++;
        agent.reputation = scoreContract.getReputationScore(agent.owner);
        task.status = TaskStatus.COMPLETED;
        
        emit TaskCompleted(taskId, task.matchedAgent);
    }
    
    function getAgentsByCapability(string memory capability) external view returns (bytes32[] memory) {
        bytes32 capHash = keccak256(bytes(capability));
        return agentCapabilities[capHash];
    }
}