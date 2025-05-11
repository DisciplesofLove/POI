# PermaNet Architecture

## Overview

PermaNet is a decentralized platform that combines AI model marketplace, domain management, and RPC services with community governance features. The architecture is designed to be fully decentralized, scalable, and secure.

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

## Community DNS Integration

The PermaNet marketplace ecosystem has been enhanced to support community ownership of internet domains through the following components:

### Key Components
- **PermaNetDomainRegistry**: Manages the core domain registration system including TLDs and subdomains
- **PermaNetDAORegistry**: Enables community governance of TLDs through DAOs
- **ModelMarketplaceV2**: Handles the marketplace functionality including model registration and usage
- **PermaNetMarketplaceAdapter**: Bridges domains, DAOs, and marketplace functionality

### How It Works
1. Top-Level Domains (TLDs) can be owned by:
   - Individual owners
   - DAO communities (through PermaNetDAORegistry)

2. When a TLD is controlled by a DAO:
   - Community members can stake tokens to participate in governance
   - Domain registrations must be approved through DAO voting
   - The community can set policies and manage the TLD collectively

3. Models in the marketplace can be:
   - Associated with domains
   - Updated and managed by their owners
   - Integrated with the IOTA network for secure data streaming

### Community Benefits
- Decentralized governance of internet namespaces
- Democratic decision-making for domain registrations
- Integration of AI models with permanent web infrastructure
- Community-driven policies and standards

### Technical Integration
The PermaNetMarketplaceAdapter acts as the bridge between these systems:
- Verifies domain availability and ownership
- Checks DAO governance requirements for domain registration
- Links marketplace models with permanent domains
- Ensures proper access control and permissions

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
python -m src.p2p.node_network
```

2. Initialize IPFS:
```bash
ipfs init
ipfs daemon
```

3. Deploy SovereignRPC contract:
```bash
truffle migrate --network development
```

4. Start the application:
```bash
cd unified-frontend
npm run dev
```

## Configuration Files
- `p2p_config.yaml`: P2P network settings
- `truffle-config.js`: Blockchain configuration
- `.env`: Environment variables