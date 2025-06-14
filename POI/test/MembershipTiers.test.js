const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MembershipTiers", function () {
    let MembershipTiers, JoyToken, TreasuryDistributor;
    let membershipTiers, joyToken, treasuryDistributor;
    let owner, user1, user2, treasury;
    
    beforeEach(async function () {
        [owner, user1, user2, treasury] = await ethers.getSigners();
        
        // Deploy JoyToken
        JoyToken = await ethers.getContractFactory("JoyToken");
        joyToken = await JoyToken.deploy();
        await joyToken.deployed();
        
        // Deploy TreasuryDistributor
        TreasuryDistributor = await ethers.getContractFactory("TreasuryDistributor");
        treasuryDistributor = await TreasuryDistributor.deploy(
            joyToken.address,
            treasury.address,
            treasury.address,
            treasury.address,
            treasury.address
        );
        await treasuryDistributor.deployed();
        
        // Deploy MembershipTiers
        MembershipTiers = await ethers.getContractFactory("MembershipTiers");
        membershipTiers = await MembershipTiers.deploy(
            joyToken.address,
            treasuryDistributor.address
        );
        await membershipTiers.deployed();
        
        // Mint tokens for testing
        await joyToken.mint(user1.address, ethers.utils.parseEther("10000"));
        await joyToken.mint(user2.address, ethers.utils.parseEther("10000"));
        
        // Approve spending
        await joyToken.connect(user1).approve(membershipTiers.address, ethers.utils.parseEther("10000"));
        await joyToken.connect(user2).approve(membershipTiers.address, ethers.utils.parseEther("10000"));
    });
    
    describe("Membership Purchase", function () {
        it("Should allow purchasing Premium membership", async function () {
            await membershipTiers.connect(user1).purchaseMembership(1, false); // Premium monthly
            
            const membership = await membershipTiers.getMembership(user1.address);
            expect(membership.tier).to.equal(1); // Premium tier
            expect(membership.computePriority).to.equal(50);
            expect(membership.bridgingDiscount).to.equal(20);
            expect(membership.domainDiscount).to.equal(15);
        });
        
        it("Should allow purchasing Enterprise membership", async function () {
            await membershipTiers.connect(user1).purchaseMembership(2, true); // Enterprise annual
            
            const membership = await membershipTiers.getMembership(user1.address);
            expect(membership.tier).to.equal(2); // Enterprise tier
            expect(membership.computePriority).to.equal(100);
            expect(membership.bridgingDiscount).to.equal(50);
            expect(membership.domainDiscount).to.equal(30);
        });
        
        it("Should not allow purchasing Basic tier", async function () {
            await expect(
                membershipTiers.connect(user1).purchaseMembership(0, false)
            ).to.be.revertedWith("Basic tier is free");
        });
        
        it("Should apply platform fee on membership purchase", async function () {
            const premiumMonthlyFee = ethers.utils.parseEther("20");
            const platformFeeBps = 250; // 2.5%
            const platformFee = premiumMonthlyFee.mul(platformFeeBps).div(10000);
            
            const initialTreasuryBalance = await joyToken.balanceOf(treasury.address);
            
            await membershipTiers.connect(user1).purchaseMembership(1, false);
            
            expect(await joyToken.balanceOf(treasury.address))
                .to.equal(initialTreasuryBalance.add(platformFee));
        });
    });
    
    describe("Membership Benefits", function () {
        it("Should correctly check feature access", async function () {
            // Basic tier
            expect(await membershipTiers.hasFeatureAccess(user1.address, "customTldStructures"))
                .to.be.false;
            expect(await membershipTiers.hasFeatureAccess(user1.address, "dedicatedCompute"))
                .to.be.false;
            expect(await membershipTiers.hasFeatureAccess(user1.address, "enhancedAnalytics"))
                .to.be.false;
            
            // Premium tier
            await membershipTiers.connect(user1).purchaseMembership(1, false);
            expect(await membershipTiers.hasFeatureAccess(user1.address, "customTldStructures"))
                .to.be.false;
            expect(await membershipTiers.hasFeatureAccess(user1.address, "dedicatedCompute"))
                .to.be.false;
            expect(await membershipTiers.hasFeatureAccess(user1.address, "enhancedAnalytics"))
                .to.be.true;
            
            // Enterprise tier
            await membershipTiers.connect(user2).purchaseMembership(2, false);
            expect(await membershipTiers.hasFeatureAccess(user2.address, "customTldStructures"))
                .to.be.true;
            expect(await membershipTiers.hasFeatureAccess(user2.address, "dedicatedCompute"))
                .to.be.true;
            expect(await membershipTiers.hasFeatureAccess(user2.address, "enhancedAnalytics"))
                .to.be.true;
        });
        
        it("Should track usage within caps", async function () {
            // Basic tier usage cap
            await membershipTiers.recordUsage(user1.address, 500);
            await membershipTiers.recordUsage(user1.address, 400);
            
            await expect(
                membershipTiers.recordUsage(user1.address, 200)
            ).to.be.revertedWith("Usage cap exceeded");
            
            // Premium tier higher cap
            await membershipTiers.connect(user2).purchaseMembership(1, false);
            await membershipTiers.recordUsage(user2.address, 5000);
            await membershipTiers.recordUsage(user2.address, 4000);
            
            const membership = await membershipTiers.getMembership(user2.address);
            expect(membership.usageThisMonth).to.equal(9000);
        });
        
        it("Should reset monthly usage", async function () {
            await membershipTiers.recordUsage(user1.address, 500);
            expect((await membershipTiers.getMembership(user1.address)).usageThisMonth)
                .to.equal(500);
            
            await membershipTiers.resetMonthlyUsage(user1.address);
            expect((await membershipTiers.getMembership(user1.address)).usageThisMonth)
                .to.equal(0);
        });
    });
    
    describe("Tier Configuration", function () {
        it("Should allow owner to update tier configuration", async function () {
            await membershipTiers.updateTierConfig(
                1, // Premium tier
                ethers.utils.parseEther("25"), // New monthly fee
                ethers.utils.parseEther("250"), // New annual fee
                60, // New compute priority
                25, // New bridging discount
                20, // New domain discount
                false,
                150, // New max data ingestion
                false,
                true,
                12000 // New usage cap
            );
            
            await membershipTiers.connect(user1).purchaseMembership(1, false);
            const membership = await membershipTiers.getMembership(user1.address);
            
            expect(membership.computePriority).to.equal(60);
            expect(membership.bridgingDiscount).to.equal(25);
            expect(membership.domainDiscount).to.equal(20);
        });
        
        it("Should not allow invalid tier configuration", async function () {
            await expect(
                membershipTiers.updateTierConfig(
                    1,
                    ethers.utils.parseEther("25"),
                    ethers.utils.parseEther("250"),
                    101, // Invalid priority > 100
                    20,
                    20,
                    false,
                    150,
                    false,
                    true,
                    12000
                )
            ).to.be.revertedWith("Invalid priority");
            
            await expect(
                membershipTiers.updateTierConfig(
                    1,
                    ethers.utils.parseEther("25"),
                    ethers.utils.parseEther("250"),
                    50,
                    101, // Invalid discount > 100
                    20,
                    false,
                    150,
                    false,
                    true,
                    12000
                )
            ).to.be.revertedWith("Invalid discount");
        });
    });
});