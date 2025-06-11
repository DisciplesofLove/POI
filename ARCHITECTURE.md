# JoyNet Architecture

## Overview

JoyNet is a decentralized platform that combines AI model marketplace, domain management, and RPC services with community governance features. The architecture is designed to be fully decentralized, scalable, and secure, with a focus on user data ownership, privacy protection, and fair monetization. This document provides a comprehensive overview of the system architecture and its components.

## Core Components

### 1. P2P Network Layer
- **libp2p**: Used for peer-to-peer communication
- **Custom NodeNetwork**: Implementation for inference coordination
- **Decentralized peer discovery and management**
- **Direct peer-to-peer communication**
- **Distributed message broadcasting**

### 2. Storage Layer
- **IPFS**: For decentralized model and data storage
- **Content-addressed storage**: Ensures immutability
- **Local caching with IPFS pinning**
- **Distributed caching**
- **Peer-to-peer file sharing**

### 3. Consensus Layer
- **Smart contract-based consensus**: Using SovereignRPC
- **Proof of Inference validation**
- **Majority voting for inference results**
- **Node registration and reputation**
- **Client authorization**

### 4. Frontend Layer
- **Unified TypeScript/React frontend**
- **Web3 integration for blockchain interaction**
- **Model marketplace UI**
- **Domain management interface**
- **Staking and governance features**

## Smart Contracts

### Core Contracts
- **ModelMarketplace**: Handles model registration, purchases, and royalties
- **PermaNetDomainRegistry**: Manages domain registration and ownership
- **SovereignRPC**: Decentralized RPC node management
- **JoyToken**: Platform utility token with staking functionality
- **ProofOfInference**: Validates model execution
- **NodeCoordinator**: Manages node selection and coordination

### Domain Management
- **PermaNetDomainRegistry**: Core domain registration system
- **PermaNetDAORegistry**: Community governance of TLDs through DAOs
- **TldRegistry**: Management of top-level domains

## RPC Integration

The SovereignRPC system provides decentralized RPC services with:
- Node registration with deposits
- Client authorization
- Node selection based on reputation and capacity
- Multi-chain support (ETH, Polygon, etc.)
- JWT authentication
- Node health monitoring

## AI Model Marketplace

The PermaNet marketplace ecosystem has been enhanced with the following components:

### Key Components
- **ModelMarketplace**: Handles the marketplace functionality including model registration and usage
- **ModelFusionContract**: Manages composite AI models and royalty distribution
- **ProofOfInference**: Validates model execution
- **NodeCoordinator**: Manages node selection and coordination

### Model Fusion Engine

The Model Fusion Engine is a key component that enables developers to combine complementary AI systems:

#### Architecture
- **Compatibility Analysis**: AI-powered system that analyzes model compatibility
- **Connection Configuration**: Framework for defining interaction points between models
- **Performance Testing**: Benchmarking system to evaluate fused model performance
- **Royalty Distribution**: Smart contract-based system for fair attribution and compensation

#### Workflow
1. **Model Discovery**: Users select complementary models from the marketplace
2. **Compatibility Check**: System analyzes technical compatibility between models
3. **Connection Configuration**: Users define how models will interact
4. **Performance Testing**: Combined model is tested against benchmarks
5. **Deployment**: Fused model is deployed with proper attribution and royalty distribution

#### Technical Implementation
- **Smart Contracts**: ModelFusionContract handles ownership, royalties, and usage tracking
- **Backend Services**: Python-based fusion engine handles compatibility analysis and testing
- **Frontend Interface**: React-based UI for model selection and configuration
- **Storage**: IPFS for storing model metadata and connection configurations

## Performance Optimizations

The system includes optimizations for sub-100ms latency:
- Pre-emptive model loading based on user patterns
- Hot model cache for frequently used models
- Hardware acceleration with FPGA for ZK proofs
- Optimized GPU memory management
- Geospatial node selection
- Model sharding across GPUs
- Batching for concurrent requests

## Security Features

- Environment variable management for sensitive credentials
- Smart contract security with rate limiting and circuit breakers
- WAF (Web Application Firewall) and DDoS protection
- Timing-safe comparison for token validation
- Log sanitization to prevent injections
- Resource limits and proper cleanup

## Getting Started

1. Start the P2P network:
```bash
# Initialize the node
python -m src.p2p.node_network init

# Start the node service
python -m src.p2p.node_network start
```

2. Initialize IPFS:
```bash
ipfs init
ipfs daemon
```

3. Deploy smart contracts:
```bash
# Deploy core contracts
cd contracts
npx hardhat run scripts/deploy.js --network development

# Deploy RPC contracts
cd ../smart-contracts
npx hardhat run scripts/deploy-rpc.js --network development
```

4. Start the application:
```bash
# Start backend services
docker-compose -f deployment/docker-compose.yml up -d

# Start frontend development server
cd unified-frontend
npm run dev
```

## Configuration Files
- `config/p2p_config.yaml`: P2P network settings
- `config/hardhat.config.js`: Smart contract deployment configuration
- `deployment/docker-compose.yml`: Container orchestration
- `.env`: Environment variables