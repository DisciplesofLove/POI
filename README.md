# JoyNet Unified Platform

A decentralized platform combining AI model marketplace, domain management, and RPC services with community governance features.

## Components

- Smart Contracts
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

2. Execute inference:
```python
from src.inference_node import InferenceNode

node = InferenceNode(private_key, contract_address)
result = node.execute_inference(model_id, input_data)
```

## Development

Run tests:
```bash
pytest tests/
```

## Architecture

1. Model Registration
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

Distributed under the MIT License. See `LICENSE` for more information.