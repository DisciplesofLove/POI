// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ModelMarketplace.sol";

/**
 * @title MarketplaceGovernance
 * @dev DAO governance for marketplace policies and royalties
 */
contract MarketplaceGovernance is Ownable, ReentrancyGuard {
    IERC20 public joyToken;
    ModelMarketplace public marketplace;
    
    // Governance parameters
    uint256 public minStakeForProposal;
    uint256 public votingPeriod;
    uint256 public executionDelay;
    
    // Policy parameters
    uint256 public platformFee;
    uint256 public minRoyaltyRate;
    uint256 public maxRoyaltyRate;
    
    struct Proposal {
        address proposer;
        string description;
        bytes callData;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        bool executed;
        bool canceled;
        mapping(address => uint256) votes;
    }
    
    // Staking info
    mapping(address => uint256) public stakes;
    uint256 public totalStaked;
    
    // Proposals
    Proposal[] public proposals;
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address proposer, string description);
    event Voted(uint256 indexed proposalId, address voter, uint256 votes, bool support);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event PolicyUpdated(string policyName, uint256 newValue);
    
    constructor(
        address _joyToken,
        address _marketplace,
        uint256 _minStakeForProposal,
        uint256 _votingPeriod,
        uint256 _executionDelay
    ) {
        joyToken = IERC20(_joyToken);
        marketplace = ModelMarketplace(_marketplace);
        minStakeForProposal = _minStakeForProposal;
        votingPeriod = _votingPeriod;
        executionDelay = _executionDelay;
        
        // Set initial policy values
        platformFee = 250; // 2.5%
        minRoyaltyRate = 100; // 1%
        maxRoyaltyRate = 2000; // 20%
    }
    
    /**
     * @dev Stake tokens for governance participation
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(joyToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        stakes[msg.sender] += amount;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external nonReentrant {
        require(stakes[msg.sender] >= amount, "Insufficient stake");
        
        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        require(joyToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev Create a new governance proposal
     */
    function propose(
        string memory description,
        bytes memory callData
    ) external returns (uint256) {
        require(stakes[msg.sender] >= minStakeForProposal, "Insufficient stake");
        
        uint256 proposalId = proposals.length;
        Proposal storage newProposal = proposals.push();
        
        newProposal.proposer = msg.sender;
        newProposal.description = description;
        newProposal.callData = callData;
        newProposal.startTime = block.timestamp;
        
        emit ProposalCreated(proposalId, msg.sender, description);
        return proposalId;
    }
    
    /**
     * @dev Cast vote on a proposal
     */
    function vote(uint256 proposalId, bool support) external {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp <= proposal.startTime + votingPeriod, "Voting ended");
        require(!proposal.executed && !proposal.canceled, "Proposal not active");
        require(proposal.votes[msg.sender] == 0, "Already voted");
        
        uint256 votes = stakes[msg.sender];
        require(votes > 0, "No voting power");
        
        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }
        
        proposal.votes[msg.sender] = votes;
        emit Voted(proposalId, msg.sender, votes, support);
    }
    
    /**
     * @dev Execute a passed proposal
     */
    function executeProposal(uint256 proposalId) external {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        
        require(!proposal.executed && !proposal.canceled, "Proposal not active");
        require(block.timestamp > proposal.startTime + votingPeriod, "Voting ongoing");
        require(block.timestamp <= proposal.startTime + votingPeriod + executionDelay, "Execution window passed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed");
        
        proposal.executed = true;
        
        // Execute the proposal
        (bool success,) = address(this).call(proposal.callData);
        require(success, "Proposal execution failed");
        
        emit ProposalExecuted(proposalId);
    }
    
    /**
     * @dev Cancel a proposal
     */
    function cancelProposal(uint256 proposalId) external {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        
        require(msg.sender == proposal.proposer || msg.sender == owner(), "Not authorized");
        require(!proposal.executed && !proposal.canceled, "Proposal not active");
        
        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }
    
    /**
     * @dev Update platform fee (can only be called through governance)
     */
    function updatePlatformFee(uint256 newFee) external {
        require(msg.sender == address(this), "Only through governance");
        require(newFee <= 1000, "Fee too high"); // Max 10%
        
        platformFee = newFee;
        emit PolicyUpdated("platformFee", newFee);
    }
    
    /**
     * @dev Update royalty rate bounds (can only be called through governance)
     */
    function updateRoyaltyBounds(uint256 newMin, uint256 newMax) external {
        require(msg.sender == address(this), "Only through governance");
        require(newMin <= newMax && newMax <= 5000, "Invalid bounds"); // Max 50%
        
        minRoyaltyRate = newMin;
        maxRoyaltyRate = newMax;
        emit PolicyUpdated("minRoyaltyRate", newMin);
        emit PolicyUpdated("maxRoyaltyRate", newMax);
    }
}