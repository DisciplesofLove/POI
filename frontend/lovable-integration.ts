import { ethers } from 'ethers';

export interface JoyNetContracts {
  JoyToken: string;
  LoveViceScore: string;
  AgentMarketplace: string;
  LiquidDemocracy: string;
  SelfHealingOrchestrator: string;
  ZKVerifier: string;
  ProofOfInference: string;
  NodeCoordinator: string;
  SovereignRPC: string;
  ModelMarketplace: string;
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
      ], signer),
      
      proofOfInference: new ethers.Contract(this.contractAddresses.ProofOfInference, [
        "function registerValidator(uint256)",
        "function submitInference(bytes32, bytes32, bytes32, bytes32) returns (bytes32)",
        "function validateInference(bytes32)",
        "function validators(address) view returns (uint256, bool, uint256)"
      ], signer),
      
      nodeCoordinator: new ethers.Contract(this.contractAddresses.NodeCoordinator, [
        "function registerNode(string, uint256, uint256)",
        "function createTask(bytes32) returns (bytes32)",
        "function completeTask(bytes32, bytes32)",
        "function sendHeartbeat()",
        "function nodes(address) view returns (string, uint256, uint256, uint256, bool, uint256)"
      ], signer),
      
      sovereignRPC: new ethers.Contract(this.contractAddresses.SovereignRPC, [
        "function registerNode(string)",
        "function heartbeat(string)",
        "function recordDataStorage(string, address[], bytes32)",
        "function recordDataRetrieval(string)",
        "function isNodeActive(address) view returns (bool)"
      ], signer),
      
      modelMarketplace: new ethers.Contract(this.contractAddresses.ModelMarketplace, [
        "function registerModel(bytes32, string, uint256, address)",
        "function purchaseModel(bytes32) payable",
        "function executeInference(bytes32, bytes) returns (bytes32)",
        "function models(bytes32) view returns (address, string, uint256, bool)"
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

  // Free AI Inference Methods
  async registerAsValidator(stakeAmount: string) {
    const amount = ethers.utils.parseEther(stakeAmount);
    await this.contracts.joyToken.approve(this.contractAddresses.ProofOfInference, amount);
    return this.contracts.proofOfInference.registerValidator(amount);
  }

  async registerComputeNode(ip: string, capacity: number, stakeAmount: string) {
    const amount = ethers.utils.parseEther(stakeAmount);
    await this.contracts.joyToken.approve(this.contractAddresses.NodeCoordinator, amount);
    return this.contracts.nodeCoordinator.registerNode(ip, capacity, amount);
  }

  async registerRPCNode(endpoint: string) {
    return this.contracts.sovereignRPC.registerNode(endpoint);
  }

  async executeInference(modelId: string, inputData: string) {
    const id = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(modelId));
    const taskId = await this.contracts.nodeCoordinator.createTask(id);
    return this.contracts.modelMarketplace.executeInference(id, ethers.utils.toUtf8Bytes(inputData));
  }

  async submitInferenceProof(modelId: string, inputHash: string, outputHash: string, zkProof: string) {
    const mId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(modelId));
    const iHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(inputHash));
    const oHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(outputHash));
    const proof = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(zkProof));
    return this.contracts.proofOfInference.submitInference(mId, iHash, oHash, proof);
  }

  async sendNodeHeartbeat() {
    return this.contracts.nodeCoordinator.sendHeartbeat();
  }

  async sendRPCHeartbeat(metrics: string) {
    return this.contracts.sovereignRPC.heartbeat(metrics);
  }
}

// Export for Lovable frontend integration
export const initJoyNet = (contractAddresses: JoyNetContracts) => {
  return new JoyNetConnector(contractAddresses);
};

// Helper functions for free inference
export const startFreeInference = async (joynet: JoyNetConnector, modelId: string, input: string) => {
  const executionId = await joynet.executeInference(modelId, input);
  return executionId;
};

export const becomeValidator = async (joynet: JoyNetConnector, stakeAmount: string) => {
  return joynet.registerAsValidator(stakeAmount);
};

export const becomeComputeNode = async (joynet: JoyNetConnector, ip: string, capacity: number, stake: string) => {
  return joynet.registerComputeNode(ip, capacity, stake);
};

export const becomeRPCNode = async (joynet: JoyNetConnector, endpoint: string) => {
  return joynet.registerRPCNode(endpoint);
};

// Contract addresses will be set after deployment
export const MAINNET_CONTRACTS: JoyNetContracts = {
  JoyToken: '',
  LoveViceScore: '',
  AgentMarketplace: '',
  LiquidDemocracy: '',
  SelfHealingOrchestrator: '',
  ZKVerifier: '',
  ProofOfInference: '',
  NodeCoordinator: '',
  SovereignRPC: '',
  ModelMarketplace: ''
};

// For development/testing
export const TESTNET_CONTRACTS: JoyNetContracts = {
  JoyToken: '',
  LoveViceScore: '',
  AgentMarketplace: '',
  LiquidDemocracy: '',
  SelfHealingOrchestrator: '',
  ZKVerifier: '',
  ProofOfInference: '',
  NodeCoordinator: '',
  SovereignRPC: '',
  ModelMarketplace: ''
};