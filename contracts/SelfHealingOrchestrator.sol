// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SelfHealingOrchestrator
 * @dev Self-healing orchestration engine for multi-agent flows
 */
contract SelfHealingOrchestrator is Ownable, ReentrancyGuard {
    
    struct AgentFlow {
        bytes32 flowId;
        address[] agents;
        uint256[] dependencies; // agent index dependencies
        FlowStatus status;
        uint256 startTime;
        uint256 lastHeartbeat;
        uint256 failureCount;
        bool autoHeal;
    }
    
    struct Agent {
        address agentAddress;
        AgentStatus status;
        uint256 lastResponse;
        uint256 failureCount;
        address[] backupAgents;
    }
    
    enum FlowStatus { PENDING, RUNNING, PAUSED, COMPLETED, FAILED, HEALING }
    enum AgentStatus { ACTIVE, INACTIVE, FAILED, HEALING }
    
    mapping(bytes32 => AgentFlow) public flows;
    mapping(address => Agent) public agents;
    mapping(bytes32 => mapping(uint256 => bool)) public stepCompleted;
    
    bytes32[] public activeFlows;
    
    uint256 public constant HEARTBEAT_TIMEOUT = 300; // 5 minutes
    uint256 public constant MAX_FAILURES = 3;
    uint256 public constant HEALING_DELAY = 60; // 1 minute
    
    event FlowCreated(bytes32 indexed flowId, address[] agents);
    event FlowStarted(bytes32 indexed flowId);
    event FlowCompleted(bytes32 indexed flowId);
    event FlowFailed(bytes32 indexed flowId, string reason);
    event HealingTriggered(bytes32 indexed flowId, address failedAgent);
    event AgentReplaced(bytes32 indexed flowId, address oldAgent, address newAgent);
    event HeartbeatReceived(address indexed agent, uint256 timestamp);
    
    function createFlow(
        bytes32 flowId,
        address[] memory agentAddresses,
        uint256[] memory dependencies,
        bool autoHeal
    ) external onlyOwner {
        require(agentAddresses.length > 0, "No agents specified");
        require(dependencies.length == agentAddresses.length, "Dependencies mismatch");
        
        flows[flowId] = AgentFlow({
            flowId: flowId,
            agents: agentAddresses,
            dependencies: dependencies,
            status: FlowStatus.PENDING,
            startTime: 0,
            lastHeartbeat: 0,
            failureCount: 0,
            autoHeal: autoHeal
        });
        
        activeFlows.push(flowId);
        emit FlowCreated(flowId, agentAddresses);
    }
    
    function startFlow(bytes32 flowId) external onlyOwner {
        AgentFlow storage flow = flows[flowId];
        require(flow.status == FlowStatus.PENDING, "Flow not in pending state");
        
        flow.status = FlowStatus.RUNNING;
        flow.startTime = block.timestamp;
        flow.lastHeartbeat = block.timestamp;
        
        emit FlowStarted(flowId);
    }
    
    function reportHeartbeat(bytes32 flowId) external {
        AgentFlow storage flow = flows[flowId];
        require(flow.status == FlowStatus.RUNNING, "Flow not running");
        
        // Verify sender is part of the flow
        bool isValidAgent = false;
        for (uint i = 0; i < flow.agents.length; i++) {
            if (flow.agents[i] == msg.sender) {
                isValidAgent = true;
                break;
            }
        }
        require(isValidAgent, "Not a flow agent");
        
        flow.lastHeartbeat = block.timestamp;
        agents[msg.sender].lastResponse = block.timestamp;
        agents[msg.sender].status = AgentStatus.ACTIVE;
        
        emit HeartbeatReceived(msg.sender, block.timestamp);
    }
    
    function reportStepCompleted(bytes32 flowId, uint256 stepIndex) external {
        AgentFlow storage flow = flows[flowId];
        require(flow.status == FlowStatus.RUNNING, "Flow not running");
        require(stepIndex < flow.agents.length, "Invalid step index");
        require(flow.agents[stepIndex] == msg.sender, "Not authorized for this step");
        
        stepCompleted[flowId][stepIndex] = true;
        
        // Check if all steps are completed
        bool allCompleted = true;
        for (uint i = 0; i < flow.agents.length; i++) {
            if (!stepCompleted[flowId][i]) {
                allCompleted = false;
                break;
            }
        }
        
        if (allCompleted) {
            flow.status = FlowStatus.COMPLETED;
            emit FlowCompleted(flowId);
        }
    }
    
    function checkFlowHealth(bytes32 flowId) external {
        AgentFlow storage flow = flows[flowId];
        if (flow.status != FlowStatus.RUNNING) return;
        
        bool needsHealing = false;
        address failedAgent = address(0);
        
        // Check for timeout
        if (block.timestamp - flow.lastHeartbeat > HEARTBEAT_TIMEOUT) {
            needsHealing = true;
        }
        
        // Check individual agents
        for (uint i = 0; i < flow.agents.length; i++) {
            address agentAddr = flow.agents[i];
            Agent storage agent = agents[agentAddr];
            
            if (block.timestamp - agent.lastResponse > HEARTBEAT_TIMEOUT) {
                agent.status = AgentStatus.FAILED;
                agent.failureCount++;
                needsHealing = true;
                failedAgent = agentAddr;
                break;
            }
        }
        
        if (needsHealing && flow.autoHeal) {
            _triggerHealing(flowId, failedAgent);
        } else if (needsHealing) {
            flow.status = FlowStatus.FAILED;
            emit FlowFailed(flowId, "Agent timeout");
        }
    }
    
    function _triggerHealing(bytes32 flowId, address failedAgent) internal {
        AgentFlow storage flow = flows[flowId];
        flow.status = FlowStatus.HEALING;
        
        emit HealingTriggered(flowId, failedAgent);
        
        // Find replacement agent
        address replacement = _findReplacementAgent(failedAgent);
        if (replacement != address(0)) {
            _replaceAgent(flowId, failedAgent, replacement);
        } else {
            flow.failureCount++;
            if (flow.failureCount >= MAX_FAILURES) {
                flow.status = FlowStatus.FAILED;
                emit FlowFailed(flowId, "Max failures reached");
            } else {
                // Retry after delay
                flow.status = FlowStatus.RUNNING;
            }
        }
    }
    
    function _findReplacementAgent(address failedAgent) internal view returns (address) {
        Agent memory agent = agents[failedAgent];
        
        // Try backup agents first
        for (uint i = 0; i < agent.backupAgents.length; i++) {
            address backup = agent.backupAgents[i];
            if (agents[backup].status == AgentStatus.ACTIVE) {
                return backup;
            }
        }
        
        return address(0);
    }
    
    function _replaceAgent(bytes32 flowId, address oldAgent, address newAgent) internal {
        AgentFlow storage flow = flows[flowId];
        
        // Replace in agents array
        for (uint i = 0; i < flow.agents.length; i++) {
            if (flow.agents[i] == oldAgent) {
                flow.agents[i] = newAgent;
                break;
            }
        }
        
        // Reset flow status
        flow.status = FlowStatus.RUNNING;
        flow.lastHeartbeat = block.timestamp;
        
        // Update agent status
        agents[newAgent].status = AgentStatus.ACTIVE;
        agents[newAgent].lastResponse = block.timestamp;
        
        emit AgentReplaced(flowId, oldAgent, newAgent);
    }
    
    function addBackupAgent(address primaryAgent, address backupAgent) external onlyOwner {
        agents[primaryAgent].backupAgents.push(backupAgent);
    }
    
    function pauseFlow(bytes32 flowId) external onlyOwner {
        AgentFlow storage flow = flows[flowId];
        require(flow.status == FlowStatus.RUNNING, "Flow not running");
        flow.status = FlowStatus.PAUSED;
    }
    
    function resumeFlow(bytes32 flowId) external onlyOwner {
        AgentFlow storage flow = flows[flowId];
        require(flow.status == FlowStatus.PAUSED, "Flow not paused");
        flow.status = FlowStatus.RUNNING;
        flow.lastHeartbeat = block.timestamp;
    }
    
    function getFlowStatus(bytes32 flowId) external view returns (
        FlowStatus status,
        uint256 completedSteps,
        uint256 totalSteps,
        uint256 failureCount
    ) {
        AgentFlow storage flow = flows[flowId];
        
        uint256 completed = 0;
        for (uint i = 0; i < flow.agents.length; i++) {
            if (stepCompleted[flowId][i]) {
                completed++;
            }
        }
        
        return (flow.status, completed, flow.agents.length, flow.failureCount);
    }
}