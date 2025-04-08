// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SovereignRPC
 * @dev Custom RPC layer for decentralized node management (no Infura dependency)
 */
import "./NodeMonitor.sol";

contract SovereignRPC is Ownable, ReentrancyGuard {
    NodeMonitor public nodeMonitor;
    
    // Rate limiting
    mapping(address => uint256) private lastRequestTime;
    mapping(address => uint256) private requestCount;
    uint256 public constant REQUEST_WINDOW = 1 minutes;
    uint256 public constant MAX_REQUESTS_PER_WINDOW = 1000;
    // RPC node structure
    struct RPCNode {
        address owner;
        string endpoint;
        uint256 capacity;
        bool isActive;
        uint256 totalRequests;
        uint256 reputation;
    }
    
    // Node registration deposit
    uint256 public constant REGISTRATION_DEPOSIT = 1000 ether;  // In JOY tokens
    
    // Mappings
    mapping(address => RPCNode) public nodes;
    mapping(address => bool) public allowedClients;
    
    // Events
    event NodeRegistered(address indexed node, string endpoint);
    event NodeDeactivated(address indexed node);
    event ClientAuthorized(address indexed client);
    event ClientDeauthorized(address indexed client);
    
    /**
     * @dev Register a new RPC node
     */
    function registerNode(string memory endpoint) external payable nonReentrant {
        require(msg.value >= REGISTRATION_DEPOSIT, "Insufficient deposit");
        require(!nodes[msg.sender].isActive, "Node already registered");
        
        nodes[msg.sender] = RPCNode({
            owner: msg.sender,
            endpoint: endpoint,
            capacity: 100,  // Default capacity
            isActive: true,
            totalRequests: 0,
            reputation: 100  // Initial reputation
        });
        
        emit NodeRegistered(msg.sender, endpoint);
    }
    
    /**
     * @dev Deactivate an RPC node
     */
    function deactivateNode() external {
        require(nodes[msg.sender].isActive, "Node not active");
        nodes[msg.sender].isActive = false;
        emit NodeDeactivated(msg.sender);
        
        // Return deposit
        payable(msg.sender).transfer(REGISTRATION_DEPOSIT);
    }
    
    /**
     * @dev Authorize a client to use RPC services
     */
    function authorizeClient(address client) external onlyOwner {
        allowedClients[client] = true;
        emit ClientAuthorized(client);
    }
    
    /**
     * @dev Deauthorize a client
     */
    function deauthorizeClient(address client) external onlyOwner {
        allowedClients[client] = false;
        emit ClientDeauthorized(client);
    }
    
    /**
     * @dev Update node capacity
     */
    function updateCapacity(uint256 newCapacity) external {
        require(nodes[msg.sender].isActive, "Node not active");
        nodes[msg.sender].capacity = newCapacity;
    }
    
    /**
     * @dev Get best available RPC node
     */
    function getBestNode() external returns (address, string memory) {
        require(_checkRateLimit(msg.sender), "Rate limit exceeded");
        
        // Update rate limiting data
        lastRequestTime[msg.sender] = block.timestamp;
        requestCount[msg.sender]++;
        require(allowedClients[msg.sender], "Client not authorized");
        
        address bestNode = address(0);
        uint256 bestScore = 0;
        
        for (uint i = 0; i < 10; i++) {  // Limit iterations for gas efficiency
            address node = _getRandomNode();
            if (nodes[node].isActive) {
                uint256 score = nodes[node].reputation * nodes[node].capacity;
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
     * @dev Internal helper to get a random node
     */
    function _checkRateLimit(address client) internal view returns (bool) {
        if (block.timestamp - lastRequestTime[client] >= REQUEST_WINDOW) {
            return true;
        }
        return requestCount[client] < MAX_REQUESTS_PER_WINDOW;
    }

    function setNodeMonitor(address _nodeMonitor) external onlyOwner {
        nodeMonitor = NodeMonitor(_nodeMonitor);
    }

    function _getRandomNode() internal view returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender
        )))));
    }
}