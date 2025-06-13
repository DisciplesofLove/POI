// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/governance/Governor.sol";

/**
 * @title EthicalAIRegistry
 * @dev Manages Love/Vice scoring and ethical AI enforcement
 */
contract EthicalAIRegistry is AccessControl {
    bytes32 public constant ETHICS_REVIEWER_ROLE = keccak256("ETHICS_REVIEWER_ROLE");
    bytes32 public constant DAO_ROLE = keccak256("DAO_ROLE");

    struct EthicsScore {
        uint256 loveScore;      // 0-100 score for positive impact
        uint256 viceScore;      // 0-100 score for potential harm
        bool isApproved;        // Whether model meets ethical standards
        string reviewNotes;     // IPFS hash of detailed review
        uint256 lastReviewDate; // Timestamp of last review
        address reviewer;       // Address of last reviewer
    }

    // Mapping of model ID to ethics score
    mapping(bytes32 => EthicsScore) public ethicsScores;
    
    // Minimum love score required for approval
    uint256 public minLoveScore = 60;
    
    // Maximum vice score allowed for approval
    uint256 public maxViceScore = 40;

    event EthicsScoreUpdated(
        bytes32 indexed modelId,
        uint256 loveScore,
        uint256 viceScore,
        bool isApproved,
        string reviewNotes
    );

    event ThresholdsUpdated(
        uint256 newMinLoveScore,
        uint256 newMaxViceScore
    );

    constructor(address daoAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(DAO_ROLE, daoAddress);
    }

    modifier onlyEthicsReviewer() {
        require(
            hasRole(ETHICS_REVIEWER_ROLE, msg.sender) || 
            hasRole(DAO_ROLE, msg.sender),
            "Caller is not an ethics reviewer or DAO"
        );
        _;
    }

    modifier onlyDAO() {
        require(
            hasRole(DAO_ROLE, msg.sender),
            "Caller is not the DAO"
        );
        _;
    }

    function updateEthicsScore(
        bytes32 modelId,
        uint256 loveScore,
        uint256 viceScore,
        string memory reviewNotes
    ) external onlyEthicsReviewer {
        require(loveScore <= 100, "Love score must be <= 100");
        require(viceScore <= 100, "Vice score must be <= 100");

        bool isApproved = (loveScore >= minLoveScore && viceScore <= maxViceScore);

        ethicsScores[modelId] = EthicsScore({
            loveScore: loveScore,
            viceScore: viceScore,
            isApproved: isApproved,
            reviewNotes: reviewNotes,
            lastReviewDate: block.timestamp,
            reviewer: msg.sender
        });

        emit EthicsScoreUpdated(
            modelId,
            loveScore,
            viceScore,
            isApproved,
            reviewNotes
        );
    }

    function updateThresholds(
        uint256 newMinLoveScore,
        uint256 newMaxViceScore
    ) external onlyDAO {
        require(newMinLoveScore <= 100, "Min love score must be <= 100");
        require(newMaxViceScore <= 100, "Max vice score must be <= 100");
        
        minLoveScore = newMinLoveScore;
        maxViceScore = newMaxViceScore;

        emit ThresholdsUpdated(newMinLoveScore, newMaxViceScore);
    }

    function getEthicsScore(bytes32 modelId) external view returns (
        uint256 loveScore,
        uint256 viceScore,
        bool isApproved,
        string memory reviewNotes,
        uint256 lastReviewDate,
        address reviewer
    ) {
        EthicsScore storage score = ethicsScores[modelId];
        return (
            score.loveScore,
            score.viceScore,
            score.isApproved,
            score.reviewNotes,
            score.lastReviewDate,
            score.reviewer
        );
    }

    function isModelApproved(bytes32 modelId) external view returns (bool) {
        return ethicsScores[modelId].isApproved;
    }

    function addEthicsReviewer(address reviewer) external onlyDAO {
        grantRole(ETHICS_REVIEWER_ROLE, reviewer);
    }

    function removeEthicsReviewer(address reviewer) external onlyDAO {
        revokeRole(ETHICS_REVIEWER_ROLE, reviewer);
    }
}