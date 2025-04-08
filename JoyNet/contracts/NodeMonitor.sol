// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract NodeMonitor is Ownable {
    struct NodeHealth {
        uint256 lastPing;
        uint256 responseTime;
        uint256 uptime;
        uint256 failureCount;
        bool isHealthy;
    }

    mapping(address => NodeHealth) public nodeHealth;
    uint256 public constant HEALTH_THRESHOLD = 95;
    uint256 public constant MAX_RESPONSE_TIME = 1000; // milliseconds
    uint256 public constant PING_INTERVAL = 5 minutes;

    event NodeHealthUpdated(address indexed node, bool isHealthy, uint256 responseTime);
    event NodeFailureRecorded(address indexed node, uint256 failureCount);

    function updateNodeHealth(address node, uint256 responseTime) external {
        require(msg.sender == owner() || msg.sender == node, "Unauthorized");
        
        NodeHealth storage health = nodeHealth[node];
        health.lastPing = block.timestamp;
        health.responseTime = responseTime;
        
        if (responseTime <= MAX_RESPONSE_TIME) {
            health.uptime++;
        } else {
            health.failureCount++;
        }
        
        health.isHealthy = _calculateHealthScore(node) >= HEALTH_THRESHOLD;
        
        emit NodeHealthUpdated(node, health.isHealthy, responseTime);
        
        if (!health.isHealthy) {
            emit NodeFailureRecorded(node, health.failureCount);
        }
    }

    function _calculateHealthScore(address node) internal view returns (uint256) {
        NodeHealth storage health = nodeHealth[node];
        if (block.timestamp - health.lastPing > PING_INTERVAL) {
            return 0;
        }
        
        uint256 totalChecks = health.uptime + health.failureCount;
        if (totalChecks == 0) return 0;
        
        return (health.uptime * 100) / totalChecks;
    }

    function getNodeHealth(address node) external view returns (bool isHealthy, uint256 score) {
        uint256 healthScore = _calculateHealthScore(node);
        return (healthScore >= HEALTH_THRESHOLD, healthScore);
    }
}