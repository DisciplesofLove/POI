const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Decentralized Infrastructure", function () {
    let JoyToken;
    let EnhancedSovereignRPC;
    let NodeCoordinator;
    let ProofOfUse;
    let joyToken;
    let rpcContract;
    let nodeCoordinator;
    let proofOfUse;
    let owner;
    let node1;
    let node2;
    let user1;
    let user2;

    beforeEach(async function () {
        // Get signers
        [owner, node1, node2, user1, user2] = await ethers.getSigners();

        // Deploy JoyToken
        JoyToken = await ethers.getContractFactory("JoyToken");
        joyToken = await JoyToken.deploy();
        await joyToken.deployed();

        // Deploy EnhancedSovereignRPC
        EnhancedSovereignRPC = await ethers.getContractFactory("EnhancedSovereignRPC");
        rpcContract = await EnhancedSovereignRPC.deploy(joyToken.address, owner.address);
        await rpcContract.deployed();

        // Deploy NodeCoordinator
        NodeCoordinator = await ethers.getContractFactory("NodeCoordinator");
        nodeCoordinator = await NodeCoordinator.deploy(rpcContract.address, joyToken.address);
        await nodeCoordinator.deployed();

        // Deploy ProofOfUse
        ProofOfUse = await ethers.getContractFactory("ProofOfUse");
        proofOfUse = await ProofOfUse.deploy(rpcContract.address);
        await proofOfUse.deployed();

        // Setup roles and initial state
        const MINTER_ROLE = await joyToken.MINTER_ROLE();
        const FEE_MANAGER_ROLE = await joyToken.FEE_MANAGER_ROLE();

        await joyToken.grantRole(MINTER_ROLE, rpcContract.address);
        await joyToken.grantRole(FEE_MANAGER_ROLE, rpcContract.address);
        await joyToken.grantRole(MINTER_ROLE, nodeCoordinator.address);
        await joyToken.grantRole(FEE_MANAGER_ROLE, nodeCoordinator.address);

        // Mint initial tokens for testing
        await joyToken.mint(owner.address, ethers.utils.parseEther("1000000"));
        await joyToken.mint(node1.address, ethers.utils.parseEther("10000"));
        await joyToken.mint(node2.address, ethers.utils.parseEther("10000"));
        await joyToken.mint(user1.address, ethers.utils.parseEther("1000"));
        await joyToken.mint(user2.address, ethers.utils.parseEther("1000"));
    });

    describe("JoyToken", function () {
        it("Should handle basic token operations", async function () {
            expect(await joyToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("1000000"));
            
            // Transfer tokens
            await joyToken.transfer(user1.address, ethers.utils.parseEther("1000"));
            expect(await joyToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("2000"));
        });

        it("Should handle staking operations", async function () {
            const stakeAmount = ethers.utils.parseEther("1000");
            
            // Approve and stake
            await joyToken.connect(user1).approve(joyToken.address, stakeAmount);
            await joyToken.connect(user1).stake(stakeAmount);

            const stakeInfo = await joyToken.getStakeInfo(user1.address);
            expect(stakeInfo.amount).to.equal(stakeAmount);
        });
    });

    describe("EnhancedSovereignRPC", function () {
        it("Should register nodes correctly", async function () {
            const deposit = ethers.utils.parseEther("1000");
            await joyToken.connect(node1).approve(rpcContract.address, deposit);
            
            await rpcContract.connect(node1).registerNode("http://node1.joynet.network:8545");
            const nodeInfo = await rpcContract.nodes(node1.address);
            
            expect(nodeInfo.isActive).to.be.true;
            expect(nodeInfo.endpoint).to.equal("http://node1.joynet.network:8545");
        });

        it("Should handle data caching", async function () {
            const contentHash = ethers.utils.id("testdata");
            await rpcContract.connect(node1).cacheData(contentHash, 3600); // 1 hour cache
            
            const nodeInfo = await rpcContract.nodes(node1.address);
            expect(await rpcContract.connect(user1).getBestNode()).to.not.equal(ethers.constants.AddressZero);
        });
    });

    describe("NodeCoordinator", function () {
        beforeEach(async function () {
            // Add test region
            await nodeCoordinator.addRegion(
                ethers.utils.formatBytes32String("test-region"),
                5 // target nodes
            );
        });

        it("Should handle health checks", async function () {
            await nodeCoordinator.connect(node1).submitHealthCheck(
                100, // latency
                50,  // CPU usage
                60,  // memory usage
                ethers.utils.formatBytes32String("test-region")
            );

            const health = await nodeCoordinator.getNodeHealth(node1.address);
            expect(health.isHealthy).to.be.true;
        });

        it("Should handle node scaling", async function () {
            await nodeCoordinator.checkScaling();
            const stats = await nodeCoordinator.getRegionStats(
                ethers.utils.formatBytes32String("test-region")
            );
            expect(stats.targetNodes).to.be.gt(0);
        });
    });

    describe("ProofOfUse", function () {
        beforeEach(async function () {
            // Add verifier
            await proofOfUse.addVerifier(owner.address);
        });

        it("Should handle usage proofs", async function () {
            const contentHash = ethers.utils.id("testcontent");
            const metadataHash = ethers.utils.id("testmetadata");
            
            // Create signature
            const messageHash = ethers.utils.solidityKeccak256(
                ["bytes32", "address", "uint256", "uint8", "bytes32"],
                [contentHash, user1.address, await ethers.provider.getBlockNumber(), 0, metadataHash]
            );
            const signature = await user1.signMessage(ethers.utils.arrayify(messageHash));

            await proofOfUse.connect(user1).submitUsageProof(
                contentHash,
                0, // ProofType.USE
                metadataHash,
                signature
            );

            const proofId = ethers.utils.solidityKeccak256(
                ["bytes32", "address", "uint256", "uint8", "bytes32"],
                [contentHash, user1.address, await ethers.provider.getBlockNumber(), 0, metadataHash]
            );

            await proofOfUse.connect(owner).verifyProof(proofId);
            const proofDetails = await proofOfUse.getProofDetails(proofId);
            expect(proofDetails.user).to.equal(user1.address);
        });

        it("Should handle data integrity proofs", async function () {
            const originalHash = ethers.utils.id("original");
            const replicaHashes = [
                ethers.utils.id("replica1"),
                ethers.utils.id("replica2"),
                ethers.utils.id("replica3")
            ];

            await proofOfUse.connect(owner).submitIntegrityProof(
                originalHash,
                replicaHashes
            );

            const proofId = ethers.utils.solidityKeccak256(
                ["bytes32", "uint256"],
                [originalHash, await ethers.provider.getBlockNumber()]
            );

            const proofDetails = await proofOfUse.getIntegrityProofDetails(proofId);
            expect(proofDetails.originalHash).to.equal(originalHash);
            expect(proofDetails.replicaCount).to.equal(3);
        });
    });

    describe("Integration Tests", function () {
        it("Should handle complete flow from node registration to proof verification", async function () {
            // 1. Register node
            const deposit = ethers.utils.parseEther("1000");
            await joyToken.connect(node1).approve(rpcContract.address, deposit);
            await rpcContract.connect(node1).registerNode("http://node1.joynet.network:8545");

            // 2. Submit health check
            await nodeCoordinator.connect(node1).submitHealthCheck(
                100, // latency
                50,  // CPU usage
                60,  // memory usage
                ethers.utils.formatBytes32String("test-region")
            );

            // 3. Cache data
            const contentHash = ethers.utils.id("testdata");
            await rpcContract.connect(node1).cacheData(contentHash, 3600);

            // 4. Submit and verify proof
            const metadataHash = ethers.utils.id("testmetadata");
            const messageHash = ethers.utils.solidityKeccak256(
                ["bytes32", "address", "uint256", "uint8", "bytes32"],
                [contentHash, user1.address, await ethers.provider.getBlockNumber(), 0, metadataHash]
            );
            const signature = await user1.signMessage(ethers.utils.arrayify(messageHash));

            await proofOfUse.connect(user1).submitUsageProof(
                contentHash,
                0,
                metadataHash,
                signature
            );

            // 5. Verify everything is working
            const nodeInfo = await rpcContract.nodes(node1.address);
            expect(nodeInfo.isActive).to.be.true;

            const health = await nodeCoordinator.getNodeHealth(node1.address);
            expect(health.isHealthy).to.be.true;

            const [bestNode, endpoint] = await rpcContract.connect(user1).getBestNode();
            expect(bestNode).to.equal(node1.address);
            expect(endpoint).to.equal("http://node1.joynet.network:8545");
        });
    });
});