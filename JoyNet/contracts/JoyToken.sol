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
 * @dev Implementation of the JoyToken with governance capabilities and fee distribution
 */
contract JoyToken is ERC20, ERC20Burnable, Pausable, AccessControl, ERC20Permit, ERC20Votes {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");

    // Fee distribution
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant NODE_REWARDS_SHARE = 40; // 40% of fees go to node operators
    uint256 public constant STAKING_REWARDS_SHARE = 30; // 30% of fees go to stakers
    uint256 public constant COMMUNITY_SHARE = 30; // 30% of fees go to community treasury

    // Staking
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 lastRewardsClaim;
    }

    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    uint256 public minStakeAmount;
    uint256 public stakingRewardsPool;
    uint256 public nodeRewardsPool;
    uint256 public communityTreasuryPool;

    // Events
    event StakeDeposited(address indexed user, uint256 amount);
    event StakeWithdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event FeeCollected(uint256 amount, uint256 nodeShare, uint256 stakingShare, uint256 communityShare);
    event NodeRewardDistributed(address indexed node, uint256 amount);
    event StakingRewardDistributed(address indexed staker, uint256 amount);
    event CommunityFundDistributed(address indexed recipient, uint256 amount);

    /**
     * @dev Constructor
     */
    constructor()
        ERC20("JoyToken", "JOY")
        ERC20Permit("JoyToken")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(FEE_MANAGER_ROLE, msg.sender);

        minStakeAmount = 1000 * 10**decimals(); // 1000 JOY minimum stake
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
     * @dev Mint new tokens
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Stake tokens
     */
    function stake(uint256 amount) external whenNotPaused {
        require(amount >= minStakeAmount, "Below minimum stake amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _transfer(msg.sender, address(this), amount);

        Stake storage userStake = stakes[msg.sender];
        userStake.amount += amount;
        userStake.timestamp = block.timestamp;
        if (userStake.lastRewardsClaim == 0) {
            userStake.lastRewardsClaim = block.timestamp;
        }

        totalStaked += amount;
        emit StakeDeposited(msg.sender, amount);
    }

    /**
     * @dev Withdraw staked tokens
     */
    function unstake(uint256 amount) external {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient stake");
        require(block.timestamp >= userStake.timestamp + 7 days, "Stake still locked");

        // Claim any pending rewards first
        _claimRewards(msg.sender);

        userStake.amount -= amount;
        totalStaked -= amount;
        _transfer(address(this), msg.sender, amount);

        emit StakeWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external {
        _claimRewards(msg.sender);
    }

    /**
     * @dev Internal function to calculate and distribute rewards
     */
    function _claimRewards(address staker) internal {
        Stake storage userStake = stakes[staker];
        require(userStake.amount > 0, "No stake found");

        uint256 timeElapsed = block.timestamp - userStake.lastRewardsClaim;
        require(timeElapsed >= 1 days, "Too soon to claim");

        uint256 rewardShare = (userStake.amount * 1e18) / totalStaked;
        uint256 rewards = (stakingRewardsPool * rewardShare) / 1e18;
        require(rewards > 0, "No rewards to claim");

        userStake.lastRewardsClaim = block.timestamp;
        stakingRewardsPool -= rewards;
        _transfer(address(this), staker, rewards);

        emit RewardsClaimed(staker, rewards);
    }

    /**
     * @dev Collect platform fees and distribute to pools
     */
    function collectFees(uint256 amount) external onlyRole(FEE_MANAGER_ROLE) {
        require(amount > 0, "Invalid fee amount");

        uint256 nodeShare = (amount * NODE_REWARDS_SHARE) / 100;
        uint256 stakingShare = (amount * STAKING_REWARDS_SHARE) / 100;
        uint256 communityShare = (amount * COMMUNITY_SHARE) / 100;

        nodeRewardsPool += nodeShare;
        stakingRewardsPool += stakingShare;
        communityTreasuryPool += communityShare;

        emit FeeCollected(amount, nodeShare, stakingShare, communityShare);
    }

    /**
     * @dev Distribute node rewards
     */
    function distributeNodeRewards(address node, uint256 amount) external onlyRole(FEE_MANAGER_ROLE) {
        require(amount <= nodeRewardsPool, "Insufficient rewards pool");
        nodeRewardsPool -= amount;
        _transfer(address(this), node, amount);
        emit NodeRewardDistributed(node, amount);
    }

    /**
     * @dev Distribute community funds
     */
    function distributeCommunityFunds(address recipient, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(amount <= communityTreasuryPool, "Insufficient community pool");
        communityTreasuryPool -= amount;
        _transfer(address(this), recipient, amount);
        emit CommunityFundDistributed(recipient, amount);
    }

    /**
     * @dev Update minimum stake amount
     */
    function setMinStakeAmount(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minStakeAmount = amount;
    }

    /**
     * @dev Get staking info for an account
     */
    function getStakeInfo(address account) external view returns (
        uint256 amount,
        uint256 stakingTime,
        uint256 lastClaim
    ) {
        Stake storage userStake = stakes[account];
        return (
            userStake.amount,
            userStake.timestamp,
            userStake.lastRewardsClaim
        );
    }

    /**
     * @dev Get pool balances
     */
    function getPoolBalances() external view returns (
        uint256 nodePool,
        uint256 stakingPool,
        uint256 communityPool
    ) {
        return (
            nodeRewardsPool,
            stakingRewardsPool,
            communityTreasuryPool
        );
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