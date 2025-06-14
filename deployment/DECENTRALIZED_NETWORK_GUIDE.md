# JoyNet Decentralized Network Guide

This guide provides comprehensive instructions for setting up and participating in the JoyNet decentralized network.

## Overview

JoyNet is a fully sovereign decentralized platform that combines AI model marketplace, domain management, and RPC services with community governance features. The network operates without central dependencies, using a peer-to-peer architecture with IPFS for storage and blockchain integration.

## Node Types

JoyNet supports three types of nodes:

1. **Full Node**: Runs all services including model fusion, marketplace, and inference
2. **Validator Node**: Focuses on validation and consensus with Proof of Integrity
3. **Light Node**: Provides basic services like model inference with minimal resource requirements

## Prerequisites

- Docker and Docker Compose
- 4GB RAM minimum (8GB+ recommended for Full/Validator nodes)
- 50GB storage minimum
- Stable internet connection

## Quick Start

The fastest way to join the network is using our Docker Compose setup:

```bash
# Clone the repository
git clone https://github.com/joynet/platform.git
cd platform

# Create data directory
mkdir -p ~/.joynet

# Start a full node
docker-compose -f deployment/docker-compose.decentralized.yml up
```

This will start a full node with IPFS and monitoring services.

## Manual Setup

For more control or to run on systems without Docker:

```bash
# Clone the repository
git clone https://github.com/joynet/platform.git
cd platform

# Install dependencies
pip install -r requirements.txt

# Run the bootstrap script
bash deployment/bootstrap_node.sh full ~/.joynet
```

## Configuration

The node configuration is stored in `~/.joynet/node_config.json`. Key settings include:

- `node_type`: Type of node (full, validator, light)
- `p2p.bootstrap_peers`: List of bootstrap peers to connect to
- `services`: Enabled services on this node

Example configuration:

```json
{
  "node_id": "12345abcde",
  "node_type": "full",
  "ipfs": {
    "api_port": 5001,
    "gateway_port": 8080
  },
  "p2p": {
    "port": 9000,
    "bootstrap_peers": [
      "/ip4/bootstrap1.joynet.network/tcp/9000/p2p/QmBootstrapPeer1",
      "/ip4/bootstrap2.joynet.network/tcp/9000/p2p/QmBootstrapPeer2"
    ]
  },
  "services": {
    "model_fusion": true,
    "marketplace": true,
    "inference": true,
    "validation": false
  },
  "region": "us-east",
  "log_level": "info"
}
```

## Network Architecture

The JoyNet decentralized network consists of several key components:

### P2P Network Layer

- Uses libp2p for peer-to-peer communication
- Automatic peer discovery and mesh network formation
- Resilient to node failures with automatic recovery

### Decentralized Storage

- IPFS for content-addressed storage of models and metadata
- Local caching for improved performance
- Pinning service for critical data

### Consensus Layer

- Proof of Integrity for model validation
- Decentralized governance for network decisions
- Smart contract integration for marketplace transactions

### Monitoring

- Decentralized Prometheus/Grafana setup
- Local alerting without central dependencies
- Network health metrics and dashboards

## Participating in Governance

Full and validator nodes can participate in the decentralized governance system:

1. **View Proposals**: Access active proposals through the API or web interface
2. **Vote**: Cast votes on proposals based on your stake
3. **Create Proposals**: Submit new proposals for parameter changes, code updates, or funds allocation

Example API usage:

```bash
# Get active proposals
curl http://localhost:8000/api/governance/proposals

# Vote on a proposal
curl -X POST http://localhost:8000/api/governance/vote \
  -H "Content-Type: application/json" \
  -d '{"proposal_id": "abc123", "vote": "yes"}'
```

## Running a Validator Node

Validator nodes play a crucial role in the network by validating model integrity and participating in consensus:

```bash
# Start a validator node
docker-compose -f deployment/docker-compose.decentralized.yml --profile validator up
```

Validators earn rewards for their service to the network.

## Security Considerations

- **Private Keys**: Store your node's private key securely
- **Firewall**: Configure your firewall to allow only necessary ports
- **Updates**: Keep your node software updated
- **Monitoring**: Set up alerts for suspicious activities

## Troubleshooting

### Common Issues

1. **Connection Problems**:
   - Check if bootstrap peers are accessible
   - Verify your firewall settings
   - Ensure your node ID is registered correctly

2. **IPFS Issues**:
   - Check if IPFS daemon is running
   - Verify IPFS API port is accessible
   - Clear IPFS cache if experiencing storage issues

3. **Consensus Problems**:
   - Ensure your node time is synchronized
   - Check logs for validation errors
   - Verify your node has the latest governance decisions

### Logs

Logs are stored in `~/.joynet/logs/` and can be viewed with:

```bash
tail -f ~/.joynet/logs/node.log
```

## Community and Support

- **Discord**: Join our community at [discord.gg/joynet](https://discord.gg/joynet)
- **Forum**: Discuss issues and proposals at [forum.joynet.network](https://forum.joynet.network)
- **GitHub**: Report bugs and contribute at [github.com/joynet/platform](https://github.com/joynet/platform)

## Contributing

We welcome contributions to the JoyNet decentralized network:

1. Fork the repository
2. Create your feature branch
3. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

## Roadmap

- **Q3 2023**: Enhance mesh network resilience
- **Q4 2023**: Implement advanced governance features
- **Q1 2024**: Add cross-chain integration
- **Q2 2024**: Launch decentralized model training