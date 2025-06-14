// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

/**
 * @title JoyTokenV2
 * @dev Implementation of the JoyToken as the primary utility token for JoyNet's multi-chain AI marketplace
 * Supports governance, staking, bridging, and marketplace operations
 */
contract JoyTokenV2 is ERC20, Ownable, Pausable, EIP712 {
    uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant MAX_SUPPLY = 10000000000 * 10**18; // 10 billion tokens
    
    // Bridge-related state
    mapping(address => bool) public authorizedBridges;
    mapping(bytes32 => bool) public processedBridgeTransactions;
    
    // Staking-related state
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;
    uint256 public constant MIN_STAKE_DURATION = 7 days;
    uint256 public constant GOVERNANCE_THRESHOLD = 100000 * 10**18; // 100k tokens
    
    // Marketplace-related state
    address public marketplaceContract;
    address public modelRegistryContract;
    address public governanceContract;
    
    // Events
    event BridgeAuthorized(address indexed bridge);
    event BridgeDeauthorized(address indexed bridge);
    event TokensBridged(address indexed from, bytes32 targetChain, uint256 amount);
    event TokensStaked(address indexed user, uint256 amount);
    event TokensUnstaked(address indexed user, uint256 amount);
    event GovernanceThresholdMet(address indexed user);
    
    constructor() ERC20("JoyToken", "JOY") EIP712("JoyToken", "1") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    // Bridge Management
    
    function authorizeBridge(address bridge) external onlyOwner {
        require(bridge != address(0), "Invalid bridge address");
        authorizedBridges[bridge] = true;
        emit BridgeAuthorized(bridge);
    }
    
    function deauthorizeBridge(address bridge) external onlyOwner {
        authorizedBridges[bridge] = false;
        emit BridgeDeauthorized(bridge);
    }
    
    function bridgeTokens(bytes32 targetChain, uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, targetChain, amount, block.timestamp));
        require(!processedBridgeTransactions[txHash], "Transaction already processed");
        
        processedBridgeTransactions[txHash] = true;
        _burn(msg.sender, amount);
        
        emit TokensBridged(msg.sender, targetChain, amount);
    }
    
    // Staking & Governance
    
    function stake(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        if (stakedBalance[msg.sender] >= GOVERNANCE_THRESHOLD) {
            emit GovernanceThresholdMet(msg.sender);
        }
        
        emit TokensStaked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked balance");
        require(block.timestamp >= stakingTimestamp[msg.sender] + MIN_STAKE_DURATION, "Minimum stake duration not met");
        
        stakedBalance[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        
        emit TokensUnstaked(msg.sender, amount);
    }
    
    function getVotingPower(address account) external view returns (uint256) {
        return stakedBalance[account];
    }
    
    // Marketplace Integration
    
    function setMarketplaceContract(address _marketplace) external onlyOwner {
        require(_marketplace != address(0), "Invalid marketplace address");
        marketplaceContract = _marketplace;
    }
    
    function setModelRegistryContract(address _registry) external onlyOwner {
        require(_registry != address(0), "Invalid registry address");
        modelRegistryContract = _registry;
    }
    
    function setGovernanceContract(address _governance) external onlyOwner {
        require(_governance != address(0), "Invalid governance address");
        governanceContract = _governance;
    }
    
    // Rewards & Minting
    
    function mintRewards(address to, uint256 amount) external {
        require(
            msg.sender == marketplaceContract || msg.sender == governanceContract,
            "Only authorized contracts can mint"
        );
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    function burnFrom(address account, uint256 amount) external {
        require(
            msg.sender == marketplaceContract || msg.sender == governanceContract,
            "Only authorized contracts can burn"
        );
        _burn(account, amount);
    }
    
    // Emergency Controls
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Required overrides
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}