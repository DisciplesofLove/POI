// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @title JoyToken
 * @dev Implementation of the JoyToken with governance and economic features
 */
contract JoyToken is ERC20, ERC20Burnable, Pausable, AccessControl, ERC20Permit, ERC20Votes {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ECONOMICS_ROLE = keccak256("ECONOMICS_ROLE");
    
    uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant MAX_SUPPLY = 10000000000 * 10**18;   // 10 billion tokens
    
    // Distribution pools
    uint256 public communityPool;    // 50% of initial supply
    uint256 public developmentPool;  // 20% of initial supply
    uint256 public ecosystemPool;    // 20% of initial supply
    uint256 public treasuryPool;     // 10% of initial supply
    
    // Emission control
    uint256 public lastEmissionTime;
    uint256 public constant EMISSION_RATE = 2;  // 2% annual emission
    uint256 public constant EMISSION_INTERVAL = 365 days;
    
    // Events
    event PoolsInitialized(
        uint256 community,
        uint256 development,
        uint256 ecosystem,
        uint256 treasury
    );
    event EmissionExecuted(uint256 amount);
    event PoolUpdated(string poolName, uint256 newBalance);
    
    constructor()
        ERC20("JoyToken", "JOY")
        ERC20Permit("JoyToken")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(ECONOMICS_ROLE, msg.sender);
        
        // Initialize distribution pools
        communityPool = (INITIAL_SUPPLY * 50) / 100;    // 50%
        developmentPool = (INITIAL_SUPPLY * 20) / 100;  // 20%
        ecosystemPool = (INITIAL_SUPPLY * 20) / 100;    // 20%
        treasuryPool = (INITIAL_SUPPLY * 10) / 100;     // 10%
        
        // Mint initial supply
        _mint(address(this), INITIAL_SUPPLY);
        
        lastEmissionTime = block.timestamp;
        
        emit PoolsInitialized(
            communityPool,
            developmentPool,
            ecosystemPool,
            treasuryPool
        );
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Mint new tokens for rewards
     * Only callable by authorized contracts
     */
    function mintRewards(address to, uint256 amount) public onlyRole(MINTER_ROLE) returns (bool) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        return true;
    }
    
    /**
     * @dev Execute token emission based on schedule
     */
    function executeEmission() external onlyRole(ECONOMICS_ROLE) {
        require(
            block.timestamp >= lastEmissionTime + EMISSION_INTERVAL,
            "Too early for emission"
        );
        
        uint256 currentSupply = totalSupply();
        uint256 emissionAmount = (currentSupply * EMISSION_RATE) / 100;
        require(currentSupply + emissionAmount <= MAX_SUPPLY, "Exceeds max supply");
        
        // Mint new tokens to contract
        _mint(address(this), emissionAmount);
        
        // Distribute to pools
        communityPool += (emissionAmount * 50) / 100;
        developmentPool += (emissionAmount * 20) / 100;
        ecosystemPool += (emissionAmount * 20) / 100;
        treasuryPool += (emissionAmount * 10) / 100;
        
        lastEmissionTime = block.timestamp;
        
        emit EmissionExecuted(emissionAmount);
        updatePoolBalances();
    }
    
    /**
     * @dev Distribute tokens from community pool
     */
    function distributeCommunityRewards(address to, uint256 amount) external onlyRole(ECONOMICS_ROLE) {
        require(amount <= communityPool, "Exceeds community pool");
        communityPool -= amount;
        _transfer(address(this), to, amount);
        emit PoolUpdated("community", communityPool);
    }
    
    /**
     * @dev Distribute tokens from development pool
     */
    function distributeDevelopmentFunds(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= developmentPool, "Exceeds development pool");
        developmentPool -= amount;
        _transfer(address(this), to, amount);
        emit PoolUpdated("development", developmentPool);
    }
    
    /**
     * @dev Distribute tokens from ecosystem pool
     */
    function distributeEcosystemFunds(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= ecosystemPool, "Exceeds ecosystem pool");
        ecosystemPool -= amount;
        _transfer(address(this), to, amount);
        emit PoolUpdated("ecosystem", ecosystemPool);
    }
    
    /**
     * @dev Distribute tokens from treasury pool
     */
    function distributeTreasuryFunds(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= treasuryPool, "Exceeds treasury pool");
        treasuryPool -= amount;
        _transfer(address(this), to, amount);
        emit PoolUpdated("treasury", treasuryPool);
    }
    
    /**
     * @dev Update pool balances event emission
     */
    function updatePoolBalances() public {
        emit PoolUpdated("community", communityPool);
        emit PoolUpdated("development", developmentPool);
        emit PoolUpdated("ecosystem", ecosystemPool);
        emit PoolUpdated("treasury", treasuryPool);
    }
    
    // The following functions are overrides required by Solidity
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }
    
    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }
    
    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}