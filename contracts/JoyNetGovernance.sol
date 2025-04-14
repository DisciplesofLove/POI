// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title JoyNetGovernance
 * @dev Governance system for JoyNet ecosystem
 */
contract JoyNetGovernance is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    // Action types
    bytes32 public constant UPDATE_PLATFORM_FEE = keccak256("UPDATE_PLATFORM_FEE");
    bytes32 public constant UPDATE_RPC_LOGIC = keccak256("UPDATE_RPC_LOGIC");
    bytes32 public constant UPDATE_TREASURY_ALLOCATION = keccak256("UPDATE_TREASURY_ALLOCATION");
    bytes32 public constant APPROVE_TLD = keccak256("APPROVE_TLD");
    
    // Required support levels for different actions
    mapping(bytes32 => uint256) public requiredSupport;
    
    // Treasury allocation
    struct TreasuryAllocation {
        uint256 nodeRewards;
        uint256 stakingRewards;
        uint256 development;
        uint256 community;
    }
    
    TreasuryAllocation public treasuryAllocation;
    
    // Platform parameters
    uint256 public platformFeePercent;
    address public rpcLogic;
    
    // Events
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event RpcLogicUpdated(address oldLogic, address newLogic);
    event TreasuryAllocationUpdated(TreasuryAllocation allocation);
    event TldApproved(string tld, address dao);
    
    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold,
        uint256 _quorumNumerator
    )
        Governor("JoyNetGovernance")
        GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumNumerator)
        GovernorTimelockControl(_timelock)
    {
        // Set required support levels
        requiredSupport[UPDATE_PLATFORM_FEE] = 75; // 75%
        requiredSupport[UPDATE_RPC_LOGIC] = 80; // 80%
        requiredSupport[UPDATE_TREASURY_ALLOCATION] = 70; // 70%
        requiredSupport[APPROVE_TLD] = 60; // 60%
        
        // Set initial treasury allocation
        treasuryAllocation = TreasuryAllocation({
            nodeRewards: 40,
            stakingRewards: 30,
            development: 20,
            community: 10
        });
        
        // Set initial platform parameters
        platformFeePercent = 250; // 2.5%
    }
    
    function updatePlatformFee(uint256 newFee) external onlyGovernance {
        require(newFee <= 1000, "Fee cannot exceed 10%"); // Max 10% with 0.1% precision
        uint256 oldFee = platformFeePercent;
        platformFeePercent = newFee;
        emit PlatformFeeUpdated(oldFee, newFee);
    }
    
    function updateRpcLogic(address newLogic) external onlyGovernance {
        require(newLogic != address(0), "Invalid address");
        address oldLogic = rpcLogic;
        rpcLogic = newLogic;
        emit RpcLogicUpdated(oldLogic, newLogic);
    }
    
    function updateTreasuryAllocation(TreasuryAllocation memory newAllocation) external onlyGovernance {
        require(
            newAllocation.nodeRewards + newAllocation.stakingRewards +
            newAllocation.development + newAllocation.community == 100,
            "Invalid allocation"
        );
        treasuryAllocation = newAllocation;
        emit TreasuryAllocationUpdated(newAllocation);
    }
    
    function approveTld(string memory tld, address daoAddress) external onlyGovernance {
        require(daoAddress != address(0), "Invalid DAO address");
        emit TldApproved(tld, daoAddress);
    }
    
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }
    
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }
    
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }
    
    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function quorumReached(uint256 proposalId)
        public
        view
        override
        returns (bool)
    {
        (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes) = proposalVotes(proposalId);
        uint256 totalVotes = againstVotes + forVotes + abstainVotes;
        
        if (totalVotes == 0) {
            return false;
        }
        
        // Get proposal details to determine required support
        bytes32 actionType = _getProposalActionType(proposalId);
        uint256 support = (forVotes * 100) / totalVotes;
        
        return support >= requiredSupport[actionType];
    }
    
    function _getProposalActionType(uint256 proposalId) internal view returns (bytes32) {
        // Implementation would determine action type from proposal data
        // This is a placeholder
        return UPDATE_PLATFORM_FEE;
    }
    
    modifier onlyGovernance() {
        require(
            msg.sender == address(this),
            "Only governance can call this function"
        );
        _;
    }
}