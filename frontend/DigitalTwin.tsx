import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface ContractAddresses {
  LoveViceScore: string;
  AgentMarketplace: string;
  LiquidDemocracy: string;
  SelfHealingOrchestrator: string;
  ZKVerifier: string;
}

interface DigitalTwinProps {
  contractAddresses: ContractAddresses;
  lovableApiKey: string;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ contractAddresses, lovableApiKey }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [contracts, setContracts] = useState<any>({});
  const [userScore, setUserScore] = useState({ love: 0, vice: 0, reputation: 0 });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    initializeContracts();
  }, []);

  const initializeContracts = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);
      
      const signer = web3Provider.getSigner();
      
      const contractInstances = {
        loveViceScore: new ethers.Contract(contractAddresses.LoveViceScore, LOVE_VICE_ABI, signer),
        agentMarketplace: new ethers.Contract(contractAddresses.AgentMarketplace, AGENT_MARKETPLACE_ABI, signer),
        liquidDemocracy: new ethers.Contract(contractAddresses.LiquidDemocracy, LIQUID_DEMOCRACY_ABI, signer),
        orchestrator: new ethers.Contract(contractAddresses.SelfHealingOrchestrator, ORCHESTRATOR_ABI, signer),
        zkVerifier: new ethers.Contract(contractAddresses.ZKVerifier, ZK_VERIFIER_ABI, signer)
      };
      
      setContracts(contractInstances);
      setIsConnected(true);
    }
  };

  const connectToLovable = async (userAddress: string) => {
    const response = await fetch('https://api.lovable.dev/digital-twin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userAddress,
        reputation: userScore.reputation,
        loveScore: userScore.love,
        viceScore: userScore.vice
      })
    });
    return response.json();
  };

  const syncWithBlockchain = async () => {
    if (!contracts.loveViceScore || !provider) return;
    
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();
    
    const score = await contracts.loveViceScore.userScores(userAddress);
    const reputation = await contracts.loveViceScore.getReputationScore(userAddress);
    
    setUserScore({
      love: score.loveScore.toNumber(),
      vice: score.viceScore.toNumber(),
      reputation: reputation.toNumber()
    });
    
    await connectToLovable(userAddress);
  };

  return (
    <div className="digital-twin-interface">
      <h2>Digital Twin - Lovable Integration</h2>
      
      {isConnected ? (
        <div>
          <div className="score-display">
            <p>Love Score: {userScore.love}</p>
            <p>Vice Score: {userScore.vice}</p>
            <p>Reputation: {userScore.reputation}</p>
          </div>
          
          <button onClick={syncWithBlockchain}>
            Sync with Blockchain
          </button>
        </div>
      ) : (
        <button onClick={initializeContracts}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

// Minimal ABIs for production
const LOVE_VICE_ABI = [
  "function userScores(address) view returns (uint256 loveScore, uint256 viceScore, uint256 lastUpdate, bool isActive)",
  "function getReputationScore(address) view returns (uint256)"
];

const AGENT_MARKETPLACE_ABI = [
  "function registerAgent(bytes32, string, uint256, string[])",
  "function requestTask(bytes32, string, uint256, uint256)"
];

const LIQUID_DEMOCRACY_ABI = [
  "function createProposal(bytes32, string, uint256)",
  "function vote(bytes32, bool)"
];

const ORCHESTRATOR_ABI = [
  "function createFlow(bytes32, address[], uint256[], bool)",
  "function getFlowStatus(bytes32) view returns (uint8, uint256, uint256, uint256)"
];

const ZK_VERIFIER_ABI = [
  "function verifyProof(bytes32, bytes32, bytes32, bytes32) view returns (bool)"
];