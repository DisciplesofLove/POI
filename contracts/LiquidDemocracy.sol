// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./LoveViceScore.sol";

/**
 * @title LiquidDemocracy
 * @dev Cross-chain ready liquid democracy governance module
 */
contract LiquidDemocracy is Ownable, ReentrancyGuard {
    LoveViceScore public scoreContract;
    
    struct Proposal {
        bytes32 id;
        string description;
        address proposer;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) voteWeight;
    }
    
    struct Delegation {
        address delegate;
        uint256 weight;
        bool isActive;
    }
    
    mapping(bytes32 => Proposal) public proposals;
    mapping(address => Delegation) public delegations;
    mapping(address => address[]) public delegators; // who delegated to this address
    mapping(address => uint256) public votingPower;
    
    bytes32[] public activeProposals;
    
    event ProposalCreated(bytes32 indexed proposalId, address proposer);
    event VoteCast(bytes32 indexed proposalId, address voter, bool support, uint256 weight);
    event DelegationSet(address indexed delegator, address indexed delegate, uint256 weight);
    event DelegationRevoked(address indexed delegator, address indexed delegate);
    
    constructor(address _scoreContract) {
        scoreContract = LoveViceScore(_scoreContract);
    }
    
    function createProposal(
        bytes32 proposalId,
        string memory description,
        uint256 votingPeriod
    ) external nonReentrant {
        require(scoreContract.getReputationScore(msg.sender) >= 100, "Insufficient reputation");
        
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.description = description;
        proposal.proposer = msg.sender;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + votingPeriod;
        
        activeProposals.push(proposalId);
        emit ProposalCreated(proposalId, msg.sender);
    }
    
    function delegateVote(address delegate, uint256 weight) external nonReentrant {
        require(delegate != msg.sender, "Cannot delegate to self");
        require(weight > 0, "Weight must be positive");
        
        // Revoke existing delegation
        if (delegations[msg.sender].isActive) {
            _revokeDelegation(msg.sender);
        }
        
        delegations[msg.sender] = Delegation({
            delegate: delegate,
            weight: weight,
            isActive: true
        });
        
        delegators[delegate].push(msg.sender);
        _updateVotingPower(delegate);
        
        emit DelegationSet(msg.sender, delegate, weight);
    }
    
    function revokeDelegation() external nonReentrant {
        require(delegations[msg.sender].isActive, "No active delegation");
        _revokeDelegation(msg.sender);
    }
    
    function _revokeDelegation(address delegator) internal {
        Delegation storage delegation = delegations[delegator];
        address delegate = delegation.delegate;
        
        delegation.isActive = false;
        
        // Remove from delegators array
        address[] storage dels = delegators[delegate];
        for (uint i = 0; i < dels.length; i++) {
            if (dels[i] == delegator) {
                dels[i] = dels[dels.length - 1];
                dels.pop();
                break;
            }
        }
        
        _updateVotingPower(delegate);
        emit DelegationRevoked(delegator, delegate);
    }
    
    function _updateVotingPower(address user) internal {
        uint256 power = scoreContract.getReputationScore(user);
        
        // Add delegated power
        address[] memory dels = delegators[user];
        for (uint i = 0; i < dels.length; i++) {
            if (delegations[dels[i]].isActive) {
                power += delegations[dels[i]].weight;
            }
        }
        
        votingPower[user] = power;
    }
    
    function vote(bytes32 proposalId, bool support) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        _updateVotingPower(msg.sender);
        uint256 weight = votingPower[msg.sender];
        require(weight > 0, "No voting power");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voteWeight[msg.sender] = weight;
        
        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }
        
        emit VoteCast(proposalId, msg.sender, support, weight);
    }
    
    function executeProposal(bytes32 proposalId) external nonReentrant {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting still active");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal rejected");
        
        proposal.executed = true;
        
        // Execute proposal logic here
        _executeProposalLogic(proposalId);
    }
    
    function _executeProposalLogic(bytes32 proposalId) internal {
        // Implementation depends on proposal type
        // This is a placeholder for actual execution logic
    }
    
    function getProposalStatus(bytes32 proposalId) external view returns (
        uint256 forVotes,
        uint256 againstVotes,
        bool isActive,
        bool executed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.forVotes,
            proposal.againstVotes,
            block.timestamp <= proposal.endTime,
            proposal.executed
        );
    }
    
    function getDelegationInfo(address user) external view returns (
        address delegate,
        uint256 weight,
        bool isActive
    ) {
        Delegation memory delegation = delegations[user];
        return (delegation.delegate, delegation.weight, delegation.isActive);
    }
}