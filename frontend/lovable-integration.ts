import { ethers } from 'ethers';

export interface JoyNetContracts {
  LoveViceScore: string;
  AgentMarketplace: string;
  LiquidDemocracy: string;
  SelfHealingOrchestrator: string;
  ZKVerifier: string;
}

export class JoyNetConnector {
  private provider: ethers.providers.Web3Provider;
  private contracts: any = {};

  constructor(private contractAddresses: JoyNetContracts) {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.initContracts();
  }

  private initContracts() {
    const signer = this.provider.getSigner();
    
    this.contracts = {
      loveVice: new ethers.Contract(this.contractAddresses.LoveViceScore, [
        "function userScores(address) view returns (uint256 loveScore, uint256 viceScore, uint256 lastUpdate, bool isActive)",
        "function getReputationScore(address) view returns (uint256)",
        "function updateScore(address, int256, int256)"
      ], signer),
      
      marketplace: new ethers.Contract(this.contractAddresses.AgentMarketplace, [
        "function registerAgent(bytes32, string, uint256, string[])",
        "function requestTask(bytes32, string, uint256, uint256)",
        "function agents(bytes32) view returns (address, string, uint256, string[], uint256, bool, uint256)"
      ], signer),
      
      governance: new ethers.Contract(this.contractAddresses.LiquidDemocracy, [
        "function createProposal(bytes32, string, uint256)",
        "function vote(bytes32, bool)",
        "function getProposalStatus(bytes32) view returns (uint256, uint256, bool, bool)"
      ], signer)
    };
  }

  async getUserData(address: string) {
    const [score, reputation] = await Promise.all([
      this.contracts.loveVice.userScores(address),
      this.contracts.loveVice.getReputationScore(address)
    ]);

    return {
      address,
      loveScore: score.loveScore.toNumber(),
      viceScore: score.viceScore.toNumber(),
      reputation: reputation.toNumber(),
      lastUpdate: score.lastUpdate.toNumber()
    };
  }

  async registerAgent(agentId: string, metadata: string, price: string, capabilities: string[]) {
    const id = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(agentId));
    return this.contracts.marketplace.registerAgent(id, metadata, ethers.utils.parseEther(price), capabilities);
  }

  async createProposal(proposalId: string, description: string, votingPeriod: number = 86400) {
    const id = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proposalId));
    return this.contracts.governance.createProposal(id, description, votingPeriod);
  }
}

// Export for Lovable frontend integration
export const initJoyNet = (contractAddresses: JoyNetContracts) => {
  return new JoyNetConnector(contractAddresses);
};