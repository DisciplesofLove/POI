const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoveAndViceScore", function () {
    let LoveAndViceScore;
    let loveAndViceScore;
    let owner;
    let curator;
    let user1;
    let user2;
    let asset1;
    let asset2;

    beforeEach(async function () {
        [owner, curator, user1, user2, asset1, asset2] = await ethers.getSigners();

        LoveAndViceScore = await ethers.getContractFactory("LoveAndViceScore");
        loveAndViceScore = await LoveAndViceScore.deploy();
        await loveAndViceScore.deployed();

        // Grant curator role
        const CURATOR_ROLE = await loveAndViceScore.CURATOR_ROLE();
        await loveAndViceScore.grantRole(CURATOR_ROLE, curator.address);
    });

    describe("Asset Registration", function () {
        it("Should allow curator to register new assets", async function () {
            await loveAndViceScore.connect(curator).registerAsset(asset1.address);
            const assetScore = await loveAndViceScore.assetScores(asset1.address);
            expect(assetScore.isActive).to.equal(true);
            expect(assetScore.loveScore).to.equal(50); // Default neutral score
        });

        it("Should prevent non-curators from registering assets", async function () {
            await expect(
                loveAndViceScore.connect(user1).registerAsset(asset1.address)
            ).to.be.reverted;
        });
    });

    describe("Score Submission", function () {
        beforeEach(async function () {
            await loveAndViceScore.connect(curator).registerAsset(asset1.address);
        });

        it("Should allow users to submit ratings", async function () {
            await loveAndViceScore.connect(user1).submitRating(asset1.address, 80, 20);
            const assetScore = await loveAndViceScore.assetScores(asset1.address);
            expect(assetScore.loveScore).to.equal(80);
            expect(assetScore.viceScore).to.equal(20);
            expect(assetScore.totalRatings).to.equal(1);
        });

        it("Should reject invalid score values", async function () {
            await expect(
                loveAndViceScore.connect(user1).submitRating(asset1.address, 101, 20)
            ).to.be.revertedWith("Love score must be <= 100");

            await expect(
                loveAndViceScore.connect(user1).submitRating(asset1.address, 80, 101)
            ).to.be.revertedWith("Vice score must be <= 100");
        });
    });

    describe("Voting Multiplier Calculation", function () {
        beforeEach(async function () {
            await loveAndViceScore.connect(curator).registerAsset(asset1.address);
        });

        it("Should calculate base multiplier for new users", async function () {
            const multiplier = await loveAndViceScore.calculateVotingMultiplier(user1.address);
            expect(multiplier).to.equal(100); // Base multiplier
        });

        it("Should boost multiplier for high love scores", async function () {
            await loveAndViceScore.connect(user1).submitRating(asset1.address, 90, 10);
            // Note: In a real test, we'd need to mock the asset ownership
            const multiplier = await loveAndViceScore.calculateVotingMultiplier(asset1.address);
            expect(multiplier).to.be.gt(100); // Should be boosted
        });
    });

    describe("Ethical Council Management", function () {
        it("Should allow governance to set ethical council status", async function () {
            const GOVERNANCE_ROLE = await loveAndViceScore.GOVERNANCE_ROLE();
            await loveAndViceScore.grantRole(GOVERNANCE_ROLE, owner.address);

            await loveAndViceScore.setEthicalCouncilStatus(user1.address, true);
            const userRep = await loveAndViceScore.userReputations(user1.address);
            expect(userRep.isEthicalCouncil).to.equal(true);
        });
    });

    describe("Contract Pause Functionality", function () {
        it("Should allow admin to pause and unpause", async function () {
            await loveAndViceScore.pause();
            await expect(
                loveAndViceScore.connect(user1).submitRating(asset1.address, 80, 20)
            ).to.be.reverted;

            await loveAndViceScore.unpause();
            await loveAndViceScore.connect(curator).registerAsset(asset1.address);
            await loveAndViceScore.connect(user1).submitRating(asset1.address, 80, 20);
        });
    });
});