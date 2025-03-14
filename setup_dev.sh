#!/bin/bash

# Exit on error
set -e

# Install Python dependencies
python3 -m pip install -r requirements.txt

# Install Node.js dependencies
npm install

# Install and configure Solidity compiler
solc-select install 0.8.0
solc-select use 0.8.0

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Copy environment file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from example. Please update with your settings."
fi

# Create models directory if it doesn't exist
mkdir -p models

# Prepare example models
python3 models/prepare_models.py

# Install IPFS if not installed
if ! command -v ipfs &> /dev/null; then
    echo "Installing IPFS..."
    wget https://dist.ipfs.io/go-ipfs/v0.12.0/go-ipfs_v0.12.0_linux-amd64.tar.gz
    tar xvfz go-ipfs_v0.12.0_linux-amd64.tar.gz
    cd go-ipfs
    sudo bash install.sh
    cd ..
    rm -rf go-ipfs*
fi

# Initialize IPFS if not initialized
if [ ! -d ~/.ipfs ]; then
    ipfs init
fi

echo "Development environment setup complete!"
echo "Run 'source venv/bin/activate' to activate the Python virtual environment"
echo "Run 'make start-eth' to start local Ethereum network"
echo "Run 'ipfs daemon' to start IPFS daemon"