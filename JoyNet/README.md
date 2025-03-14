# JoyNet: Decentralized AI Model Marketplace with Proof of Inference (PoI)

## Overview
**JoyNet** is a decentralized AI model marketplace that enables **secure model sharing, verifiable inference execution, and fair compensation** through blockchain technology. It removes the barriers of **centralized AI**, enabling **free AI execution** while sustaining itself through **business API monetization**. 

JoyNet is **built on Polygon Supernet (PoS) for governance, IOTA (Tangle) for inference execution, and IPFS/Arweave for decentralized AI storage**.

## Key Features
✅ **Zero-knowledge proof (ZKP) verification** of AI model execution (Proof-of-Inference)
✅ **Feeless AI execution using IOTA's Tangle** (no gas fees)
✅ **Polygon Supernet DAO governance & staking**
✅ **IPFS/Arweave integration for censorship-resistant model storage**
✅ **Decentralized compute execution via Akash & Golem**
✅ **$JOY token for staking, marketplace transactions & compute incentives**
✅ **Web3-based frontend for full decentralization**

## Repository Structure
```
JoyNet/
├── contracts/                 # Fully decentralized smart contracts
│   ├── JoyToken.sol          # ERC20 token for marketplace transactions (Polygon Supernet)
│   ├── ModelMarketplace.sol  # AI model registration & trading contract
│   ├── NodeCoordinator.sol   # Decentralized compute coordinator (IOTA)
│   ├── ProofOfInference.sol  # ZK-based AI execution verification
│   ├── SovereignRPC.sol      # Custom RPC layer (self-hosted, no Infura)
│   ├── Identity.sol          # Self-sovereign identity & access control
│   └── ZKVerifier.sol        # Zero-knowledge proof verification
├── frontend/                  # Web3 React-based frontend
│   ├── components/           # UI components
│   ├── pages/               # Page components and routing
│   ├── utils/               # Web3 & decentralized compute utilities
├── src/                     # Core Python/Node.js AI execution
│   ├── compute_node.py      # IOTA-based AI inference execution
│   ├── inference_engine.py  # AI model execution & verification
│   ├── zk_proof.py          # Zero-knowledge proof generation
│   ├── model_marketplace.py # AI model marketplace interaction
├── config/                  # Decentralized settings
│   ├── marketplace.yaml     # Marketplace rules
│   ├── compute.yaml         # Decentralized compute layer config
│   ├── rpc.yaml             # Sovereign RPC settings
└── scripts/                 # Deployment scripts
```

## Installation & Setup
### Prerequisites
- Python 3.8+
- Node.js 16+
- Solidity compiler 0.8.0
- IPFS daemon
- IOTA node
- Polygon Supernet Wallet

### 1️⃣ Clone the Repository & Install Dependencies
```bash
git clone <repository-url>
cd JoyNet
./setup_dev.sh
```

### 2️⃣ Configure Sovereign RPC Layer
```bash
cp config/rpc.yaml.example config/rpc.yaml
# Add your own decentralized RPC node
```

### 3️⃣ Deploy Smart Contracts on Polygon Supernet
```bash
make deploy --network polygon-supernet
```

### 4️⃣ Start an AI Compute Node (IOTA)
```bash
python src/compute_node.py --config config/compute.yaml
```

### 5️⃣ Register an AI Model
```python
from src.model_marketplace import Marketplace
market = Marketplace(private_key="YOUR_PRIVATE_KEY")
market.register_model("AI Model", "path/to/model.onnx", price=0.1)
```

## 🔥 How AI Execution Works (Data Flow)
```ascii
User Request -> Model Marketplace -> Decentralized Compute Node Selection
     |                                     |
     v                                     v
Input Data -> IPFS Storage <- IOTA Compute Execution
     |                                     |
     v                                     v
Proof Verification <- ZK Proof Generation
     |                                     |
     v                                     v
Payment Settlement <- Execution Results
```

1️⃣ A user requests AI execution from **the decentralized marketplace**.  
2️⃣ The **Node Coordinator** assigns a compute node (**IOTA-based execution**).  
3️⃣ The node **fetches the AI model from IPFS/Arweave** and **executes inference**.  
4️⃣ A **Zero-Knowledge Proof (PoI) is generated** to prove execution integrity.  
5️⃣ The **PoI contract verifies inference correctness on-chain**.  
6️⃣ Payment is settled **using $JOY tokens**—ensuring fair compensation.  
7️⃣ Results are returned **along with verifiable proof of execution.**  

## 💰 Monetization Model (Sustainable AI Economy)
✅ **Free AI Access for Individuals & Open-Source AI Developers**  
✅ **API Monetization for Businesses** → High-scale AI usage funds the network.  
✅ **Compute Node Incentives** → Edge compute providers earn $JOY tokens.  
✅ **AI Model Staking** → Developers can stake models for rewards.  

## Troubleshooting
### 1️⃣ Compute Node Connection Issues
- Problem: Compute node fails to connect to coordinator
- Solution: 
```bash
# Check coordinator address in config/compute.yaml
# Verify network connectivity
curl http://localhost:8545
# Check logs
tail -f compute_node.log
```

### 2️⃣ Model Registration Failures
- Problem: Transaction reverts during model registration
- Solution:
```bash
# Check JOY token approval
# Ensure sufficient gas on Polygon Supernet
# Verify metadata format
```