# Decentralized Architecture

## Overview
This system implements a fully decentralized architecture using the following components:

1. **P2P Network Layer**
   - libp2p for peer-to-peer communication
   - Custom NodeNetwork implementation for inference coordination
   - Decentralized peer discovery and management

2. **Storage Layer**
   - IPFS for decentralized model and data storage
   - Content-addressed storage for immutability
   - Local caching with IPFS pinning

3. **Consensus Layer**
   - Smart contract-based consensus (SovereignRPC)
   - Proof of Inference validation
   - Majority voting for inference results

4. **Middleware Layer**
   - Decentralized routing
   - IPFS-based content routing
   - P2P discovery middleware
   - Consensus validation

## Key Components

### 1. P2P Service
The P2P service manages peer discovery and communication using libp2p, enabling:
- Dynamic peer discovery
- Direct peer-to-peer communication
- Distributed message broadcasting

### 2. Decentralized Middleware
Custom middleware components handle:
- RPC endpoint selection
- IPFS content routing
- Peer discovery
- Consensus validation

### 3. Smart Contracts
The SovereignRPC contract manages:
- Node registration and reputation
- Client authorization
- Consensus rules
- Node selection

### 4. IPFS Storage
IPFS integration provides:
- Decentralized model storage
- Content-addressed data
- Distributed caching
- Peer-to-peer file sharing

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
npm start
```

## Configuration
Key configuration files:
- `p2p_config.yaml`: P2P network settings
- `truffle-config.js`: Blockchain configuration
- `.env`: Environment variables