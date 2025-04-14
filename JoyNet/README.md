# JoyNet Decentralized Infrastructure

A fully decentralized, highly available, and scalable infrastructure that powers the JoyNet ecosystem — AI models, data, domains, and user assets — leveraging a built-in RPC system without external pinning dependencies.

## Core Principles

- No vendor lock-in
- No centralized control points
- Data ownership belongs to users
- Everything transparent, provable, DAO governed

## Architecture Components

### 1. Smart Contracts

- `JoyToken.sol`: ERC20 token with governance capabilities and fee distribution
- `EnhancedSovereignRPC.sol`: Decentralized RPC node management and data integrity
- `NodeCoordinator.sol`: Node health monitoring and auto-scaling
- `ProofOfUse.sol`: Immutable logging for usage tracking and proofs

### 2. Built-In RPC System

- Multi-node architecture
- Auto-caching and replication
- Data integrity verification
- Node discovery and health monitoring
- Load balancing and failover

### 3. Proof Systems

- Proof of Use (POU)
- Proof of Integrity (POI)
- Proof of Inference (POInf)

### 4. Token Economics

- 2.5% platform fee on all monetized interactions
- Fee distribution:
  - 40% Node rewards
  - 30% Staking rewards
  - 30% Community treasury

## Getting Started

### Prerequisites

```bash
# Install dependencies
npm install

# Install development tools
npm install -g hardhat
```

### Configuration

1. Copy example environment file:
```bash
cp .env.example .env
```

2. Update environment variables:
```
PRIVATE_KEY=your_private_key
INFURA_API_KEY=your_infura_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### Deployment

1. Deploy contracts:
```bash
npx hardhat run scripts/deploy_decentralized.js --network <network>
```

2. Start RPC node:
```bash
npm run start:node
```

3. Initialize monitoring:
```bash
npm run start:monitoring
```

## Running Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/decentralized_infrastructure.test.js

# Run with coverage
npx hardhat coverage
```

## Architecture Overview

### Data Flow

1. Client Request
   - Request routed to optimal RPC node
   - Node health and capacity verified
   - Request authenticated and validated

2. Data Processing
   - Content retrieved from decentralized storage
   - Integrity verified through POI
   - Results cached for performance

3. Proof Generation
   - Usage logged with POU
   - Inference verified with POInf
   - All proofs stored immutably

### High Availability

- Multi-region deployment
- Automatic failover
- Load balancing
- Auto-scaling based on demand

### Security

- Full SSL/TLS 1.3 enforcement
- Input validation and sanitization
- Rate limiting
- Multi-sig operations

## Monitoring & Maintenance

### Metrics

- Node health status
- Network performance
- Cache hit rates
- Proof verification rates

### Alerts

- Node downtime
- High latency
- Data integrity issues
- Capacity thresholds

## Governance

### JoyNet DAO

- Controls platform parameters
- Manages treasury
- Approves upgrades
- Resolves disputes

### Node Operators

- Stake JOY tokens
- Maintain infrastructure
- Earn rewards
- Participate in governance

## Development

### Directory Structure

```
JoyNet/
├── contracts/           # Smart contracts
├── scripts/            # Deployment scripts
├── test/              # Test files
├── config/            # Configuration files
├── src/               # Node software
└── monitoring/        # Monitoring tools
```

### Key Files

- `contracts/JoyToken.sol`: Token and economics
- `contracts/EnhancedSovereignRPC.sol`: RPC management
- `contracts/NodeCoordinator.sol`: Node coordination
- `contracts/ProofOfUse.sol`: Proof systems
- `config/rpc_network.yaml`: Network configuration

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Create pull request

## License

MIT License - see LICENSE file for details

## Contact

- Website: https://joynet.network
- Email: support@joynet.network
- Discord: https://discord.gg/joynet