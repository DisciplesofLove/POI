const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JoyNet System", function () {
    let JoyToken;
    let ProofOfUse;
    let ProofOfIntegrity;
    let ProofOfInference;
    let PermaNetDomainRegistry;
    let PermaNetDAORegistry;
    
    let joyToken;
    let proofOfUse;
    let proofOfIntegrity;
    let proofOfInference;
    let domainRegistry;
    let daoRegistry;
    
    let owner;
    let addr1;
    let addr2;
    
    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        
        // Deploy contracts
        JoyToken = await ethers.getContractFactory("JoyToken");
        joyToken = await JoyToken.deploy();
        
        ProofOfUse = await ethers.getContractFactory("ProofOfUse");
        proofOfUse = await ProofOfUse.deploy();
        
        ProofOfIntegrity = await ethers.getContractFactory("ProofOfIntegrity");
        proofOfIntegrity = await ProofOfIntegrity.deploy();
        
        ProofOfInference = await ethers.getContractFactory("ProofOfInference");
        proofOfInference = await ProofOfInference.deploy(joyToken.address);
        
        PermaNetDomainRegistry = await ethers.getContractFactory("PermaNetDomainRegistry");
        domainRegistry = await PermaNetDomainRegistry.deploy(
            joyToken.address,
            proofOfUse.address,
            proofOfIntegrity.address,
            proofOfInference.address
        );
        
        PermaNetDAORegistry = await ethers.getContractFactory("PermaNetDAORegistry");
        daoRegistry = await PermaNetDAORegistry.deploy(
            domainRegistry.address,
            joyToken.address
        );
        
        // Setup
        const MINTER_ROLE = await joyToken.MINTER_ROLE();
        await joyToken.grantRole(MINTER_ROLE, proofOfInference.address);
        
        await proofOfUse.setDomainRegistry(domainRegistry.address);
        await proofOfIntegrity.setDomainRegistry(domainRegistry.address);
        await proofOfInference.setDomainRegistry(domainRegistry.address);
        
        // Transfer some JOY tokens to test accounts
        await joyToken.transfer(addr1.address, ethers.utils.parseEther("10000"));
        await joyToken.transfer(addr2.address, ethers.utils.parseEther("10000"));
    });
    
    describe("Domain Registration", function () {
        it("Should allow registering a new TLD", async function () {
            const price = await domainRegistry.calculateTldPrice("test");
            await joyToken.connect(addr1).approve(domainRegistry.address, price);
            await domainRegistry.connect(addr1).registerTld("test");
            
            expect(await domainRegistry.tldOwners("test")).to.equal(addr1.address);
        });
        
        it("Should allow registering a domain under a TLD", async function () {
            // First register TLD
            const price = await domainRegistry.calculateTldPrice("test");
            await joyToken.connect(addr1).approve(domainRegistry.address, price);
            await domainRegistry.connect(addr1).registerTld("test");
            
            // Then register domain
            await domainRegistry.connect(addr2).registerDomain("mydomain", "test", true, true, true);
            
            const domainInfo = await domainRegistry.getDomainInfo("mydomain", "test");
            expect(domainInfo.owner).to.equal(addr2.address);
            expect(domainInfo.pouEnabled).to.be.true;
            expect(domainInfo.poiEnabled).to.be.true;
            expect(domainInfo.poinfEnabled).to.be.true;
        });
    });
    
    describe("Proof of Use (POU)", function () {
        beforeEach(async function () {
            // Register TLD and domain
            const price = await domainRegistry.calculateTldPrice("test");
            await joyToken.connect(addr1).approve(domainRegistry.address, price);
            await domainRegistry.connect(addr1).registerTld("test");
            await domainRegistry.connect(addr2).registerDomain("mydomain", "test", true, false, false);
        });
        
        it("Should allow submitting POU", async function () {
            await proofOfUse.connect(addr2).submitProof(
                "mydomain",
                "test",
                "QmTest123"  // IOTA message ID
            );
            
            const pouStatus = await proofOfUse.getPOUStatus("mydomain", "test");
            expect(pouStatus.isActive).to.be.true;
            expect(pouStatus.lastProofHash).to.equal("QmTest123");
        });
        
        it("Should enforce POU compliance", async function () {
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [200 * 24 * 60 * 60]); // 200 days
            await ethers.provider.send("evm_mine");
            
            const isCompliant = await proofOfUse.checkPOUCompliance("mydomain", "test");
            expect(isCompliant).to.be.false;
        });
    });
    
    describe("Proof of Integrity (POI)", function () {
        beforeEach(async function () {
            // Register TLD and domain
            const price = await domainRegistry.calculateTldPrice("test");
            await joyToken.connect(addr1).approve(domainRegistry.address, price);
            await domainRegistry.connect(addr1).registerTld("test");
            await domainRegistry.connect(addr2).registerDomain("mydomain", "test", false, true, false);
        });
        
        it("Should allow submitting POI", async function () {
            await proofOfIntegrity.connect(addr2).submitIntegrityProof(
                "mydomain",
                "test",
                "QmModelHash123",
                "QmIotaMsg123",
                "v1"
            );
            
            const proof = await proofOfIntegrity.getCurrentProof("mydomain", "test");
            expect(proof.ipfsHash).to.equal("QmModelHash123");
            expect(proof.version).to.equal("v1");
        });
    });
    
    describe("Proof of Inference (POInf)", function () {
        beforeEach(async function () {
            // Register TLD and domain
            const price = await domainRegistry.calculateTldPrice("test");
            await joyToken.connect(addr1).approve(domainRegistry.address, price);
            await domainRegistry.connect(addr1).registerTld("test");
            await domainRegistry.connect(addr2).registerDomain("mydomain", "test", false, false, true);
            
            // Configure inference pricing
            await proofOfInference.connect(addr2).updateInferenceConfig(
                "mydomain",
                "test",
                ethers.utils.parseEther("1"), // 1 JOY per inference
                true,
                addr2.address
            );
        });
        
        it("Should process inference with payment", async function () {
            // Approve payment
            await joyToken.connect(addr1).approve(
                proofOfInference.address,
                ethers.utils.parseEther("1")
            );
            
            // Submit inference
            await proofOfInference.connect(addr1).submitInferenceProof(
                "mydomain",
                "test",
                "QmModelHash123",
                "QmInputHash123",
                "QmOutputHash123",
                "QmIotaMsg123"
            );
            
            const stats = await proofOfInference.getInferenceStats("mydomain", "test");
            expect(stats.total).to.equal(1);
            
            // Check payment
            const balance = await joyToken.balanceOf(addr2.address);
            expect(balance).to.equal(ethers.utils.parseEther("10001")); // Initial 10000 + 1 from inference
        });
    });
    
    describe("DAO Governance", function () {
        beforeEach(async function () {
            // Register TLD
            const price = await domainRegistry.calculateTldPrice("test");
            await joyToken.connect(addr1).approve(domainRegistry.address, price);
            await domainRegistry.connect(addr1).registerTld("test");
            
            // Create DAO
            await daoRegistry.connect(addr1).createTldDAO("test", addr1.address);
        });
        
        it("Should allow staking and creating proposals", async function () {
            // Approve and stake tokens
            await joyToken.connect(addr1).approve(
                daoRegistry.address,
                ethers.utils.parseEther("1000")
            );
            await daoRegistry.connect(addr1).stake("test", ethers.utils.parseEther("1000"));
            
            // Create proposal
            await daoRegistry.connect(addr1).createProposal(
                "test",
                "Change POU period to 90 days"
            );
            
            const proposal = await daoRegistry.getProposal("test", 0);
            expect(proposal.description).to.equal("Change POU period to 90 days");
            expect(proposal.proposer).to.equal(addr1.address);
        });
    });
});