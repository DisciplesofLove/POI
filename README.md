# Decentralized AI Inference Platform

This project implements a decentralized platform for AI model inference, using blockchain for coordination and verification.

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

1. Register a model:
```python
from src.model_marketplace import ModelMarketplace

marketplace = ModelMarketplace(private_key, contract_address)
marketplace.register_model(model_id, metadata, price)
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

MIT