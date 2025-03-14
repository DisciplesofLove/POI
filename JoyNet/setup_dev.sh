#!/bin/bash

# Exit on error
set -e

echo "Setting up JoyNet development environment..."

# Install Python dependencies
echo "Installing Python dependencies..."
python3 -m pip install -r requirements.txt

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Install Solidity compiler
echo "Installing Solidity compiler..."
npm install -g solc

# Set up IPFS if not installed
if ! command -v ipfs &> /dev/null; then
    echo "Installing IPFS..."
    wget https://dist.ipfs.io/go-ipfs/v0.12.0/go-ipfs_v0.12.0_linux-amd64.tar.gz
    tar -xvzf go-ipfs_v0.12.0_linux-amd64.tar.gz
    cd go-ipfs
    sudo bash install.sh
    cd ..
    rm -rf go-ipfs*
fi

# Initialize IPFS if not initialized
if [ ! -d ~/.ipfs ]; then
    echo "Initializing IPFS..."
    ipfs init
fi

# Create necessary directories
echo "Creating project directories..."
mkdir -p {logs,data,models}

# Copy config examples if they don't exist
for config in marketplace compute rpc; do
    if [ ! -f "config/${config}.yaml" ]; then
        echo "Creating ${config}.yaml from example..."
        cp "config/${config}.yaml.example" "config/${config}.yaml"
    fi
done

# Set up development environment variables
echo "Setting up environment variables..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Network
POLYGON_RPC_URL=https://rpc-mumbai.polygon.technology
CHAIN_ID=80001

# IPFS
IPFS_GATEWAY=http://localhost:8080
IPFS_API_PORT=5001

# IOTA
IOTA_NODE_URL=https://nodes.comnet.iota.org:443

# Contract Addresses (to be filled after deployment)
JOY_TOKEN_ADDRESS=
MODEL_MARKETPLACE_ADDRESS=
NODE_COORDINATOR_ADDRESS=
PROOF_OF_INFERENCE_ADDRESS=

# Development
DEBUG=true
LOG_LEVEL=debug
EOF
fi

# Compile contracts
echo "Compiling smart contracts..."
npx hardhat compile

# Start local development services
echo "Starting development services..."
pm2 delete all || true
pm2 start npm --name "frontend" -- run dev
pm2 start ipfs -- daemon

echo "Setup complete! Development environment is ready."
echo "Next steps:"
echo "1. Configure your .env file with appropriate values"
echo "2. Deploy smart contracts with 'make deploy'"
echo "3. Start a compute node with 'python src/compute_node.py'"
echo "4. Visit http://localhost:3000 to access the frontend"