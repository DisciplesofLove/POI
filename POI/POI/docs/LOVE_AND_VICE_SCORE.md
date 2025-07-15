# Love and Vice Score System

The Love and Vice Score system is JoyNet's proprietary metric for evaluating the ethical, social, and environmental impact of AI solutions and digital assets on the platform. This document explains the technical implementation and integration with the governance system.

## System Overview

### Core Components

1. **LoveAndViceScore Contract**
   - Tracks and calculates ethical scores for assets and users
   - Manages reputation and voting power multipliers
   - Handles curator and governance roles

2. **EthicalModelGovernanceDAO Contract**
   - Extends standard governance with ethical considerations
   - Integrates Love and Vice Scores into voting power
   - Implements special handling for ethics-sensitive proposals

### Score Calculation

The Love and Vice Score is calculated based on:

1. **Community Ratings**
   - Users can submit ratings (0-100) for both Love and Vice components
   - Ratings are weighted by time decay and rater reputation
   - Minimum number of ratings required for score validity

2. **Analytical Signals**
   - Automated analysis of usage patterns
   - Integration with platform metrics
   - Real-world impact assessment

3. **Governance Reviews**
   - DAO can adjust scores through formal proposals
   - Appeals process for disputed ratings
   - Ethical Council oversight

## Integration with Governance

### Voting Power Calculation

```solidity
votingPower = baseTokens * loveAndViceMultiplier / BASE_MULTIPLIER

where:
- baseTokens = standard token-based voting power
- loveAndViceMultiplier = 100 + loveBoost - vicePenalty
- loveBoost = up to 15% boost for high Love Scores
- vicePenalty = up to 20% reduction for high Vice Scores
```

### Proposal Types

1. **Standard Proposals**
   - Require minimum Love Score to propose (75/100)
   - Normal quorum requirements
   - Basic voting power multipliers

2. **Ethics-Sensitive Proposals**
   - Higher Love Score requirement (80/100)
   - Increased quorum (60%)
   - Restricted to voters meeting ethical thresholds

### Governance Tiers

1. **Basic Tier**
   - Minimal Love Score requirement
   - Standard voting power
   - Limited to basic proposals

2. **Elevated Tier**
   - Medium Love Score threshold
   - Enhanced voting power
   - Access to sensitive proposals

3. **Ethical Council**
   - High Love Score requirement
   - Maximum voting power
   - Special oversight privileges

## Technical Implementation

### Contract Interaction Flow

1. **Score Updates**
```solidity
function submitRating(address asset, uint256 loveScore, uint256 viceScore) external
```

2. **Voting Power Calculation**
```solidity
function calculateVotingMultiplier(address user) public view returns (uint256)
```

3. **Proposal Creation**
```solidity
function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description
) public override returns (uint256)
```

### Key Events

```solidity
event ScoreUpdated(address indexed asset, uint256 newLoveScore, uint256 newViceScore);
event UserReputationUpdated(address indexed user, uint256 newMultiplier);
event ProposalTagged(uint256 indexed proposalId, bool isEthicsSensitive);
event EthicalVoteCast(address indexed voter, uint256 indexed proposalId, uint256 weight, uint256 multiplier);
```

## Setup and Configuration

### Initial Deployment

1. Deploy LoveAndViceScore contract
2. Deploy EthicalModelGovernanceDAO with LoveAndViceScore address
3. Configure roles and permissions
4. Set initial parameters

### Required Roles

1. **CURATOR_ROLE**
   - Register new assets
   - Manage initial scores
   - Handle appeals

2. **GOVERNANCE_ROLE**
   - Adjust system parameters
   - Override scores in exceptional cases
   - Manage Ethical Council membership

## Testing and Verification

Run the test suite:
```bash
npx hardhat test test/LoveAndViceScore.test.js
npx hardhat test test/EthicalModelGovernanceDAO.test.js
```

### Key Test Cases

1. Score calculation and updates
2. Voting power multipliers
3. Ethics-sensitive proposal handling
4. Role-based access control
5. Time decay and weighting mechanisms

## Security Considerations

1. **Score Manipulation Prevention**
   - Minimum ratings requirement
   - Time-weighted averaging
   - Stake-based rating power

2. **Governance Attack Mitigation**
   - Quorum requirements
   - Timelock delays
   - Score thresholds

3. **Access Control**
   - Role-based permissions
   - Multi-sig requirements for critical functions
   - Emergency pause functionality

## Future Enhancements

1. **Advanced Analytics Integration**
   - AI-powered score analysis
   - Real-time impact assessment
   - Cross-chain reputation tracking

2. **Enhanced Governance Features**
   - Quadratic voting integration
   - Reputation-based delegation
   - Dynamic quorum adjustment

3. **Interoperability**
   - Cross-platform score recognition
   - Standardized ethical metrics
   - DAO-to-DAO reputation sharing