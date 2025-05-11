# PermaNet Unified Frontend

This is the unified TypeScript/React frontend for the PermaNet platform, combining AI model marketplace, domain management, and RPC services with community governance features.

## Features

- **AI Model Marketplace**: Browse, search, purchase, and execute AI models
- **Domain Management**: Register and manage domains with community governance
- **JOY Token Staking**: Stake tokens and earn rewards
- **User Profiles**: Manage your profile and model ownership
- **Web3 Integration**: Connect wallets and interact with smart contracts
- **RPC Services**: Interact with decentralized RPC endpoints
- **Responsive Design**: Built with Chakra UI for all devices

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
- **Next.js + TypeScript**: For type-safe React development
- **Chakra UI**: For consistent, accessible styling
- **Ethers.js**: For Web3 integration and blockchain interaction
- **React Query**: For efficient data fetching and caching
- **IPFS Integration**: For decentralized storage

## Folder Structure

- `components/` - Reusable UI components
  - `ModelCard.tsx` - Display model information
  - `JoyTokenStaking.tsx` - Staking interface
  - `UserProfile.tsx` - User profile management
  - `layout/` - Layout components
- `hooks/` - Custom React hooks
  - `useWallet.ts` - Wallet connection and management
  - `useModelMarketplace.ts` - Interact with marketplace contract
- `pages/` - Next.js pages and routing
  - `ai-models/` - Model marketplace pages
  - `profile.tsx` - User profile page
  - `staking.tsx` - Token staking page
- `utils/` - Utility functions
  - `web3.ts` - Web3 integration utilities
  - `rpcManager.ts` - RPC endpoint management
- `styles/` - Theme and global styles

## Integration with Backend

The frontend integrates with:
- Smart contracts for blockchain interactions
- P2P network for decentralized operations
- IPFS for decentralized storage
- SovereignRPC for decentralized RPC services

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

## Related Documentation

For more information, see:
- [Main README](/README.md) - Overview of the entire platform
- [ARCHITECTURE.md](/ARCHITECTURE.md) - Detailed architecture documentation
- [DEVELOPMENT.md](/DEVELOPMENT.md) - Development guidelines