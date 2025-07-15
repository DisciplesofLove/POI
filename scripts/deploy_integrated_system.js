const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying JoyNet Integrated System...\n");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // 1. Deploy JoyToken
    console.log("\n📄 Deploying JoyToken...");
    const JoyToken = await ethers.getContractFactory("JoyToken");
    const joyToken = await JoyToken.deploy();
    await joyToken.deployed();
    console.log("✅ JoyToken deployed to:", joyToken.address);

    // 2. Deploy Love and Vice Score System
    console.log("\n❤️ Deploying LoveViceScore...");
    const LoveViceScore = await ethers.getContractFactory("LoveViceScore");
    const loveViceScore = await LoveViceScore.deploy();
    await loveViceScore.deployed();
    console.log("✅ LoveViceScore deployed to:", loveViceScore.address);

    // 3. Deploy Agent Marketplace with Auto-Matching
    console.log("\n🤖 Deploying AgentMarketplace...");
    const AgentMarketplace = await ethers.getContractFactory("AgentMarketplace");
    const agentMarketplace = await AgentMarketplace.deploy(joyToken.address, loveViceScore.address);
    await agentMarketplace.deployed();
    console.log("✅ AgentMarketplace deployed to:", agentMarketplace.address);

    // 4. Deploy Liquid Democracy Governance
    console.log("\n🗳️ Deploying LiquidDemocracy...");
    const LiquidDemocracy = await ethers.getContractFactory("LiquidDemocracy");
    const liquidDemocracy = await LiquidDemocracy.deploy(loveViceScore.address);
    await liquidDemocracy.deployed();
    console.log("✅ LiquidDemocracy deployed to:", liquidDemocracy.address);

    // 5. Deploy Self-healing Orchestration Engine
    console.log("\n🔄 Deploying SelfHealingOrchestrator...");
    const SelfHealingOrchestrator = await ethers.getContractFactory("SelfHealingOrchestrator");
    const selfHealingOrchestrator = await SelfHealingOrchestrator.deploy();
    await selfHealingOrchestrator.deployed();
    console.log("✅ SelfHealingOrchestrator deployed to:", selfHealingOrchestrator.address);

    // 6. Deploy Zero-Knowledge Validation Module
    console.log("\n🔐 Deploying ZKVerifier...");
    const ZKVerifier = await ethers.getContractFactory("ZKVerifier");
    const zkVerifier = await ZKVerifier.deploy();
    await zkVerifier.deployed();
    console.log("✅ ZKVerifier deployed to:", zkVerifier.address);

    // 7. Setup initial configurations
    console.log("\n⚙️ Setting up initial configurations...");
    
    // Authorize deployer as scorer
    await loveViceScore.authorizeScorer(deployer.address);
    console.log("✅ Deployer authorized as scorer");

    // Mint initial tokens for testing
    const initialSupply = ethers.utils.parseEther("1000000");
    await joyToken.mint(deployer.address, initialSupply);
    console.log("✅ Initial tokens minted");

    // 8. Verify integrations
    console.log("\n🔍 Verifying integrations...");
    
    // Test Love/Vice score
    await loveViceScore.updateScore(deployer.address, 100, 20);
    const reputation = await loveViceScore.getReputationScore(deployer.address);
    console.log("✅ Love/Vice Score working - Reputation:", reputation.toString());

    // Test agent registration
    const agentId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_agent"));
    await agentMarketplace.registerAgent(
        agentId,
        "Test AI Agent",
        ethers.utils.parseEther("10"),
        ["nlp", "vision"]
    );
    console.log("✅ Agent Marketplace working - Agent registered");

    // Test governance proposal
    const proposalId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_proposal"));
    await liquidDemocracy.createProposal(
        proposalId,
        "Test governance proposal",
        86400
    );
    console.log("✅ Liquid Democracy working - Proposal created");

    // Test orchestration flow
    const flowId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_flow"));
    await selfHealingOrchestrator.createFlow(
        flowId,
        [deployer.address],
        [0],
        true
    );
    console.log("✅ Self-healing Orchestrator working - Flow created");

    // Test ZK verification setup
    const modelId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test_model"));
    await zkVerifier.setVerificationKey(
        modelId,
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("alpha")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("beta")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("gamma"))
    );
    console.log("✅ ZK Verifier working - Verification key set");

    // 9. Output deployment summary
    console.log("\n📋 DEPLOYMENT SUMMARY");
    console.log("====================");
    console.log("JoyToken:", joyToken.address);
    console.log("LoveViceScore:", loveViceScore.address);
    console.log("AgentMarketplace:", agentMarketplace.address);
    console.log("LiquidDemocracy:", liquidDemocracy.address);
    console.log("SelfHealingOrchestrator:", selfHealingOrchestrator.address);
    console.log("ZKVerifier:", zkVerifier.address);

    // 10. Save deployment info
    const deploymentInfo = {
        network: network.name,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            JoyToken: joyToken.address,
            LoveViceScore: loveViceScore.address,
            AgentMarketplace: agentMarketplace.address,
            LiquidDemocracy: liquidDemocracy.address,
            SelfHealingOrchestrator: selfHealingOrchestrator.address,
            ZKVerifier: zkVerifier.address
        }
    };

    console.log("\n✅ All components deployed and verified successfully!");
    console.log("🎉 JoyNet Integrated System is ready for use!");
    
    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });