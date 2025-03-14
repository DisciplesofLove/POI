# Decentralized AI Inference Platform

A fully decentralized marketplace for AI model inference running on Polygon Supernet with IOTA-powered feeless transactions.

## Architecture Overview

### Network Layer
- **Blockchain**: Polygon Supernet for fast, scalable transactions
- **Feeless Inference**: IOTA Streams for data transfer and feeless model inference
- **Governance**: DAO-based decision making with JOY token voting

This project implements a decentralized platform for AI model inference, using blockchain for coordination and verification.

## Key Components

### Smart Contracts (Polygon Supernet)
- **ModelMarketplaceV2**: Core marketplace with IOTA integration and DAO governance
- **ModelGovernanceDAO**: Decentralized governance contract
- **IOTAValidator**: Bridge between Polygon and IOTA networks

### IOTA Integration
- Feeless inference using IOTA Streams
- Secure data transfer and validation
- IOTA Identity for authentication

### Decentralized Control
- No admin privileges or centralized control
- Community governance through DAO
- Timelock protection for critical changes
  - JoyToken (ERC20): Platform token for payments and staking
  - ProofOfInference: Validates model execution with zero-knowledge proofs
  - ProofOfUse: Tracks model usage and rewards
  - NodeCoordinator: Manages edge computing nodes
  - ModelMarketplace: Marketplace for AI models
  - ZKVerifier: Verifies zero-knowledge proofs

- Python Components
  - EdgeNode: Edge computing node implementation
  - InferenceNode: Base class for model execution
  - ModelMarketplace: Client for model marketplace
  - ZKProver: Generates zero-knowledge proofs

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Deploy contracts:
```bash
python scripts/deploy.py
```

3. Start an edge node:
```bash
python -m src.edge_node
```

## Usage

### Model Registration
1. Deploy model to IPFS
2. Register with ModelMarketplaceV2
3. Create IOTA Streams channel for feeless inference

### Execute Inference
1. **Standard Mode**: Pay with JOY tokens on Polygon Supernet
2. **Feeless Mode**: Use IOTA Streams for data transfer
3. Verify execution through IOTA message validation

### Governance
1. Propose changes through DAO
2. Vote using JOY tokens
3. Execute approved proposals after timelock

### Example: Model Registration and Inference

```python
import os
from src.model_marketplace import ModelMarketplace
from src.iota_inference_handler import IOTAInferenceHandler
from src.inference_node import InferenceNode

# 1. Create IOTA channel and register model
iota = IOTAInferenceHandler(
    node_url=os.getenv("IOTA_NODE_URL"),
    wallet_seed=os.getenv("IOTA_WALLET_SEED")
)
channel_id = await iota.create_model_channel("mymodel")

# Initialize marketplace on Polygon Supernet
marketplace = ModelMarketplace(
    web3_provider=os.getenv("POLYGON_SUPERNET_RPC"),
    contract_address=os.getenv("MODEL_MARKETPLACE_ADDRESS")
)

# Register model with feeless inference support
await marketplace.register_model(
    model_id="mymodel",
    metadata="ipfs://Qm...",
    price=0,  # Set to 0 for feeless inference
    iota_stream_id=channel_id
)

# 2. Execute feeless inference
node = InferenceNode(
    web3_provider=os.getenv("POLYGON_SUPERNET_RPC"),
    contract_address=os.getenv("MODEL_MARKETPLACE_ADDRESS"),
    iota_node_url=os.getenv("IOTA_NODE_URL"),
    iota_wallet_seed=os.getenv("IOTA_WALLET_SEED")
)

# Request inference via IOTA Streams
result = await node.execute_inference(
    model_id="mymodel",
    input_data={"text": "Hello world"},
    use_iota=True
)
```

## Development

### Prerequisites
- Node.js 14+
- Python 3.8+
- Polygon Supernet RPC access
- IOTA node access

### Environment Setup
1. Copy .env.template to .env
2. Configure Polygon Supernet and IOTA settings
3. Set up wallet and node access

### Local Development
```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Deploy to Polygon Supernet
npx hardhat run scripts/deploy.js --network polygon_supernet

# Start inference node
python src/inference_node.py
```

### Testing
```bash
# Smart contract tests
npx hardhat test

# Python tests
pytest tests/
```

### Example: Participating in Governance

```python
from web3 import Web3
from src.model_marketplace import ModelMarketplace

# Connect to DAO contract
dao = ModelGovernanceDAO("DAO_CONTRACT_ADDRESS")

# Create a proposal
proposal = await dao.propose(
    targets=[marketplace_address],
    values=[0],
    calldata=Web3.eth.abi.encodeFunctionCall(
        fn_abi=marketplace_abi["updateGovernance"],
        args=[new_governor_address]
    ),
    description="Update governance to new DAO contract"
)

# Vote on proposal
await dao.castVote(proposal_id, True)  # True for support

# After voting period and if passed
await dao.execute(proposal_id)
```

## Smart Contracts

1. **ModelMarketplaceV2**: Core marketplace contract on Polygon Supernet
   - Integrates with IOTA Streams for feeless inference
   - DAO-governed with no centralized control
   - Supports both token-based and feeless inference options

2. **ModelGovernanceDAO**: Decentralized governance system
   - Community-driven decision making
   - JOY token voting power
   - Timelock protection for security

3. **IOTAValidator**: Bridge between Polygon and IOTA
   - Validates IOTA Stream IDs and messages
   - Ensures secure cross-chain communication
   - Enables feeless inference verification

## IOTA Integration

1. **Feeless Inference**
   - IOTA Streams for secure data transfer
   - No gas fees for inference requests
   - Validated message passing

2. **Identity Management**
   - IOTA Identity for authentication
   - Decentralized identity verification
   - Secure model access control
   - Models are registered on the marketplace with metadata and pricing
   - Model files are stored on IPFS
   
2. Edge Node Network
   - Nodes stake tokens and register with coordinator
   - Tasks are distributed based on capacity and load
   
3. Inference Execution
   - Input data is processed by edge nodes
   - ZK proofs verify correct execution
   - Results are validated by PoI system
   
4. Payments and Rewards
   - Users pay in JOY tokens for inference
   - Node operators earn from execution fees
   - Model owners earn from usage fees

## License

MIT