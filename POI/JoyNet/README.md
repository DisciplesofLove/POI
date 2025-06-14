# JoyNet: Multi-Chain AI Model Marketplace with Proof of Inference (PoI)

## Overview
**JoyNet** is a decentralized AI model marketplace that enables **secure model sharing, verifiable inference execution, and fair compensation** through multi-chain technology. It removes the barriers of **centralized AI**, enabling **free AI execution** while sustaining itself through **business API monetization**. 

JoyNet leverages multiple blockchains for optimal performance:
- **Solana** for high-throughput, low-latency AI transactions
- **IOTA** for feeless microtransactions and IoT data streams
- **Polygon Supernet** for cost-effective tokenization, governance, and EVM compatibility
- **IPFS/Arweave** for decentralized AI model storage

## Key Features
✅ **Multi-Chain Integration** for optimal performance and cost-effectiveness
✅ **Zero-knowledge proof (ZKP) verification** of AI model execution (Proof-of-Inference)
✅ **High-throughput AI transactions** on Solana
✅ **Feeless microtransactions using IOTA's Tangle**
✅ **Polygon Supernet DAO governance & tokenization**
✅ **Cross-chain bridging** for seamless asset transfer
✅ **IPFS/Arweave integration** for censorship-resistant model storage
✅ **Decentralized compute execution** via Akash & Golem
✅ **$JOY token** for staking, marketplace transactions & compute incentives
✅ **Web3-based frontend** for full decentralization

## Repository Structure
```
JoyNet/
├── contracts/                 # Smart contracts for multiple chains
│   ├── multichain/           # Multi-chain integration contracts
│   │   ├── SolanaMarketplace.sol    # High-throughput AI transactions
│   │   ├── IOTABridge.sol           # Feeless micropayments
│   │   └── PolygonSupernet.sol      # Governance & tokenization
│   ├── JoyToken.sol          # ERC20 token for marketplace
│   ├── ModelMarketplace.sol  # AI model registration & trading
│   ├── NodeCoordinator.sol   # Compute coordinator
│   ├── ProofOfInference.sol  # ZK-based execution verification
│   ├── Identity.sol          # Self-sovereign identity
│   └── ZKVerifier.sol        # Zero-knowledge verification
├── src/                      # Core services
│   ├── multichain/           # Multi-chain orchestration
│   │   └── ChainOrchestrator.py  # Cross-chain coordinator
│   ├── compute_node.py       # AI inference execution
│   ├── inference_engine.py   # Model execution & verification
│   ├── zk_proof.py          # ZK proof generation
│   └── model_marketplace.py  # Marketplace interaction
├── config/                   # Configuration
│   ├── multichain_config.yaml # Multi-chain settings
│   ├── marketplace.yaml      # Marketplace rules
│   ├── compute.yaml         # Compute layer config
│   └── rpc.yaml            # RPC settings
├── frontend/                # Web3 React frontend
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   └── utils/             # Web3 utilities
└── tests/                  # Test suites
    └── multichain/         # Multi-chain integration tests
```

## Installation & Setup
### Prerequisites
- Python 3.8+
- Node.js 16+
- Solidity compiler 0.8.0
- IPFS daemon
- Access to:
  - Solana RPC node
  - IOTA node
  - Polygon Supernet node

### 1️⃣ Clone & Install Dependencies
```bash
git clone <repository-url>
cd JoyNet
./setup_dev.sh
```

### 2️⃣ Configure Multi-Chain Settings
```bash
cp config/multichain_config.yaml.example config/multichain_config.yaml
# Update chain RPC endpoints and credentials
```

### 3️⃣ Deploy Smart Contracts
```bash
# Deploy on Polygon Supernet
make deploy --network polygon-supernet

# Deploy on Solana
solana program deploy dist/solana_marketplace.so

# Deploy IOTA bridges
make deploy-iota
```

### 4️⃣ Start Chain Orchestrator
```bash
python src/multichain/ChainOrchestrator.py --config config/multichain_config.yaml
```

### 5️⃣ Start Compute Node
```bash
python src/compute_node.py --config config/compute.yaml
```

## 🔥 Multi-Chain Data Flow
```ascii
User Request ─────┬─────> Solana (High-throughput TX) ───┐
                 ├─────> IOTA (Micropayments) ──────────┼─> Chain Orchestrator
                 └─────> Polygon (Governance) ──────────┘        │
                                                                │
                                                                v
Input Data ─────> IPFS Storage <──── Compute Execution <─── Node Selection
     │                                      │
     v                                      v
Proof Verification <───────────── ZK Proof Generation
     │                                      │
     v                                      v
Payment Settlement <─────────────── Execution Results
```

1️⃣ User initiates request through the most suitable chain:
   - Solana for high-speed transactions
   - IOTA for feeless micropayments
   - Polygon for governance actions

2️⃣ Chain Orchestrator coordinates cross-chain operations
3️⃣ Compute node executes AI inference
4️⃣ Zero-Knowledge Proof verifies execution
5️⃣ Payments settled on appropriate chain
6️⃣ Results returned with verification proof

## 💰 Multi-Chain Economic Model
✅ **Optimized Transaction Costs**
  - High-volume AI usage on Solana
  - Micropayments on IOTA
  - Governance & tokenization on Polygon

✅ **Cross-Chain Revenue Streams**
  - Model licensing fees
  - Compute node rewards
  - Bridge fees
  - Governance participation

## Troubleshooting
### 1️⃣ Chain Integration Issues
```bash
# Check chain connectivity
python tools/chain_health_check.py

# Verify bridge status
python tools/bridge_monitor.py

# Monitor transaction queues
python tools/queue_status.py
```

### 2️⃣ Cross-Chain Transaction Failures
```bash
# Check bridge logs
tail -f logs/bridge.log

# Verify transaction status
python tools/tx_tracker.py --tx-hash <hash>
```

## Security Considerations
- Multi-sig bridge contracts
- Rate limiting on cross-chain transfers
- Minimum confirmation requirements
- Bridge validators monitoring
- Regular security audits

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Multi-chain development setup
- Testing cross-chain functionality
- Security best practices
- Code review process