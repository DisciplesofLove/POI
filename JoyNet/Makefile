# Makefile for JoyNet project

.PHONY: install build test deploy clean

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	python3 -m pip install -r requirements.txt

# Build contracts
build:
	@echo "Building contracts..."
	npx hardhat compile

# Run tests
test:
	@echo "Running tests..."
	npx hardhat test
	python3 -m pytest tests/

# Deploy contracts
deploy:
	@echo "Deploying contracts..."
	npx hardhat run scripts/deploy.js --network $(filter-out $@,$(MAKECMDGOALS))

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf artifacts/
	rm -rf cache/
	rm -rf dist/
	find . -type d -name __pycache__ -exec rm -r {} +

# Start development environment
dev:
	@echo "Starting development environment..."
	./setup_dev.sh

# Format code
format:
	@echo "Formatting code..."
	npx prettier --write 'contracts/**/*.sol'
	npx prettier --write 'frontend/**/*.{ts,tsx}'
	black src/ tests/

# Lint code
lint:
	@echo "Linting code..."
	npx solhint 'contracts/**/*.sol'
	npx eslint 'frontend/**/*.{ts,tsx}'
	pylint src/ tests/

# Security check
security:
	@echo "Running security checks..."
	npx slither .
	safety check

# Generate documentation
docs:
	@echo "Generating documentation..."
	npx solidity-docgen
	pdoc --html --output-dir docs/python src/

# Help
help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make build      - Build contracts"
	@echo "  make test       - Run tests"
	@echo "  make deploy     - Deploy contracts"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make dev        - Start development environment"
	@echo "  make format     - Format code"
	@echo "  make lint       - Lint code"
	@echo "  make security   - Run security checks"
	@echo "  make docs       - Generate documentation"

%:
	@: