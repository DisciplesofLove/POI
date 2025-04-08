# PermaNet Unified Platform

A unified platform combining AI model marketplace, domain management, and RPC services.

## Features

- AI Model Marketplace
- Domain Name Registration
- Multi-chain RPC Support
- Token Staking
- Community Features

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd permanet
```

2. Install dependencies:
```bash
cd JoyNet/frontend
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. Set up RPC services:
```bash
cd JoyNet/frontend
docker-compose -f docker-compose.rpc.yml up -d
```

5. Start the development server:
```bash
npm run dev
```

## Configuration

### RPC Configuration
- Edit `docker-compose.rpc.yml` to configure RPC endpoints
- Default ports:
  - ETH RPC: 8545
  - Polygon RPC: 8546

### Smart Contract Deployment
1. Deploy the Domain Registry contract
2. Update `NEXT_PUBLIC_DOMAIN_REGISTRY_ADDRESS` in `.env.local`

## Directory Structure

```
JoyNet/
├── frontend/          # Main frontend application
│   ├── components/    # React components
│   ├── pages/         # Next.js pages
│   ├── utils/        # Utility functions
│   └── styles/       # CSS and styling
├── contracts/         # Smart contracts
└── scripts/          # Deployment and utility scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.