const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integrated Components Test Suite", function () {
    let joyToken, loveViceScore, agentMarketplace, liquidDemocracy, selfHealingOrchestrator, zkVerifier;
    let owner, user1, user2, agent1, agent2;

    beforeEach(async function () {
        [owner, user1, user2, agent1, agent2] = await ethers.getSigners();

        // Deploy JoyToken
        const JoyToken = await ethers.getContractFactory("JoyToken");
        joyToken = await JoyToken.deploy();
        await joyToken.deployed();

        // Deploy LoveViceScore
        const LoveViceScore = await ethers.getContractFactory("LoveViceScore");
        loveViceScore = await LoveViceScore.deploy();
        await loveViceScore.deployed();

        // Deploy AgentMarketplace
        const AgentMarketplace = await ethers.getContractFactory("AgentMarketplace");
        agentMarketplace = await AgentMarketplace.deploy(joyToken.address, loveViceScore.address);
        await agentMarketplace.deployed();

        // Deploy LiquidDemocracy
        const LiquidDemocracy = await ethers.getContractFactory("LiquidDemocracy");
        liquidDemocracy = await LiquidDemocracy.deploy(loveViceScore.address);
        await liquidDemocracy.deployed();

        // Deploy SelfHealingOrchestrator
        const SelfHealingOrchestrator = await ethers.getContractFactory("SelfHealingOrchestrator");
        selfHealingOrchestrator = await SelfHealingOrchestrator.deploy();
        await selfHealingOrchestrator.deployed();

        // Deploy ZKVerifier
        const ZKVerifier = await ethers.getContractFactory("ZKVerifier");
        zkVerifier = await ZKVerifier.deploy();
        await zkVerifier.deployed();

        // Setup initial state
        await joyToken.mint(user1.address, ethers.utils.parseEther("1000"));
        await joyToken.mint(user2.address, ethers.utils.parseEther("1000"));
        await loveViceScore.authorizeScorer(owner.address);
    });

    describe("✅ Love and Vice Score System", function () {
        it("Should update love and vice scores correctly", async function () {
            await loveViceScore.updateScore(user1.address, 100, 20);
            
            const score = await loveViceScore.userScores(user1.address);
            expect(score.loveScore).to.equal(100);
            expect(score.viceScore).to.equal(20);
            
            const reputation = await loveViceScore.getReputationScore(user1.address);
            expect(reputation).to.equal(80); // 100 - 20
        });

        it("Should handle score bounds correctly", async function () {
            await loveViceScore.updateScore(user1.address, 1200, 0); // Over max
            
            const score = await loveViceScore.userScores(user1.address);
            expect(score.loveScore).to.equal(1000); // Capped at MAX_SCORE
        });
    });

    describe("✅ Agent Marketplace + Auto-Matching Engine", function () {
        it("Should register agents and auto-match tasks", async function () {
            // Set up user reputation
            await loveViceScore.updateScore(agent1.address, 200, 50);
            
            // Register agent
            const agentId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("agent1"));
            await agentMarketplace.connect(agent1).registerAgent(
                agentId,
                "AI Assistant Agent",
                ethers.utils.parseEther("10"),
                ["nlp", "reasoning"]
            );

            // Request task
            const taskId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("task1"));
            await joyToken.connect(user1).approve(agentMarketplace.address, ethers.utils.parseEther("50"));
            
            await agentMarketplace.connect(user1).requestTask(
                taskId,
                "Need NLP processing",
                ethers.utils.parseEther("50"),
                Math.floor(Date.now() / 1000) + 3600
            );

            const task = await agentMarketplace.taskRequests(taskId);
            expect(task.isMatched).to.be.true;
            expect(task.matchedAgent).to.equal(agentId);
        });

        it("Should complete tasks and update agent stats", async function () {
            // Setup and match task (similar to above)
            await loveViceScore.updateScore(agent1.address, 200, 50);
            
            const agentId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("agent1"));
            await agentMarketplace.connect(agent1).registerAgent(
                agentId,
                "AI Assistant Agent",
                ethers.utils.parseEther("10"),
                ["nlp"]
            );

            const taskId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("task1"));
            await joyToken.connect(user1).approve(agentMarketplace.address, ethers.utils.parseEther("50"));
            await agentMarketplace.connect(user1).requestTask(
                taskId,
                "Need NLP processing",
                ethers.utils.parseEther("50"),
                Math.floor(Date.now() / 1000) + 3600
            );

            // Complete task
            await agentMarketplace.connect(agent1).completeTask(taskId);
            
            const agent = await agentMarketplace.agents(agentId);
            expect(agent.completedTasks).to.equal(1);
        });
    });

    describe("✅ Liquid Democracy Governance", function () {
        it("Should create proposals and handle voting", async function () {
            // Set up reputation for proposal creation
            await loveViceScore.updateScore(user1.address, 200, 0);
            
            const proposalId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("proposal1"));
            await liquidDemocracy.connect(user1).createProposal(
                proposalId,
                "Increase platform fee to 3%",
                86400 // 1 day
            );

            // Set up voting power
            await loveViceScore.updateScore(user2.address, 150, 0);
            
            // Vote on proposal
            await liquidDemocracy.connect(user2).vote(proposalId, true);
            
            const status = await liquidDemocracy.getProposalStatus(proposalId);
            expect(status.forVotes).to.be.gt(0);
        });

        it("Should handle vote delegation", async function () {
            await loveViceScore.updateScore(user1.address, 100, 0);
            await loveViceScore.updateScore(user2.address, 200, 0);
            
            // Delegate votes
            await liquidDemocracy.connect(user1).delegateVote(user2.address, 50);
            
            const delegation = await liquidDemocracy.getDelegationInfo(user1.address);
            expect(delegation.delegate).to.equal(user2.address);
            expect(delegation.weight).to.equal(50);
            expect(delegation.isActive).to.be.true;
        });
    });

    describe("✅ Self-healing Orchestration Engine", function () {
        it("Should create and manage agent flows", async function () {
            const flowId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("flow1"));
            
            await selfHealingOrchestrator.createFlow(
                flowId,
                [agent1.address, agent2.address],
                [0, 1], // Dependencies
                true // Auto-heal enabled
            );

            await selfHealingOrchestrator.startFlow(flowId);
            
            const status = await selfHealingOrchestrator.getFlowStatus(flowId);
            expect(status.status).to.equal(1); // RUNNING
            expect(status.totalSteps).to.equal(2);
        });

        it("Should handle heartbeats and step completion", async function () {
            const flowId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("flow1"));
            
            await selfHealingOrchestrator.createFlow(
                flowId,
                [agent1.address, agent2.address],
                [0, 1],
                true
            );
            await selfHealingOrchestrator.startFlow(flowId);

            // Send heartbeat
            await selfHealingOrchestrator.connect(agent1).reportHeartbeat(flowId);
            
            // Complete step
            await selfHealingOrchestrator.connect(agent1).reportStepCompleted(flowId, 0);
            await selfHealingOrchestrator.connect(agent2).reportStepCompleted(flowId, 1);
            
            const status = await selfHealingOrchestrator.getFlowStatus(flowId);
            expect(status.completedSteps).to.equal(2);
            expect(status.status).to.equal(3); // COMPLETED
        });
    });

    describe("✅ Zero-Knowledge Validation Module", function () {
        it("Should set verification keys and verify proofs", async function () {
            const modelId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("model1"));
            const alpha = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("alpha"));
            const beta = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("beta"));
            const gamma = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("gamma"));
            
            await zkVerifier.setVerificationKey(modelId, alpha, beta, gamma);
            
            const vk = await zkVerifier.verificationKeys(modelId);
            expect(vk.isValid).to.be.true;
            expect(vk.alpha).to.equal(alpha);
        });

        it("Should verify zero-knowledge proofs", async function () {
            const modelId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("model1"));
            const alpha = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("alpha"));
            const beta = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("beta"));
            const gamma = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("gamma"));
            
            await zkVerifier.setVerificationKey(modelId, alpha, beta, gamma);
            
            const inputHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("input"));
            const outputHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("output"));
            
            // Generate expected proof
            const expectedProof = ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(
                    ["bytes32", "bytes32", "bytes32", "bytes32", "bytes32"],
                    [inputHash, outputHash, alpha, beta, gamma]
                )
            );
            
            const isValid = await zkVerifier.verifyProof(modelId, inputHash, outputHash, expectedProof);
            expect(isValid).to.be.true;
        });
    });

    describe("🔄 Integration Tests", function () {
        it("Should integrate all components in a complete workflow", async function () {
            // 1. Set up reputation scores
            await loveViceScore.updateScore(agent1.address, 300, 50);
            await loveViceScore.updateScore(user1.address, 200, 30);
            
            // 2. Register agent in marketplace
            const agentId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("integrated_agent"));
            await agentMarketplace.connect(agent1).registerAgent(
                agentId,
                "Full-service AI Agent",
                ethers.utils.parseEther("20"),
                ["nlp", "vision", "reasoning"]
            );
            
            // 3. Create governance proposal
            const proposalId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("integration_proposal"));
            await liquidDemocracy.connect(user1).createProposal(
                proposalId,
                "Approve new AI model validation standards",
                86400
            );
            
            // 4. Set up ZK verification
            const modelId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("integrated_model"));
            await zkVerifier.setVerificationKey(
                modelId,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("alpha_key")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("beta_key")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("gamma_key"))
            );
            
            // 5. Create orchestrated flow
            const flowId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("integrated_flow"));
            await selfHealingOrchestrator.createFlow(
                flowId,
                [agent1.address],
                [0],
                true
            );
            
            // Verify all components are working
            const agentInfo = await agentMarketplace.agents(agentId);
            const proposalStatus = await liquidDemocracy.getProposalStatus(proposalId);
            const vkInfo = await zkVerifier.verificationKeys(modelId);
            const flowStatus = await selfHealingOrchestrator.getFlowStatus(flowId);
            
            expect(agentInfo.isActive).to.be.true;
            expect(proposalStatus.isActive).to.be.true;
            expect(vkInfo.isValid).to.be.true;
            expect(flowStatus.status).to.equal(0); // PENDING
        });
    });
});