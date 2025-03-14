// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PermaNetDomainRegistry.sol";

/**
 * @title PermaNetDAORegistry
 * @dev Manages TLD DAOs and governance for PermaNet domains
 */
contract PermaNetDAORegistry is Ownable, ReentrancyGuard {
    // Main domain registry contract
    PermaNetDomainRegistry public domainRegistry;
    
    // Governance token
    IERC20 public governanceToken;
    
    // Minimum stake required to create proposals
    uint256 public constant MIN_PROPOSAL_STAKE = 1000 ether;
    
    // Voting period in blocks
    uint256 public constant VOTING_PERIOD = 7 days;
    
    struct TldDAO {
        address treasury;
        uint256 totalStaked;
        mapping(address => uint256) stakes;
        mapping(uint256 => Proposal) proposals;
        uint256 proposalCount;
        mapping(string => bool) allowedDomains;
    }
    
    struct Proposal {
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    // Mapping from TLD to its DAO
    mapping(string => TldDAO) public tldDAOs;
    
    // Events
    event DAOCreated(string tld, address treasury);
    event Staked(string tld, address staker, uint256 amount);
    event Unstaked(string tld, address staker, uint256 amount);
    event ProposalCreated(string tld, uint256 proposalId, string description);
    event Voted(string tld, uint256 proposalId, address voter, bool support);
    event ProposalExecuted(string tld, uint256 proposalId);
    
    constructor(address _domainRegistry, address _governanceToken) {
        domainRegistry = PermaNetDomainRegistry(_domainRegistry);
        governanceToken = IERC20(_governanceToken);
    }
    
    /**
     * @dev Create a new DAO for a TLD
     */
    function createTldDAO(string memory tld, address treasury) external {
        require(domainRegistry.tldOwners(tld) == msg.sender, "Not TLD owner");
        require(treasury != address(0), "Invalid treasury");
        
        TldDAO storage dao = tldDAOs[tld];
        require(dao.treasury == address(0), "DAO already exists");
        
        dao.treasury = treasury;
        emit DAOCreated(tld, treasury);
    }
    
    /**
     * @dev Stake tokens in a TLD DAO
     */
    function stake(string memory tld, uint256 amount) external {
        TldDAO storage dao = tldDAOs[tld];
        require(dao.treasury != address(0), "DAO does not exist");
        
        require(governanceToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        dao.stakes[msg.sender] += amount;
        dao.totalStaked += amount;
        
        emit Staked(tld, msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens from a TLD DAO
     */
    function unstake(string memory tld, uint256 amount) external {
        TldDAO storage dao = tldDAOs[tld];
        require(dao.stakes[msg.sender] >= amount, "Insufficient stake");
        
        dao.stakes[msg.sender] -= amount;
        dao.totalStaked -= amount;
        
        require(governanceToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(tld, msg.sender, amount);
    }
    
    /**
     * @dev Create a new proposal
     */
    function createProposal(string memory tld, string memory description) external {
        TldDAO storage dao = tldDAOs[tld];
        require(dao.stakes[msg.sender] >= MIN_PROPOSAL_STAKE, "Insufficient stake");
        
        uint256 proposalId = dao.proposalCount++;
        Proposal storage proposal = dao.proposals[proposalId];
        
        proposal.proposer = msg.sender;
        proposal.description = description;
        proposal.startTime = block.timestamp;
        
        emit ProposalCreated(tld, proposalId, description);
    }
    
    /**
     * @dev Vote on a proposal
     */
    function vote(string memory tld, uint256 proposalId, bool support) external {
        TldDAO storage dao = tldDAOs[tld];
        Proposal storage proposal = dao.proposals[proposalId];
        
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(block.timestamp <= proposal.startTime + VOTING_PERIOD, "Voting ended");
        
        uint256 votes = dao.stakes[msg.sender];
        require(votes > 0, "No voting power");
        
        if (support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }
        
        proposal.hasVoted[msg.sender] = true;
        emit Voted(tld, proposalId, msg.sender, support);
    }
    
    /**
     * @dev Execute a passed proposal
     */
    function executeProposal(string memory tld, uint256 proposalId) external {
        TldDAO storage dao = tldDAOs[tld];
        Proposal storage proposal = dao.proposals[proposalId];
        
        require(!proposal.executed, "Already executed");
        require(block.timestamp > proposal.startTime + VOTING_PERIOD, "Voting ongoing");
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed");
        
        proposal.executed = true;
        emit ProposalExecuted(tld, proposalId);
    }
    
    /**
     * @dev Get proposal information
     */
    function getProposal(string memory tld, uint256 proposalId) external view returns (
        address proposer,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 startTime,
        bool executed
    ) {
        TldDAO storage dao = tldDAOs[tld];
        Proposal storage proposal = dao.proposals[proposalId];
        
        return (
            proposal.proposer,
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.startTime,
            proposal.executed
        );
    }
}