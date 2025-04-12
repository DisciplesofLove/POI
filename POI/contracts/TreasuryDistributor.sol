// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./JoyToken.sol";

/**
 * @title TreasuryDistributor
 * @dev Manages the distribution of the 2.5% platform fee across different ecosystem pools
 */
contract TreasuryDistributor is Ownable, ReentrancyGuard {
    JoyToken public joyToken;

    // Distribution percentages (must total 100)
    uint256 public constant JOYNET_TREASURY_SHARE = 30;    // 30% to main treasury
    uint256 public constant TLD_TREASURY_SHARE = 30;       // 30% to TLD DAOs
    uint256 public constant STAKING_REWARDS_SHARE = 20;    // 20% to staking rewards
    uint256 public constant COMPUTE_INCENTIVES_SHARE = 10; // 10% to compute/validator rewards
    uint256 public constant COMMUNITY_GRANTS_SHARE = 10;   // 10% to community grants

    // Pool addresses
    address public joynetTreasury;
    address public stakingPool;
    address public computePool;
    address public communityGrantsPool;
    
    // TLD DAO treasury mapping
    mapping(string => address) public tldTreasuries;
    
    // TLD revenue tracking for proportional distribution
    mapping(string => uint256) public tldRevenue;
    uint256 public totalTldRevenue;
    
    // Events
    event FeeDistributed(
        uint256 totalAmount,
        uint256 joynetTreasuryAmount,
        uint256 tldAmount,
        uint256 stakingAmount,
        uint256 computeAmount,
        uint256 grantsAmount
    );
    
    event TldTreasuryRegistered(string tld, address treasury);
    event TldRevenueRecorded(string tld, uint256 amount);
    
    constructor(
        address _joyToken,
        address _joynetTreasury,
        address _stakingPool,
        address _computePool,
        address _communityGrantsPool
    ) {
        joyToken = JoyToken(_joyToken);
        joynetTreasury = _joynetTreasury;
        stakingPool = _stakingPool;
        computePool = _computePool;
        communityGrantsPool = _communityGrantsPool;
    }
    
    /**
     * @dev Register a TLD treasury address
     */
    function registerTldTreasury(string memory tld, address treasury) external onlyOwner {
        require(treasury != address(0), "Invalid treasury address");
        tldTreasuries[tld] = treasury;
        emit TldTreasuryRegistered(tld, treasury);
    }
    
    /**
     * @dev Record revenue from a specific TLD for proportional distribution
     */
    function recordTldRevenue(string memory tld, uint256 amount) external {
        require(msg.sender == owner() || msg.sender == address(joyToken), "Not authorized");
        tldRevenue[tld] += amount;
        totalTldRevenue += amount;
        emit TldRevenueRecorded(tld, amount);
    }
    
    /**
     * @dev Distribute platform fees across ecosystem pools
     */
    function distributeFees(uint256 amount) external nonReentrant {
        require(msg.sender == owner() || msg.sender == address(joyToken), "Not authorized");
        require(amount > 0, "No fees to distribute");
        
        // Calculate shares
        uint256 joynetTreasuryAmount = (amount * JOYNET_TREASURY_SHARE) / 100;
        uint256 tldAmount = (amount * TLD_TREASURY_SHARE) / 100;
        uint256 stakingAmount = (amount * STAKING_REWARDS_SHARE) / 100;
        uint256 computeAmount = (amount * COMPUTE_INCENTIVES_SHARE) / 100;
        uint256 grantsAmount = (amount * COMMUNITY_GRANTS_SHARE) / 100;
        
        // Transfer to JoyNet Treasury
        require(joyToken.transfer(joynetTreasury, joynetTreasuryAmount), "JoyNet treasury transfer failed");
        
        // Transfer to Staking Pool
        require(joyToken.transfer(stakingPool, stakingAmount), "Staking pool transfer failed");
        
        // Transfer to Compute Pool
        require(joyToken.transfer(computePool, computeAmount), "Compute pool transfer failed");
        
        // Transfer to Community Grants Pool
        require(joyToken.transfer(communityGrantsPool, grantsAmount), "Grants pool transfer failed");
        
        // Distribute TLD share proportionally based on revenue
        distributeTldShare(tldAmount);
        
        emit FeeDistributed(
            amount,
            joynetTreasuryAmount,
            tldAmount,
            stakingAmount,
            computeAmount,
            grantsAmount
        );
    }
    
    /**
     * @dev Distribute TLD treasury share proportionally based on revenue
     */
    function distributeTldShare(uint256 totalTldAmount) internal {
        if (totalTldRevenue == 0) {
            // If no TLD revenue recorded, send to JoyNet treasury
            require(joyToken.transfer(joynetTreasury, totalTldAmount), "TLD fallback transfer failed");
            return;
        }
        
        // Distribute to each TLD treasury proportionally
        for (string memory tld : getActiveTlds()) {
            if (tldRevenue[tld] > 0 && tldTreasuries[tld] != address(0)) {
                uint256 tldShare = (totalTldAmount * tldRevenue[tld]) / totalTldRevenue;
                require(joyToken.transfer(tldTreasuries[tld], tldShare), "TLD treasury transfer failed");
            }
        }
    }
    
    /**
     * @dev Get list of active TLDs (those with revenue)
     */
    function getActiveTlds() internal view returns (string[] memory) {
        // Implementation would track and return active TLDs
        // For now returning empty array as placeholder
        string[] memory activeTlds;
        return activeTlds;
    }
    
    /**
     * @dev Update pool addresses
     */
    function updatePoolAddresses(
        address _joynetTreasury,
        address _stakingPool,
        address _computePool,
        address _communityGrantsPool
    ) external onlyOwner {
        require(_joynetTreasury != address(0), "Invalid JoyNet treasury");
        require(_stakingPool != address(0), "Invalid staking pool");
        require(_computePool != address(0), "Invalid compute pool");
        require(_communityGrantsPool != address(0), "Invalid grants pool");
        
        joynetTreasury = _joynetTreasury;
        stakingPool = _stakingPool;
        computePool = _computePool;
        communityGrantsPool = _communityGrantsPool;
    }
}