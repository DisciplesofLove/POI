# PermaNet Unified Platform

A decentralized platform combining AI model marketplace, domain management, and RPC services with community governance features.

## Features

- **AI Model Marketplace**: Buy, sell, and execute AI models with secure inference
- **Model Fusion Engine**: Combine complementary AI models to create powerful composite systems
- **Domain Name Registration**: Community-owned TLDs and domain management
- **Multi-chain RPC Support**: Decentralized RPC services with SovereignRPC
- **Token Staking**: Earn rewards through JoyToken staking
- **Community Governance**: DAO-based governance for domains and platform features
- **Decentralized Architecture**: P2P network with IPFS storage and blockchain integration

## Architecture Overview

PermaNet is built on a fully decentralized architecture with the following components:

- **P2P Network Layer**: libp2p for peer-to-peer communication
- **Storage Layer**: IPFS for decentralized model and data storage
- **Consensus Layer**: Smart contract-based consensus with SovereignRPC
- **Frontend**: Unified TypeScript/React frontend with Web3 integration

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd permanet
```

2. Install dependencies:
```bash
pip install -r requirements.txt
cd unified-frontend
npm install
cd ..
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the decentralized node:
```bash
docker-compose -f deployment/docker-compose.yml up
```

5. For development mode:
```bash
cd unified-frontend
npm run dev
```

For detailed deployment instructions, see [DECENTRALIZED_DEPLOYMENT.md](deployment/DECENTRALIZED_DEPLOYMENT.md)

## Smart Contract Deployment

1. Deploy the core contracts:
```bash
cd contracts
npx hardhat run scripts/deploy.js --network <your-network>
```

2. Update contract addresses in your environment configuration.

## Directory Structure

```
/
├── unified-frontend/    # Main TypeScript/React frontend application
│   ├── components/      # React components
│   ├── pages/           # Next.js pages
│   ├── utils/           # Utility functions including Web3 integration
│   └── hooks/           # React hooks for blockchain interaction
├── contracts/           # Smart contracts
├── src/                 # Backend services and P2P network
│   ├── p2p/             # P2P networking components
│   ├── middleware/      # API middleware
│   ├── services/        # Core services
│   └── utils/           # Utility functions
├── config/              # Configuration files
└── docs/                # Documentation
```

## Key Components

### Smart Contracts
- **ModelMarketplace**: Handles model registration, purchases, and royalties
- **ModelFusionContract**: Manages composite AI models and royalty distribution
- **PermaNetDomainRegistry**: Manages domain registration and ownership
- **SovereignRPC**: Decentralized RPC node management
- **JoyToken**: Platform utility token with staking functionality

### P2P Network
- Decentralized node discovery and communication
- Secure model inference with proof validation
- IPFS integration for content-addressed storage

### Frontend
- Web3 wallet integration
- Model marketplace UI
- Model Fusion Engine interface
- Domain management interface
- Staking and governance features

## Model Fusion Engine

The Model Fusion Engine enables developers to combine complementary AI systems to create powerful composite models:

- **Discover Compatible Models**: AI-powered recommendation system identifies complementary models
- **Configure Connection Points**: Define how models interact with automated compatibility checking
- **Test Combined Performance**: Evaluate fused models against benchmarks
- **Deploy as New Entity**: Launch composite models with proper attribution and royalty distribution

## Production Readiness

The platform includes:
- Security measures with proper authentication and authorization
- Performance optimizations for sub-100ms latency
- Decentralized monitoring and observability setup
- High availability through peer redundancy
- Fully decentralized deployment with no centralized dependencies

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed architecture documentation
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guidelines and best practices

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.