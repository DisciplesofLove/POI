const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EthicalModelGovernanceDAO", function () {
    let Token;
    let token;
    let TimelockController;
    let timelock;
    let LoveAndViceScore;
    let loveAndViceScore;
    let EthicalModelGovernanceDAO;
    let governance;
    let owner;
    let proposer;
    let voter1;
    let voter2;

    const VOTING_DELAY = 1;
    const VOTING_PERIOD = 5760; // About 1 day
    const QUORUM_PERCENTAGE = 4; // 4%

    beforeEach(async function () {
        [owner, proposer, voter1, voter2] = await ethers.getSigners();

        // Deploy governance token
        Token = await ethers.getContractFactory("GovernanceToken"); // You'll need to create this
        token = await Token.deploy();
        await token.deployed();

        // Deploy timelock
        TimelockController = await ethers.getContractFactory("TimelockController");
        timelock = await TimelockController.deploy(
            1, // Minimum delay
            [owner.address], // Proposers
            [owner.address], // Executors
            owner.address // Admin
        );
        await timelock.deployed();

        // Deploy Love and Vice Score system
        LoveAndViceScore = await ethers.getContractFactory("LoveAndViceScore");
        loveAndViceScore = await LoveAndViceScore.deploy();
        await loveAndViceScore.deployed();

        // Deploy governance
        EthicalModelGovernanceDAO = await ethers.getContractFactory("EthicalModelGovernanceDAO");
        governance = await EthicalModelGovernanceDAO.deploy(
            token.address,
            timelock.address,
            VOTING_DELAY,
            VOTING_PERIOD,
            QUORUM_PERCENTAGE,
            loveAndViceScore.address
        );
        await governance.deployed();

        // Setup roles and initial state
        await token.delegate(owner.address);
        await token.delegate(proposer.address);
        await token.delegate(voter1.address);
        await token.delegate(voter2.address);

        // Mint some tokens
        await token.mint(proposer.address, ethers.utils.parseEther("100"));
        await token.mint(voter1.address, ethers.utils.parseEther("100"));
        await token.mint(voter2.address, ethers.utils.parseEther("100"));

        // Setup Love Scores
        const CURATOR_ROLE = await loveAndViceScore.CURATOR_ROLE();
        await loveAndViceScore.grantRole(CURATOR_ROLE, owner.address);
        
        // Register users as assets (simplified for testing)
        await loveAndViceScore.registerAsset(proposer.address);
        await loveAndViceScore.registerAsset(voter1.address);
        await loveAndViceScore.registerAsset(voter2.address);
        
        // Give good scores to proposer and voter1
        await loveAndViceScore.submitRating(proposer.address, 85, 10);
        await loveAndViceScore.submitRating(voter1.address, 90, 5);
        // Give lower scores to voter2
        await loveAndViceScore.submitRating(voter2.address, 60, 30);
    });

    describe("Proposal Creation", function () {
        it("Should allow proposals from users with sufficient Love Score", async function () {
            const proposalDescription = "Test Proposal";
            const encodedFunction = token.interface.encodeFunctionData("mint", [
                proposer.address,
                ethers.utils.parseEther("1"),
            ]);

            await expect(
                governance.connect(proposer).propose(
                    [token.address],
                    [0],
                    [encodedFunction],
                    proposalDescription
                )
            ).to.not.be.reverted;
        });

        it("Should reject proposals from users with insufficient Love Score", async function () {
            const proposalDescription = "Test Proposal";
            const encodedFunction = token.interface.encodeFunctionData("mint", [
                voter2.address,
                ethers.utils.parseEther("1"),
            ]);

            await expect(
                governance.connect(voter2).propose(
                    [token.address],
                    [0],
                    [encodedFunction],
                    proposalDescription
                )
            ).to.be.revertedWith("Insufficient Love Score to create proposal");
        });
    });

    describe("Ethical Voting", function () {
        let proposalId;

        beforeEach(async function () {
            const proposalDescription = "Ethical Test Proposal privacy";
            const encodedFunction = token.interface.encodeFunctionData("mint", [
                proposer.address,
                ethers.utils.parseEther("1"),
            ]);

            await governance.connect(proposer).propose(
                [token.address],
                [0],
                [encodedFunction],
                proposalDescription
            );

            proposalId = await governance.hashProposal(
                [token.address],
                [0],
                [encodedFunction],
                ethers.utils.id(proposalDescription)
            );

            await ethers.provider.send("evm_mine", []); // Mine a block to move past voting delay
        });

        it("Should apply Love Score multipliers to votes", async function () {
            await governance.connect(voter1).castVote(proposalId, 1); // Support
            
            const votingPower = await governance.getEthicalVotingPower(voter1.address);
            expect(votingPower).to.be.gt(ethers.utils.parseEther("100")); // Should be boosted
        });

        it("Should require higher Love Score for ethics-sensitive proposals", async function () {
            // This test assumes the proposal was tagged as ethics-sensitive due to "privacy" keyword
            await expect(
                governance.connect(voter2).castVote(proposalId, 1)
            ).to.be.revertedWith("Insufficient Love Score for ethics-sensitive proposal");
        });
    });

    describe("Quorum Calculation", function () {
        it("Should require higher quorum for ethics-sensitive proposals", async function () {
            const proposalDescription = "Ethical Test Proposal privacy";
            const encodedFunction = token.interface.encodeFunctionData("mint", [
                proposer.address,
                ethers.utils.parseEther("1"),
            ]);

            await governance.connect(proposer).propose(
                [token.address],
                [0],
                [encodedFunction],
                proposalDescription
            );

            const blockNumber = await ethers.provider.getBlockNumber();
            const quorum = await governance.quorum(blockNumber);
            
            // Should be higher than base quorum for ethics-sensitive proposals
            expect(quorum).to.be.gt(
                ethers.utils.parseEther("100").mul(QUORUM_PERCENTAGE).div(100)
            );
        });
    });
});