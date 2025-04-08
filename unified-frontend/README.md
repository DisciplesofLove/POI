# AI Models NFT Marketplace Frontend

This is the unified TypeScript frontend for the AI Models NFT Marketplace, combining all functionality from the original React and TypeScript implementations.

## Features

- Browse and search AI models
- Model execution and purchase
- JOY token staking
- User profiles and dashboard
- Model creation and management
- Web3 wallet integration
- Category filtering and search
- Responsive design with Chakra UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration.

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Architecture

The frontend is built with:
- Next.js + TypeScript
- Chakra UI for styling
- Ethers.js for Web3 integration
- React Query for data management

## Folder Structure

- `components/` - Reusable UI components
- `hooks/` - Custom React hooks
- `pages/` - Next.js pages and routing
- `utils/` - Utility functions and Web3 integration
- `styles/` - Theme and global styles
- `contracts/` - Contract ABIs and addresses

## Testing

Run tests with:
```bash
npm test
```

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests
4. Submit pull request