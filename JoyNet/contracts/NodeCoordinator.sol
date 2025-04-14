// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./EnhancedSovereignRPC.sol";

/**
 * @title NodeCoordinator
 * @dev Manages node coordination, health checks, and auto-scaling for the JoyNet RPC network
 */
contract NodeCoordinator is Ownable, ReentrancyGuard {
    // Constants
    uint256 public constant HEALTH_CHECK_INTERVAL = 5 minutes;
    uint256 public constant MIN_NODES = 5;
    uint256 public constant MAX_NODES = 100;
    uint256 public constant SCALING_THRESHOLD = 80; // 80% capacity threshold for scaling

    // Structs
    struct NodeHealth {
        uint256 lastHealthCheck;
        uint256 successfulChecks;
        uint256 failedChecks;
        uint256 latency;
        uint256 cpuUsage;
        uint256 memoryUsage;
        bool isHealthy;
    }

    struct RegionInfo {
        uint256 activeNodes;
        uint256 targetNodes;
        mapping(address => bool) nodeInRegion;
    }

    // State variables
    EnhancedSovereignRPC public rpcContract;
    IERC20 public joyToken;
    mapping(address => NodeHealth) public nodeHealth;
    mapping(bytes32 => RegionInfo) public regions;
    bytes32[] public activeRegions;
    uint256 public totalHealthyNodes;
    uint256 public lastScalingCheck;

    // Events
    event HealthCheckSubmitted(address indexed node, bool isHealthy);
    event NodeScalingTriggered(bytes32 indexed region, uint256 currentNodes, uint256 targetNodes);
    event RegionAdded(bytes32 indexed region);
    event RegionRemoved(bytes32 indexed region);
    event NodeFailoverInitiated(address indexed failedNode, address indexed replacementNode);

    /**
     * @dev Constructor
     */
    constructor(address _rpcContract, address _joyToken) {
        rpcContract = EnhancedSovereignRPC(_rpcContract);
        joyToken = IERC20(_joyToken);
    }

    /**
     * @dev Submit node health metrics
     */
    function submitHealthCheck(
        uint256 latency,
        uint256 cpuUsage,
        uint256 memoryUsage,
        bytes32 region
    ) external {
        require(regions[region].nodeInRegion[msg.sender], "Node not in region");
        
        NodeHealth storage health = nodeHealth[msg.sender];
        require(block.timestamp - health.lastHealthCheck >= HEALTH_CHECK_INTERVAL, "Too frequent health check");

        // Update health metrics
        health.lastHealthCheck = block.timestamp;
        health.latency = latency;
        health.cpuUsage = cpuUsage;
        health.memoryUsage = memoryUsage;

        // Evaluate health status
        bool isHealthy = _evaluateNodeHealth(latency, cpuUsage, memoryUsage);
        if (isHealthy) {
            health.successfulChecks++;
            if (!health.isHealthy) {
                health.isHealthy = true;
                totalHealthyNodes++;
            }
        } else {
            health.failedChecks++;
            if (health.isHealthy) {
                health.isHealthy = false;
                totalHealthyNodes--;
                _initiateFailover(msg.sender, region);
            }
        }

        emit HealthCheckSubmitted(msg.sender, isHealthy);
    }

    /**
     * @dev Add a new region for geographical distribution
     */
    function addRegion(bytes32 region, uint256 targetNodes) external onlyOwner {
        require(targetNodes >= MIN_NODES, "Target nodes too low");
        require(targetNodes <= MAX_NODES, "Target nodes too high");
        require(regions[region].targetNodes == 0, "Region already exists");

        regions[region].targetNodes = targetNodes;
        activeRegions.push(region);

        emit RegionAdded(region);
    }

    /**
     * @dev Remove a region (with graceful node migration)
     */
    function removeRegion(bytes32 region) external onlyOwner {
        require(regions[region].targetNodes > 0, "Region doesn't exist");
        
        // Migrate nodes to other regions
        _migrateNodesFromRegion(region);

        // Remove region
        for (uint i = 0; i < activeRegions.length; i++) {
            if (activeRegions[i] == region) {
                activeRegions[i] = activeRegions[activeRegions.length - 1];
                activeRegions.pop();
                break;
            }
        }

        delete regions[region];
        emit RegionRemoved(region);
    }

    /**
     * @dev Check if scaling is needed and trigger accordingly
     */
    function checkScaling() external {
        require(block.timestamp - lastScalingCheck >= 1 hours, "Too frequent scaling check");
        lastScalingCheck = block.timestamp;

        for (uint i = 0; i < activeRegions.length; i++) {
            bytes32 region = activeRegions[i];
            RegionInfo storage regionInfo = regions[region];
            
            uint256 utilizationPct = (regionInfo.activeNodes * 100) / regionInfo.targetNodes;
            
            if (utilizationPct >= SCALING_THRESHOLD) {
                uint256 newTargetNodes = regionInfo.targetNodes * 12 / 10; // Increase by 20%
                if (newTargetNodes <= MAX_NODES) {
                    regionInfo.targetNodes = newTargetNodes;
                    emit NodeScalingTriggered(region, regionInfo.activeNodes, newTargetNodes);
                }
            } else if (utilizationPct < 50 && regionInfo.targetNodes > MIN_NODES) {
                uint256 newTargetNodes = regionInfo.targetNodes * 8 / 10; // Decrease by 20%
                if (newTargetNodes >= MIN_NODES) {
                    regionInfo.targetNodes = newTargetNodes;
                    emit NodeScalingTriggered(region, regionInfo.activeNodes, newTargetNodes);
                }
            }
        }
    }

    /**
     * @dev Internal function to evaluate node health
     */
    function _evaluateNodeHealth(
        uint256 latency,
        uint256 cpuUsage,
        uint256 memoryUsage
    ) internal pure returns (bool) {
        return latency < 1000 && // 1 second max latency
               cpuUsage < 80 &&  // 80% max CPU
               memoryUsage < 90; // 90% max memory
    }

    /**
     * @dev Internal function to handle node failover
     */
    function _initiateFailover(address failedNode, bytes32 region) internal {
        // Find best replacement node
        address replacementNode = _findReplacementNode(region);
        if (replacementNode != address(0)) {
            // Update region mapping
            regions[region].nodeInRegion[failedNode] = false;
            regions[region].nodeInRegion[replacementNode] = true;
            regions[region].activeNodes--;

            emit NodeFailoverInitiated(failedNode, replacementNode);
        }
    }

    /**
     * @dev Internal function to find replacement node
     */
    function _findReplacementNode(bytes32 region) internal view returns (address) {
        // Implementation to find best available replacement node
        // This would typically look at the node pool and select based on
        // capacity, location, and health metrics
        return address(0); // Placeholder
    }

    /**
     * @dev Internal function to migrate nodes from a region being removed
     */
    function _migrateNodesFromRegion(bytes32 region) internal {
        // Implementation for node migration
        // This would redistribute nodes to other active regions
    }

    /**
     * @dev Get health status of a specific node
     */
    function getNodeHealth(address node) external view returns (
        uint256 lastCheck,
        uint256 successCount,
        uint256 failCount,
        bool isHealthy
    ) {
        NodeHealth storage health = nodeHealth[node];
        return (
            health.lastHealthCheck,
            health.successfulChecks,
            health.failedChecks,
            health.isHealthy
        );
    }

    /**
     * @dev Get region statistics
     */
    function getRegionStats(bytes32 region) external view returns (
        uint256 activeNodes,
        uint256 targetNodes
    ) {
        RegionInfo storage regionInfo = regions[region];
        return (regionInfo.activeNodes, regionInfo.targetNodes);
    }
}