# JoyNet Blockchain Integration for Lovable

## Setup for Your Lovable Project

1. **Copy integration file**:
```bash
cp frontend/lovable-integration.ts your-lovable-project/src/lib/
```

2. **Install ethers in your Lovable project**:
```bash
npm install ethers
```

3. **Deploy contracts first**:
```bash
npx hardhat run scripts/deploy_integrated_system.js --network mainnet
```

4. **Use in Lovable components**:
```typescript
import { initJoyNet, MAINNET_CONTRACTS } from './lib/lovable-integration';

const joynet = initJoyNet(MAINNET_CONTRACTS);

// Connect wallet
const userAddress = await joynet.connectWallet();

// Get user data
const userData = await joynet.getUserData(userAddress);

// Register agent
await joynet.registerAgent("agent1", "AI Assistant", "10", ["nlp"]);

// Request task
await joynet.requestTask("task1", "Need help", "50", Date.now() + 3600000);

// Create proposal
await joynet.createProposal("prop1", "New feature", 86400);

// Vote
await joynet.vote("prop1", true);

// Create agent flow
await joynet.createFlow("flow1", [agentAddress], [0], true);
```

## Complete Decentralized AI System ✅

**Free AI Inference**:
- Register as validator: `joynet.registerAsValidator(stakeAmount)`
- Register compute node: `joynet.registerComputeNode(ip, capacity, stake)`
- Execute inference: `joynet.executeInference(modelId, input)`
- Submit proofs: `joynet.submitInferenceProof(...)`

**RPC Network**:
- Register RPC node: `joynet.registerRPCNode(endpoint)`
- Send heartbeats: `joynet.sendRPCHeartbeat(metrics)`

**All JoyNet Features Available**:
- Love/Vice scoring, Agent marketplace, Governance
- Self-healing orchestration, ZK verification
- Proof of Inference, Node coordination, Sovereign RPC

Old frontends removed. Pure blockchain backend ready for Lovable.