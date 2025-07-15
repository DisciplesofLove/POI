// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ModelGovernanceDAO.sol";
import "./LoveAndViceScore.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title EthicalModelGovernanceDAO
 * @dev Enhanced governance system that incorporates Love and Vice Scores
 */
contract EthicalModelGovernanceDAO is ModelGovernanceDAO {
    using SafeMath for uint256;

    // Love and Vice Score contract
    LoveAndViceScore public loveAndViceScore;

    // Proposal metadata
    struct ProposalMetadata {
        bool isEthicsSensitive;
        uint256 requiredLoveScore;
        uint256 minEthicalQuorum;
    }

    // Mapping for proposal metadata
    mapping(uint256 => ProposalMetadata) public proposalMetadata;

    // Constants
    uint256 public constant MIN_LOVE_SCORE_FOR_PROPOSAL = 75;  // Minimum score to create proposals
    uint256 public constant BASE_MULTIPLIER = 100;
    uint256 public constant ETHICS_SENSITIVE_QUORUM = 60;      // 60% quorum for ethics-sensitive proposals

    // Events
    event ProposalTagged(uint256 indexed proposalId, bool isEthicsSensitive);
    event EthicalVoteCast(address indexed voter, uint256 indexed proposalId, uint256 weight, uint256 multiplier);

    constructor(
        ERC20Votes _token,
        TimelockController _timelock,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _quorumPercentage,
        address _loveAndViceScore
    )
        ModelGovernanceDAO(
            _token,
            _timelock,
            _votingDelay,
            _votingPeriod,
            _quorumPercentage
        )
    {
        loveAndViceScore = LoveAndViceScore(_loveAndViceScore);
    }

    /**
     * @dev Override propose function to check Love Score requirements
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    )
        public
        override
        returns (uint256)
    {
        // Check if proposer meets minimum Love Score requirement
        require(
            loveAndViceScore.userReputations(msg.sender).averageLoveScore >= MIN_LOVE_SCORE_FOR_PROPOSAL,
            "Insufficient Love Score to create proposal"
        );

        uint256 proposalId = super.propose(targets, values, calldatas, description);

        // Determine if proposal is ethics-sensitive based on description or targets
        bool isEthicsSensitive = isEthicallyRelevant(description);
        
        proposalMetadata[proposalId] = ProposalMetadata({
            isEthicsSensitive: isEthicsSensitive,
            requiredLoveScore: isEthicsSensitive ? 80 : 0,  // Higher threshold for ethical proposals
            minEthicalQuorum: isEthicsSensitive ? ETHICS_SENSITIVE_QUORUM : 0
        });

        emit ProposalTagged(proposalId, isEthicsSensitive);
        return proposalId;
    }

    /**
     * @dev Override castVote to apply Love and Vice Score multipliers
     */
    function castVote(
        uint256 proposalId,
        uint8 support
    ) 
        public
        override
        returns (uint256)
    {
        address voter = msg.sender;
        
        // For ethics-sensitive proposals, check if voter meets minimum Love Score
        if (proposalMetadata[proposalId].isEthicsSensitive) {
            require(
                loveAndViceScore.userReputations(voter).averageLoveScore >= 
                proposalMetadata[proposalId].requiredLoveScore,
                "Insufficient Love Score for ethics-sensitive proposal"
            );
        }

        // Calculate vote weight with ethical multiplier
        uint256 baseVotes = getVotes(voter, proposalSnapshot(proposalId));
        uint256 multiplier = loveAndViceScore.calculateVotingMultiplier(voter);
        uint256 adjustedVotes = baseVotes.mul(multiplier).div(BASE_MULTIPLIER);

        emit EthicalVoteCast(voter, proposalId, adjustedVotes, multiplier);

        return _castVote(
            proposalId,
            voter,
            support,
            adjustedVotes
        );
    }

    /**
     * @dev Override quorum calculation for ethics-sensitive proposals
     */
    function quorum(uint256 blockNumber)
        public
        view
        override
        returns (uint256)
    {
        uint256 baseQuorum = super.quorum(blockNumber);
        
        // Increase quorum for ethics-sensitive proposals
        if (proposalMetadata[state(blockNumber)].isEthicsSensitive) {
            return baseQuorum.mul(ETHICS_SENSITIVE_QUORUM).div(100);
        }
        
        return baseQuorum;
    }

    /**
     * @dev Determine if a proposal is ethically relevant based on its description
     */
    function isEthicallyRelevant(string memory description) 
        internal 
        pure 
        returns (bool) 
    {
        // In a real implementation, this would use more sophisticated analysis
        // For now, we'll use a simple check for keywords
        bytes32 descHash = keccak256(abi.encodePacked(description));
        
        // Check for common ethical keywords in the hash
        // This is a simplified example - real implementation would be more robust
        bytes32[] memory ethicalKeywords = new bytes32[](4);
        ethicalKeywords[0] = keccak256("privacy");
        ethicalKeywords[1] = keccak256("ethical");
        ethicalKeywords[2] = keccak256("safety");
        ethicalKeywords[3] = keccak256("bias");

        for (uint i = 0; i < ethicalKeywords.length; i++) {
            if (descHash == ethicalKeywords[i]) {
                return true;
            }
        }

        return false;
    }

    /**
     * @dev Get the ethical voting power of an account
     * @param account The address to check voting power for
     */
    function getEthicalVotingPower(address account) 
        public 
        view 
        returns (uint256) 
    {
        uint256 baseVotes = getVotes(account, block.number - 1);
        uint256 multiplier = loveAndViceScore.calculateVotingMultiplier(account);
        return baseVotes.mul(multiplier).div(BASE_MULTIPLIER);
    }
}