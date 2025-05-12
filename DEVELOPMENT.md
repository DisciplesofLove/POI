# Development Guide

This document provides comprehensive information for developers working on the PermaNet platform.

## Development Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd permanet
```

2. Install dependencies:
```bash
pip install -r requirements.txt
cd unified-frontend
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
cd unified-frontend
npm run dev
```

## Smart Contract Development

### Local Development
1. Install development tools:
```bash
npm install -g truffle ganache-cli
```

2. Start a local blockchain:
```bash
ganache-cli
```

3. Deploy contracts:
```bash
cd contracts
truffle migrate --network development
```

### Testing Smart Contracts
```bash
cd contracts
truffle test
```

## Frontend Development

The frontend is built with TypeScript, React, and Next.js.

### Key Components
- `components/`: React components
- `pages/`: Next.js pages
- `utils/`: Utility functions including Web3 integration
- `hooks/`: React hooks for blockchain interaction

### Running Tests
```bash
cd unified-frontend
npm test
```

## Backend Development

### P2P Network
The P2P network is built using libp2p and custom node network implementation.

To run the P2P network:
```bash
python -m src.p2p.node_network
```

### Testing Backend Components
```bash
pytest src/
```

## Integration Testing

1. Start the backend services:
```bash
python -m src.app
```

2. Start the frontend:
```bash
cd unified-frontend
npm run dev
```

3. Run integration tests:
```bash
pytest tests/integration/
```

## Production Readiness Checklist

### Security
- [ ] Move all sensitive credentials to a secure secret management service
- [ ] Implement proper key rotation mechanisms
- [ ] Ensure all environment variables are properly validated
- [ ] Complete comprehensive audit of all smart contracts
- [ ] Implement rate limiting for sensitive operations
- [ ] Add circuit breakers for emergency situations

### Performance Optimization
- [ ] Implement caching layer for frequently accessed data
- [ ] Optimize database queries and indexes
- [ ] Set up proper connection pooling
- [ ] Implement code splitting and lazy loading
- [ ] Set up CDN for static assets
- [ ] Optimize bundle size

### Monitoring and Observability
- [ ] Set up comprehensive monitoring dashboards
- [ ] Configure alerting thresholds
- [ ] Implement detailed logging
- [ ] Add thorough health check endpoints
- [ ] Set up automated system health monitoring
- [ ] Implement circuit breakers for external dependencies

### High Availability
- [ ] Set up proper load balancing
- [ ] Implement auto-scaling
- [ ] Configure multi-region deployment
- [ ] Implement proper backup strategies
- [ ] Set up disaster recovery procedures
- [ ] Configure data replication

### DevOps
- [ ] Set up automated testing in pipeline
- [ ] Implement blue-green deployment
- [ ] Add automated security scanning
- [ ] Complete API documentation
- [ ] Update deployment guides
- [ ] Create runbooks for common issues

## Contribution Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/TypeScript
- Write comprehensive tests for new features
- Document all public APIs and functions

## Deployment

### Decentralized Deployment
1. Build the Docker image:
```bash
docker build -t permanet .
```

2. Run the container:
```bash
docker run -p 3000:3000 permanet
```

3. Join the P2P network:
```bash
python -m src.p2p.node_network
```

4. For multi-node deployment:
```bash
# On each node
export NODE_ID=$(openssl rand -hex 8)
export BOOTSTRAP_PEERS=/ip4/x.x.x.x/tcp/4001/p2p/QmBootstrapPeerID
python -m src.p2p.node_network --bootstrap $BOOTSTRAP_PEERS
```

## Troubleshooting

### Common Issues
- **Web3 connection issues**: Check if MetaMask is installed and connected to the correct network
- **IPFS connection errors**: Ensure IPFS daemon is running
- **Smart contract interaction failures**: Verify contract addresses and ABI
- **P2P network issues**: Check firewall settings and network configuration

### Debugging Tools
- Browser developer tools for frontend issues
- `truffle debug` for smart contract debugging
- Python debugger for backend issues