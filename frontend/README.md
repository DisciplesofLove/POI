# JoyNet Integration for Lovable Frontend

## Quick Setup

1. **Install in your Lovable project**:
```bash
npm install ethers
```

2. **Copy integration file** to your Lovable project:
```bash
cp lovable-integration.ts /path/to/your/lovable/project/src/
```

3. **Use in your Lovable components**:
```typescript
import { initJoyNet } from './lovable-integration';

const joynet = initJoyNet({
  LoveViceScore: "0x...",
  AgentMarketplace: "0x...", 
  LiquidDemocracy: "0x...",
  SelfHealingOrchestrator: "0x...",
  ZKVerifier: "0x..."
});

// Get user reputation
const userData = await joynet.getUserData(userAddress);

// Register AI agent
await joynet.registerAgent("agent1", "AI Assistant", "10", ["nlp", "vision"]);

// Create governance proposal
await joynet.createProposal("proposal1", "Increase platform fee", 86400);
```

## Contract Addresses (Deploy first)
Run: `npx hardhat run scripts/deploy_integrated_system.js`

## Ready for Production ✅