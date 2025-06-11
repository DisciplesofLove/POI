# Decentralized Deployment Guide

This guide provides instructions for deploying JoyNet in a fully decentralized manner without any centralized cloud services.

## Prerequisites

- Docker and Docker Compose
- IPFS (for local development)
- Node.js 16+
- Python 3.8+

## Deployment Options

### 1. Single Node Deployment

For testing or development purposes:

```bash
# Clone the repository
git clone <repository-url>
cd joynet

# Install dependencies
pip install -r requirements.txt
cd unified-frontend
npm install
cd ..

# Start the node
docker-compose -f deployment/docker-compose.yml up
```

### 2. Multi-Node Deployment

For a production decentralized network:

1. **Bootstrap Node Setup**:
   ```bash
   # On your first node
   export NODE_ID=$(openssl rand -hex 8)
   docker-compose -f deployment/docker-compose.yml up
   
   # Note the peer ID from logs: "P2P node started with ID: Qm..."
   ```

2. **Additional Nodes**:
   ```bash
   # On each additional node
   export NODE_ID=$(openssl rand -hex 8)
   export BOOTSTRAP_PEERS=/ip4/<bootstrap-ip>/tcp/4001/p2p/<bootstrap-peer-id>
   docker-compose -f deployment/docker-compose.yml up
   ```

### 3. Validator Node Setup

For nodes participating in consensus:

```bash
# Generate a new wallet
export PRIVATE_KEY=$(openssl rand -hex 32)
echo "Your public address: 0x$(python -c "import eth_keys; print(eth_keys.keys.PrivateKey(bytes.fromhex('$PRIVATE_KEY')).public_key.to_address())")"

# Start validator node
export NODE_ID=$(openssl rand -hex 8)
export BOOTSTRAP_PEERS=/ip4/<bootstrap-ip>/tcp/4001/p2p/<bootstrap-peer-id>
export NODE_TYPE=validator
export VALIDATOR_KEY=$PRIVATE_KEY
docker-compose -f deployment/docker-compose.yml up
```

## Security Considerations

1. **Secure Your Keys**:
   - Store private keys securely
   - Use the built-in CryptoVault for sensitive information

2. **Network Security**:
   - Configure firewalls to only allow necessary ports
   - Use secure WebRTC connections for peer communication

3. **Data Persistence**:
   - Mount volumes for IPFS and node data to prevent data loss

## Monitoring

The deployment includes Prometheus and Grafana for monitoring:

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (default login: admin/admin)

## Troubleshooting

1. **Peer Connection Issues**:
   - Check firewall settings
   - Verify bootstrap peer addresses
   - Ensure ports 4001 and 3000 are accessible

2. **IPFS Connection Issues**:
   - Check if IPFS daemon is running
   - Verify IPFS API port (5001) is accessible

3. **Consensus Issues**:
   - Ensure validator has sufficient stake
   - Check validator key is properly configured

## Backup and Recovery

1. **Regular Backups**:
   - Back up Docker volumes regularly
   - Export IPFS pinned content

2. **Recovery Process**:
   - Restore Docker volumes
   - Rejoin the P2P network with the same node ID

## Upgrading

To upgrade your node:

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f deployment/docker-compose.yml down
docker-compose -f deployment/docker-compose.yml build
docker-compose -f deployment/docker-compose.yml up
```