// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./JoyToken.sol";

/**
 * @title TokenEconomics
 * @dev Implements token economics and incentivization for the PermaNet platform
 */
contract TokenEconomics is Ownable, ReentrancyGuard {
    JoyToken public joyToken;

    struct StakingTier {
        uint256 minimumStake;
        uint256 rewardMultiplier;
        uint256 lockPeriod;
    }

    struct UserStake {
        uint256 amount;
        uint256 tierId;
        uint256 lockEndTime;
        uint256 lastRewardTime;
    }

    // Staking configuration
    mapping(uint256 => StakingTier) public stakingTiers;
    mapping(address => UserStake) public userStakes;
    
    // Contribution metrics
    mapping(address => uint256) public qualityContributions;
    mapping(address => uint256) public participationScore;
    
    // Platform metrics
    uint256 public totalStaked;
    uint256 public constant REWARD_INTERVAL = 1 days;
    uint256 public constant BASE_REWARD_RATE = 100 * 10**18; // 100 tokens per day
    uint256 public constant QUALITY_MULTIPLIER = 10;
    uint256 public constant MAX_QUALITY_SCORE = 100;

    // Events
    event Staked(address indexed user, uint256 amount, uint256 tierId);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event QualityScoreUpdated(address indexed user, uint256 newScore);
    event ParticipationScoreUpdated(address indexed user, uint256 newScore);

    constructor(address _joyToken) {
        joyToken = JoyToken(_joyToken);
        
        // Initialize staking tiers
        stakingTiers[1] = StakingTier(1000 * 10**18, 110, 30 days);  // 1,000 JOY, 10% bonus, 30 days
        stakingTiers[2] = StakingTier(5000 * 10**18, 125, 90 days);  // 5,000 JOY, 25% bonus, 90 days
        stakingTiers[3] = StakingTier(10000 * 10**18, 150, 180 days); // 10,000 JOY, 50% bonus, 180 days
    }

    /**
     * @dev Stake tokens in a specific tier
     */
    function stake(uint256 amount, uint256 tierId) external nonReentrant {
        require(tierId > 0 && tierId <= 3, "Invalid tier");
        require(amount >= stakingTiers[tierId].minimumStake, "Insufficient stake for tier");
        
        UserStake storage userStake = userStakes[msg.sender];
        require(userStake.amount == 0, "Already staking");

        require(joyToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        userStake.amount = amount;
        userStake.tierId = tierId;
        userStake.lockEndTime = block.timestamp + stakingTiers[tierId].lockPeriod;
        userStake.lastRewardTime = block.timestamp;
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, tierId);
    }

    /**
     * @dev Calculate pending rewards for a user
     */
    function calculatePendingRewards(address user) public view returns (uint256) {
        UserStake storage userStake = userStakes[user];
        if (userStake.amount == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - userStake.lastRewardTime;
        uint256 intervals = timeElapsed / REWARD_INTERVAL;
        
        if (intervals == 0) return 0;
        
        uint256 baseReward = (BASE_REWARD_RATE * intervals * userStake.amount) / (100 * 10**18);
        uint256 tierBonus = (baseReward * (stakingTiers[userStake.tierId].rewardMultiplier - 100)) / 100;
        uint256 qualityBonus = (baseReward * qualityContributions[user] * QUALITY_MULTIPLIER) / MAX_QUALITY_SCORE;
        
        return baseReward + tierBonus + qualityBonus;
    }

    /**
     * @dev Claim staking rewards
     */
    function claimRewards() external nonReentrant {
        uint256 rewards = calculatePendingRewards(msg.sender);
        require(rewards > 0, "No rewards to claim");
        
        UserStake storage userStake = userStakes[msg.sender];
        userStake.lastRewardTime = block.timestamp;
        
        require(joyToken.mintRewards(msg.sender, rewards), "Reward minting failed");
        
        emit RewardClaimed(msg.sender, rewards);
    }

    /**
     * @dev Unstake tokens after lock period
     */
    function unstake() external nonReentrant {
        UserStake storage userStake = userStakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        require(block.timestamp >= userStake.lockEndTime, "Still in lock period");
        
        uint256 amount = userStake.amount;
        totalStaked -= amount;
        
        // Claim any pending rewards before unstaking
        uint256 rewards = calculatePendingRewards(msg.sender);
        if (rewards > 0) {
            require(joyToken.mintRewards(msg.sender, rewards), "Reward minting failed");
            emit RewardClaimed(msg.sender, rewards);
        }
        
        // Clear stake data
        delete userStakes[msg.sender];
        
        require(joyToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Update quality contribution score (only callable by authorized contracts)
     */
    function updateQualityScore(address user, uint256 score) external {
        require(msg.sender == owner() || msg.sender == address(joyToken), "Not authorized");
        require(score <= MAX_QUALITY_SCORE, "Score too high");
        
        qualityContributions[user] = score;
        emit QualityScoreUpdated(user, score);
    }

    /**
     * @dev Update participation score (only callable by authorized contracts)
     */
    function updateParticipationScore(address user, uint256 score) external {
        require(msg.sender == owner() || msg.sender == address(joyToken), "Not authorized");
        
        participationScore[user] = score;
        emit ParticipationScoreUpdated(user, score);
    }

    /**
     * @dev Get user staking information
     */
    function getUserStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 tierId,
        uint256 lockEndTime,
        uint256 pendingRewards
    ) {
        UserStake storage stake = userStakes[user];
        return (
            stake.amount,
            stake.tierId,
            stake.lockEndTime,
            calculatePendingRewards(user)
        );
    }
}