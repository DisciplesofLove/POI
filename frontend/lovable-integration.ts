import { ethers } from 'ethers';

export interface JoyNetContracts {
  LoveViceScore: string;
  AgentMarketplace: string;
  LiquidDemocracy: string;
  SelfHealingOrchestrator: string;
  ZKVerifier: string;
  JoyToken: string;
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
      joyToken: new ethers.Contract(this.contractAddresses.JoyToken, [
        "function balanceOf(address) view returns (uint256)",
        "function transfer(address, uint256) returns (bool)",
        "function approve(address, uint256) returns (bool)"
      ], signer),
      
      loveVice: new ethers.Contract(this.contractAddresses.LoveViceScore, [
        "function userScores(address) view returns (uint256 loveScore, uint256 viceScore, uint256 lastUpdate, bool isActive)",
        "function getReputationScore(address) view returns (uint256)"
      ], signer),
      
      marketplace: new ethers.Contract(this.contractAddresses.AgentMarketplace, [
        "function registerAgent(bytes32, string, uint256, string[])",
        "function requestTask(bytes32, string, uint256, uint256)",
        "function completeTask(bytes32)",
        "function agents(bytes32) view returns (address, string, uint256, string[], uint256, bool, uint256)"
      ], signer),
      
      governance: new ethers.Contract(this.contractAddresses.LiquidDemocracy, [
        "function createProposal(bytes32, string, uint256)",
        "function vote(bytes32, bool)",
        "function delegateVote(address, uint256)",
        "function getProposalStatus(bytes32) view returns (uint256, uint256, bool, bool)"
      ], signer),
      
      orchestrator: new ethers.Contract(this.contractAddresses.SelfHealingOrchestrator, [
        "function createFlow(bytes32, address[], uint256[], bool)",
        "function startFlow(bytes32)",
        "function getFlowStatus(bytes32) view returns (uint8, uint256, uint256, uint256)"
      ], signer),
      
      zkVerifier: new ethers.Contract(this.contractAddresses.ZKVerifier, [
        "function verifyProof(bytes32, bytes32, bytes32, bytes32) view returns (bool)",
        "function setVerificationKey(bytes32, bytes32, bytes32, bytes32)"
      ], signer)
    };
  }

  async connectWallet() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return this.provider.getSigner().getAddress();
  }

  async getUserData(address: string) {
    const [score, reputation, balance] = await Promise.all([
      this.contracts.loveVice.userScores(address),
      this.contracts.loveVice.getReputationScore(address),
      this.contracts.joyToken.balanceOf(address)
    ]);

    return {
      address,
      loveScore: score.loveScore.toNumber(),
      viceScore: score.viceScore.toNumber(),
      reputation: reputation.toNumber(),
      joyBalance: ethers.utils.formatEther(balance),
      lastUpdate: score.lastUpdate.toNumber()
    };
  }

  async registerAgent(agentId: string, metadata: string, price: string, capabilities: string[]) {
    const id = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(agentId));
    return this.contracts.marketplace.registerAgent(id, metadata, ethers.utils.parseEther(price), capabilities);
  }

  async requestTask(taskId: string, requirements: string, budget: string, deadline: number) {
    const id = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(taskId));
    const budgetWei = ethers.utils.parseEther(budget);
    await this.contracts.joyToken.approve(this.contractAddresses.AgentMarketplace, budgetWei);
    return this.contracts.marketplace.requestTask(id, requirements, budgetWei, deadline);
  }

  async createProposal(proposalId: string, description: string, votingPeriod: number = 86400) {
    const id = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proposalId));
    return this.contracts.governance.createProposal(id, description, votingPeriod);
  }

  async vote(proposalId: string, support: boolean) {
    const id = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proposalId));
    return this.contracts.governance.vote(id, support);
  }

  async createFlow(flowId: string, agents: string[], dependencies: number[], autoHeal: boolean = true) {
    const id = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(flowId));
    return this.contracts.orchestrator.createFlow(id, agents, dependencies, autoHeal);
  }
}

// Export for Lovable frontend integration
export const initJoyNet = (contractAddresses: JoyNetContracts) => {
  return new JoyNetConnector(contractAddresses);
};

// Contract addresses will be set after deployment
export const MAINNET_CONTRACTS: JoyNetContracts = {
  JoyToken: '',
  LoveViceScore: '',
  AgentMarketplace: '',
  LiquidDemocracy: '',
  SelfHealingOrchestrator: '',
  ZKVerifier: ''
};

// For development/testing
export const TESTNET_CONTRACTS: JoyNetContracts = {
  JoyToken: '',
  LoveViceScore: '',
  AgentMarketplace: '',
  LiquidDemocracy: '',
  SelfHealingOrchestrator: '',
  ZKVerifier: ''
};