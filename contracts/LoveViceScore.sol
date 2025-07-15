// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title LoveViceScore
 * @dev Manages Love and Vice scores for reputation-based governance
 */
contract LoveViceScore is Ownable, ReentrancyGuard {
    struct UserScore {
        uint256 loveScore;
        uint256 viceScore;
        uint256 lastUpdate;
        bool isActive;
    }
    
    mapping(address => UserScore) public userScores;
    mapping(address => bool) public authorizedScorers;
    
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant DECAY_RATE = 1; // Score decay per day
    
    event ScoreUpdated(address indexed user, uint256 loveScore, uint256 viceScore);
    event ScorerAuthorized(address indexed scorer);
    event ScorerRevoked(address indexed scorer);
    
    modifier onlyAuthorizedScorer() {
        require(authorizedScorers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    function authorizeScorer(address scorer) external onlyOwner {
        authorizedScorers[scorer] = true;
        emit ScorerAuthorized(scorer);
    }
    
    function revokeScorer(address scorer) external onlyOwner {
        authorizedScorers[scorer] = false;
        emit ScorerRevoked(scorer);
    }
    
    function updateScore(
        address user,
        int256 loveDelta,
        int256 viceDelta
    ) external onlyAuthorizedScorer nonReentrant {
        UserScore storage score = userScores[user];
        
        // Apply decay if needed
        _applyDecay(user);
        
        // Update scores with bounds checking
        if (loveDelta > 0) {
            score.loveScore = _min(score.loveScore + uint256(loveDelta), MAX_SCORE);
        } else if (loveDelta < 0) {
            uint256 decrease = uint256(-loveDelta);
            score.loveScore = score.loveScore > decrease ? score.loveScore - decrease : 0;
        }
        
        if (viceDelta > 0) {
            score.viceScore = _min(score.viceScore + uint256(viceDelta), MAX_SCORE);
        } else if (viceDelta < 0) {
            uint256 decrease = uint256(-viceDelta);
            score.viceScore = score.viceScore > decrease ? score.viceScore - decrease : 0;
        }
        
        score.lastUpdate = block.timestamp;
        score.isActive = true;
        
        emit ScoreUpdated(user, score.loveScore, score.viceScore);
    }
    
    function getReputationScore(address user) external view returns (uint256) {
        UserScore memory score = userScores[user];
        if (!score.isActive) return 0;
        
        // Calculate net reputation (love - vice)
        if (score.loveScore >= score.viceScore) {
            return score.loveScore - score.viceScore;
        }
        return 0;
    }
    
    function _applyDecay(address user) internal {
        UserScore storage score = userScores[user];
        if (!score.isActive) return;
        
        uint256 daysPassed = (block.timestamp - score.lastUpdate) / 1 days;
        if (daysPassed > 0) {
            uint256 decay = daysPassed * DECAY_RATE;
            score.loveScore = score.loveScore > decay ? score.loveScore - decay : 0;
            score.viceScore = score.viceScore > decay ? score.viceScore - decay : 0;
        }
    }
    
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}