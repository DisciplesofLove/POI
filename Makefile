# Makefile for decentralized AI inference platform

.PHONY: install test deploy clean run-node run-examples

# Default Python interpreter
PYTHON=python3

# Install dependencies
install:
	$(PYTHON) -m pip install -r requirements.txt
	npm install -g truffle ganache-cli
	npm install @openzeppelin/contracts
	solc-select install 0.8.0
	solc-select use 0.8.0

# Run tests
test:
	pytest tests/

# Deploy smart contracts
deploy:
	truffle migrate --network development

# Clean builds
clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info
	find . -type d -name __pycache__ -exec rm -r {} +

# Run edge node
run-node:
	$(PYTHON) examples/start_edge_node.py

# Run example model registration
run-example-register:
	$(PYTHON) examples/register_model.py

# Run example inference
run-example-inference:
	$(PYTHON) examples/run_inference.py

# Prepare example models
prepare-models:
	$(PYTHON) models/prepare_models.py

# Start local Ethereum network
start-eth:
	ganache-cli --deterministic