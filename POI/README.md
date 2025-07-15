# JoyNet Multi-Chain AI Marketplace

JoyNet is a decentralized marketplace for AI models, datasets, and agents that operates across multiple blockchains, using the JOY Token as its primary utility mechanism.

## Architecture Overview

JoyNet leverages multiple blockchains for different purposes:
- **Polygon Supernet**: Primary chain for JOY Token issuance, governance, and licensing
- **Solana**: High-throughput chain for real-time micropayments
- **IOTA**: Zero-fee chain for IoT data streams and micropayments

### Core Components

1. **JOY Token (JOY)**
   - ERC20 token with governance and staking capabilities
   - Cross-chain bridging support
   - Total supply: 1 billion (initial), 10 billion (max)

2. **Bridges**
   - Secure cross-chain token transfers
   - Multi-signature validation
   - Support for Solana and IOTA chains

3. **Marketplace**
   - AI model registration and licensing
   - Usage-based payments
   - Royalty distribution

4. **Governance**
   - DAO-based decision making
   - Proposal and voting system
   - Timelock for security

## Getting Started

### Prerequisites

- Node.js v14+
- Yarn or npm
- Hardhat

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/joynet.git
cd joynet
```

2. Install dependencies:
```bash
yarn install
```

3. Create a .env file:
```bash
cp .env.example .env
```

4. Configure your environment variables in .env:
```
PRIVATE_KEY=your_private_key
POLYGON_RPC_URL=your_polygon_rpc_url
MUMBAI_RPC_URL=your_mumbai_rpc_url
```

### Building

Compile the smart contracts:
```bash
yarn build
```

### Testing

Run the test suite:
```bash
yarn test
```

Generate coverage report:
```bash
yarn coverage
```

### Deployment

1. Deploy to local network:
```bash
yarn deploy:local
```

2. Deploy to testnet (Mumbai):
```bash
yarn deploy:testnet
```

3. Deploy to mainnet:
```bash
yarn deploy:mainnet
```

## Smart Contract Architecture

### JoyTokenV2.sol
- Main utility token
- Staking and governance support
- Bridge authorization system
- Emergency controls

### PolygonBridge.sol
- Cross-chain token bridging
- Multi-signature validation
- Chain registry
- Security controls

### ModelMarketplace.sol
- AI model registration
- Licensing system
- Usage tracking
- Royalty distribution

### JoyGovernance.sol
- DAO governance
- Proposal system
- Voting mechanism
- Timelock integration

## Usage Examples

### Register an AI Model

```javascript
// Connect to the marketplace contract
const marketplace = await ethers.getContractAt("ModelMarketplace", MARKETPLACE_ADDRESS);

// Register a model
await marketplace.registerModel(
    "QmYourIPFSHash",
    ethers.utils.parseEther("100"), // License fee
    ethers.utils.parseEther("1"),   // Usage fee
    true,                           // Enable subscriptions
    ethers.utils.parseEther("50")   // Subscription fee
);
```

### Bridge Tokens to Solana

```javascript
// Connect to the bridge contract
const bridge = await ethers.getContractAt("PolygonBridge", BRIDGE_ADDRESS);

// Bridge tokens
const SOLANA_CHAIN_ID = ethers.utils.formatBytes32String("SOLANA");
await bridge.bridgeTokens(SOLANA_CHAIN_ID, ethers.utils.parseEther("100"));
```

### Create a Governance Proposal

```javascript
// Connect to the governance contract
const governance = await ethers.getContractAt("JoyGovernance", GOVERNANCE_ADDRESS);

// Create a proposal
const targets = [MARKETPLACE_ADDRESS];
const values = [0];
const calldatas = [marketplaceInterface.encodeFunctionData("setPlatformFee", [200])];
await governance.propose(targets, values, calldatas, "Update platform fee to 2%");
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security

For security concerns, please email security@joynet.com

## Support

For support questions, join our Discord server or visit our community forum.