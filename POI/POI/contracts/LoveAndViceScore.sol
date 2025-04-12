// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title LoveAndViceScore
 * @dev Implements the Love and Vice Score system for JoyNet's ethical AI governance
 */
contract LoveAndViceScore is AccessControl, Pausable {
    using SafeMath for uint256;

    bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    // Struct to store asset ratings and metadata
    struct AssetScore {
        uint256 loveScore;          // Base score from 0-100
        uint256 viceScore;          // Penalty score from 0-100
        uint256 lastUpdateBlock;    // Last update timestamp
        uint256 totalRatings;       // Number of ratings received
        bool isActive;              // Whether the asset is active
    }

    // Struct to store user reputation
    struct UserReputation {
        uint256 averageLoveScore;   // Average love score of user's assets
        uint256 totalAssets;        // Total number of assets
        uint256 votingMultiplier;   // Current voting power multiplier (base 100)
        bool isEthicalCouncil;      // Whether user is part of ethical council
    }

    // Mapping of asset address to its score
    mapping(address => AssetScore) public assetScores;
    
    // Mapping of user address to their reputation
    mapping(address => UserReputation) public userReputations;

    // Constants
    uint256 public constant BASE_MULTIPLIER = 100;
    uint256 public constant MAX_LOVE_BOOST = 115;    // 15% max boost
    uint256 public constant MAX_VICE_PENALTY = 80;   // 20% max penalty
    uint256 public constant SCORE_DECIMALS = 2;
    uint256 public constant MIN_RATINGS_FOR_VALIDITY = 5;

    // Events
    event ScoreUpdated(address indexed asset, uint256 newLoveScore, uint256 newViceScore);
    event UserReputationUpdated(address indexed user, uint256 newMultiplier);
    event EthicalCouncilStatusChanged(address indexed user, bool isCouncil);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(CURATOR_ROLE, msg.sender);
        _setupRole(GOVERNANCE_ROLE, msg.sender);
    }

    /**
     * @dev Submit a new rating for an asset
     * @param asset Address of the AI asset
     * @param loveScore Love score component (0-100)
     * @param viceScore Vice score component (0-100)
     */
    function submitRating(
        address asset,
        uint256 loveScore,
        uint256 viceScore
    ) 
        external
        whenNotPaused
    {
        require(loveScore <= 100, "Love score must be <= 100");
        require(viceScore <= 100, "Vice score must be <= 100");
        
        AssetScore storage score = assetScores[asset];
        require(score.isActive, "Asset not active");

        // Update scores with time decay
        uint256 timeWeight = calculateTimeWeight(score.lastUpdateBlock);
        
        score.loveScore = (score.loveScore.mul(score.totalRatings).add(loveScore)).div(score.totalRatings.add(1));
        score.viceScore = (score.viceScore.mul(score.totalRatings).add(viceScore)).div(score.totalRatings.add(1));
        score.totalRatings = score.totalRatings.add(1);
        score.lastUpdateBlock = block.number;

        // Update owner's reputation
        updateUserReputation(asset);

        emit ScoreUpdated(asset, score.loveScore, score.viceScore);
    }

    /**
     * @dev Register a new AI asset
     * @param asset Address of the AI asset
     */
    function registerAsset(address asset) 
        external
        onlyRole(CURATOR_ROLE) 
    {
        require(!assetScores[asset].isActive, "Asset already registered");
        
        assetScores[asset] = AssetScore({
            loveScore: 50,          // Start with neutral score
            viceScore: 0,           // Start with no vice penalty
            lastUpdateBlock: block.number,
            totalRatings: 0,
            isActive: true
        });
    }

    /**
     * @dev Calculate voting power multiplier for a user
     * @param user Address of the user
     * @return Multiplier to be applied to voting power (base 100)
     */
    function calculateVotingMultiplier(address user) 
        public 
        view 
        returns (uint256) 
    {
        UserReputation storage rep = userReputations[user];
        
        if (rep.totalAssets == 0) {
            return BASE_MULTIPLIER;
        }

        // Start with base multiplier
        uint256 multiplier = BASE_MULTIPLIER;

        // Apply love boost
        if (rep.averageLoveScore > 75) {
            uint256 boost = (rep.averageLoveScore - 75).mul(15).div(25);
            multiplier = multiplier.add(boost);
        }

        // Apply vice penalty
        uint256 avgViceScore = getAverageViceScore(user);
        if (avgViceScore > 25) {
            uint256 penalty = (avgViceScore - 25).mul(20).div(75);
            multiplier = multiplier.sub(penalty);
        }

        // Ensure multiplier stays within bounds
        if (multiplier > MAX_LOVE_BOOST) return MAX_LOVE_BOOST;
        if (multiplier < MAX_VICE_PENALTY) return MAX_VICE_PENALTY;
        
        return multiplier;
    }

    /**
     * @dev Update a user's reputation based on their assets
     * @param asset Address of the updated asset
     */
    function updateUserReputation(address asset) 
        internal 
    {
        // In a real implementation, we would look up the asset owner
        address owner = asset; // Placeholder - replace with actual owner lookup
        
        UserReputation storage rep = userReputations[owner];
        
        // Recalculate average scores
        uint256 totalLove = 0;
        uint256 totalAssets = 0;
        
        // In reality, we would iterate through all assets owned by the user
        AssetScore storage score = assetScores[asset];
        if (score.isActive && score.totalRatings >= MIN_RATINGS_FOR_VALIDITY) {
            totalLove = totalLove.add(score.loveScore);
            totalAssets = totalAssets.add(1);
        }
        
        if (totalAssets > 0) {
            rep.averageLoveScore = totalLove.div(totalAssets);
            rep.totalAssets = totalAssets;
        }
        
        // Update voting multiplier
        rep.votingMultiplier = calculateVotingMultiplier(owner);
        
        emit UserReputationUpdated(owner, rep.votingMultiplier);
    }

    /**
     * @dev Get the average vice score for a user's assets
     * @param user Address of the user
     * @return Average vice score
     */
    function getAverageViceScore(address user) 
        public 
        view 
        returns (uint256) 
    {
        // Placeholder - in reality would calculate across all user's assets
        return 0;
    }

    /**
     * @dev Calculate time-based weight for score updates
     * @param lastUpdateBlock Block number of last update
     * @return Weight factor
     */
    function calculateTimeWeight(uint256 lastUpdateBlock) 
        internal 
        view 
        returns (uint256) 
    {
        if (lastUpdateBlock == 0) return BASE_MULTIPLIER;
        
        uint256 blocksPassed = block.number.sub(lastUpdateBlock);
        // Implement time decay logic here
        return BASE_MULTIPLIER;
    }

    /**
     * @dev Set ethical council status for a user
     * @param user Address of the user
     * @param status New council status
     */
    function setEthicalCouncilStatus(address user, bool status)
        external
        onlyRole(GOVERNANCE_ROLE)
    {
        userReputations[user].isEthicalCouncil = status;
        emit EthicalCouncilStatusChanged(user, status);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}