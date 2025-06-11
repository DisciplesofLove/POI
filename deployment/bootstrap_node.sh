#!/bin/bash
# Bootstrap script for setting up a JoyNet decentralized node

set -e

# Configuration
NODE_TYPE=${1:-"full"}  # full, validator, or light
DATA_DIR=${2:-"$HOME/.joynet"}
BOOTSTRAP_PEERS=${3:-""}

# Create data directory
mkdir -p "$DATA_DIR"
mkdir -p "$DATA_DIR/ipfs"
mkdir -p "$DATA_DIR/keys"
mkdir -p "$DATA_DIR/models"
mkdir -p "$DATA_DIR/logs"

echo "Setting up JoyNet node type: $NODE_TYPE"
echo "Data directory: $DATA_DIR"

# Generate node identity
if [ ! -f "$DATA_DIR/keys/node_id" ]; then
    echo "Generating node identity..."
    openssl rand -hex 32 > "$DATA_DIR/keys/node_id"
    echo "Node ID: $(cat "$DATA_DIR/keys/node_id")"
fi

# Generate node key pair
if [ ! -f "$DATA_DIR/keys/private_key" ]; then
    echo "Generating node key pair..."
    openssl ecparam -name secp256k1 -genkey -noout -out "$DATA_DIR/keys/private_key"
    openssl ec -in "$DATA_DIR/keys/private_key" -pubout -out "$DATA_DIR/keys/public_key"
    echo "Key pair generated"
fi

# Initialize IPFS
if ! command -v ipfs &> /dev/null; then
    echo "Installing IPFS..."
    wget -q https://dist.ipfs.io/go-ipfs/v0.12.0/go-ipfs_v0.12.0_linux-amd64.tar.gz
    tar -xzf go-ipfs_v0.12.0_linux-amd64.tar.gz
    cd go-ipfs
    ./install.sh
    cd ..
    rm -rf go-ipfs go-ipfs_v0.12.0_linux-amd64.tar.gz
fi

echo "Initializing IPFS..."
export IPFS_PATH="$DATA_DIR/ipfs"
ipfs init --profile server

# Configure IPFS
echo "Configuring IPFS..."
ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'

# Start IPFS daemon
echo "Starting IPFS daemon..."
ipfs daemon --enable-pubsub-experiment &
IPFS_PID=$!
echo "IPFS daemon started with PID: $IPFS_PID"

# Wait for IPFS to start
sleep 5

# Create node configuration
echo "Creating node configuration..."
cat > "$DATA_DIR/node_config.json" << EOF
{
  "node_id": "$(cat "$DATA_DIR/keys/node_id")",
  "node_type": "$NODE_TYPE",
  "ipfs": {
    "api_port": 5001,
    "gateway_port": 8080
  },
  "p2p": {
    "port": 9000,
    "bootstrap_peers": [
      $BOOTSTRAP_PEERS
    ]
  },
  "services": {
    "model_fusion": $([[ "$NODE_TYPE" == "full" || "$NODE_TYPE" == "validator" ]] && echo "true" || echo "false"),
    "marketplace": $([[ "$NODE_TYPE" == "full" ]] && echo "true" || echo "false"),
    "inference": true,
    "validation": $([[ "$NODE_TYPE" == "validator" ]] && echo "true" || echo "false")
  }
}
EOF

# Download JoyNet binary or use Docker
if [ -f "./joynet" ]; then
    echo "Using local JoyNet binary"
    JOYNET_CMD="./joynet"
elif command -v docker &> /dev/null; then
    echo "Using Docker to run JoyNet"
    JOYNET_CMD="docker run --network host -v $DATA_DIR:/data joynet/node:latest"
else
    echo "Error: JoyNet binary not found and Docker not installed"
    exit 1
fi

# Start JoyNet node
echo "Starting JoyNet node..."
$JOYNET_CMD start --config "$DATA_DIR/node_config.json" --data-dir "$DATA_DIR" &
JOYNET_PID=$!
echo "JoyNet node started with PID: $JOYNET_PID"

# Create startup script
cat > "$DATA_DIR/start_node.sh" << EOF
#!/bin/bash
export IPFS_PATH="$DATA_DIR/ipfs"
ipfs daemon --enable-pubsub-experiment &
sleep 5
$JOYNET_CMD start --config "$DATA_DIR/node_config.json" --data-dir "$DATA_DIR"
EOF

chmod +x "$DATA_DIR/start_node.sh"

echo "JoyNet node setup complete!"
echo "To start the node in the future, run: $DATA_DIR/start_node.sh"

# Keep the script running
wait $JOYNET_PID