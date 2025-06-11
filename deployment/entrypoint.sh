#!/bin/bash
set -e

# Initialize IPFS if not already initialized
if [ ! -f ~/.ipfs/config ]; then
    echo "Initializing IPFS..."
    ipfs init
    # Configure IPFS for container environment
    ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
    ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
fi

# Start IPFS daemon in background
echo "Starting IPFS daemon..."
ipfs daemon --enable-pubsub-experiment &

# Wait for IPFS to be ready
echo "Waiting for IPFS to be ready..."
until curl -s http://localhost:5001/api/v0/id > /dev/null; do
    sleep 1
done

# Generate node ID if not provided
if [ -z "$NODE_ID" ]; then
    export NODE_ID=$(openssl rand -hex 8)
    echo "Generated Node ID: $NODE_ID"
fi

# Initialize crypto vault if needed
if [ ! -z "$VAULT_PASSPHRASE" ] && [ ! -z "$INIT_VAULT" ]; then
    echo "Initializing crypto vault..."
    python -m src.utils.crypto_vault --init
fi

echo "Starting JoyNet node..."
exec "$@"