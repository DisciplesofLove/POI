const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TldRegistry", function () {
    let TldRegistry, JoyToken, TreasuryDistributor, MembershipTiers;
    let tldRegistry, joyToken, treasuryDistributor, membershipTiers;
    let owner, tldDao, user1, user2, treasury;
    
    beforeEach(async function () {
        [owner, tldDao, user1, user2, treasury] = await ethers.getSigners();
        
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
        
        // Deploy TldRegistry
        TldRegistry = await ethers.getContractFactory("TldRegistry");
        tldRegistry = await TldRegistry.deploy(
            joyToken.address,
            treasuryDistributor.address,
            membershipTiers.address
        );
        await tldRegistry.deployed();
        
        // Mint tokens for testing
        await joyToken.mint(user1.address, ethers.utils.parseEther("10000"));
        await joyToken.mint(user2.address, ethers.utils.parseEther("10000"));
        
        // Approve spending
        await joyToken.connect(user1).approve(tldRegistry.address, ethers.utils.parseEther("10000"));
        await joyToken.connect(user2).approve(tldRegistry.address, ethers.utils.parseEther("10000"));
        
        // Register test TLD
        await tldRegistry.registerTld(
            "test",
            tldDao.address,
            ethers.utils.parseEther("10"), // Base price
            ethers.utils.parseEther("8"),  // Renewal price
            true, // Allows resale
            30    // Min registration 30 days
        );
    });
    
    describe("TLD Registration", function () {
        it("Should register a new TLD correctly", async function () {
            const tldStats = await tldRegistry.getTldStats("test");
            
            expect(tldStats.dao).to.equal(tldDao.address);
            expect(tldStats.isActive).to.be.true;
            expect(tldStats.basePrice).to.equal(ethers.utils.parseEther("10"));
            expect(tldStats.renewalPrice).to.equal(ethers.utils.parseEther("8"));
            expect(tldStats.allowsResale).to.be.true;
            expect(tldStats.minRegistration).to.equal(30);
            expect(tldStats.totalRevenue).to.equal(0);
        });
        
        it("Should not allow duplicate TLD registration", async function () {
            await expect(
                tldRegistry.registerTld(
                    "test",
                    user1.address,
                    ethers.utils.parseEther("10"),
                    ethers.utils.parseEther("8"),
                    true,
                    30
                )
            ).to.be.revertedWith("TLD already exists");
        });
    });
    
    describe("Domain Registration", function () {
        it("Should register a domain correctly", async function () {
            await tldRegistry.connect(user1).registerDomain(
                "test",
                "mydomain",
                365 // 1 year
            );
            
            const domainInfo = await tldRegistry.getDomainInfo("test", "mydomain");
            expect(domainInfo.owner).to.equal(user1.address);
            expect(domainInfo.isActive).to.be.true;
            
            // Verify platform fee distribution
            const basePrice = ethers.utils.parseEther("10");
            const totalPrice = basePrice.mul(365);
            const platformFee = totalPrice.mul(250).div(10000); // 2.5%
            
            // Check TLD revenue was recorded
            const tldStats = await tldRegistry.getTldStats("test");
            expect(tldStats.totalRevenue).to.equal(totalPrice);
        });
        
        it("Should apply membership discounts on registration", async function () {
            // Purchase Premium membership for user1
            await membershipTiers.connect(user1).purchaseMembership(1, false);
            
            const basePrice = ethers.utils.parseEther("10");
            const duration = 365;
            const totalPrice = basePrice.mul(duration);
            const premiumDiscount = 15; // 15% discount for Premium tier
            const discountedPrice = totalPrice.mul(100 - premiumDiscount).div(100);
            
            const initialBalance = await joyToken.balanceOf(user1.address);
            
            await tldRegistry.connect(user1).registerDomain(
                "test",
                "mydomain",
                duration
            );
            
            const finalBalance = await joyToken.balanceOf(user1.address);
            expect(initialBalance.sub(finalBalance)).to.equal(discountedPrice);
        });
        
        it("Should enforce minimum registration period", async function () {
            await expect(
                tldRegistry.connect(user1).registerDomain(
                    "test",
                    "mydomain",
                    20 // Less than 30 days minimum
                )
            ).to.be.revertedWith("Duration too short");
        });
    });
    
    describe("Domain Renewal", function () {
        beforeEach(async function () {
            await tldRegistry.connect(user1).registerDomain(
                "test",
                "mydomain",
                365
            );
        });
        
        it("Should renew a domain correctly", async function () {
            const initialExpiry = (await tldRegistry.getDomainInfo("test", "mydomain")).expiryDate;
            
            await tldRegistry.connect(user1).renewDomain(
                "test",
                "mydomain",
                365
            );
            
            const newExpiry = (await tldRegistry.getDomainInfo("test", "mydomain")).expiryDate;
            expect(newExpiry).to.equal(initialExpiry.add(365 * 24 * 60 * 60));
        });
        
        it("Should only allow domain owner to renew", async function () {
            await expect(
                tldRegistry.connect(user2).renewDomain(
                    "test",
                    "mydomain",
                    365
                )
            ).to.be.revertedWith("Not domain owner");
        });
    });
    
    describe("Domain Transfer", function () {
        beforeEach(async function () {
            await tldRegistry.connect(user1).registerDomain(
                "test",
                "mydomain",
                365
            );
        });
        
        it("Should transfer domain ownership with resale", async function () {
            const price = ethers.utils.parseEther("20");
            
            // Approve spending for buyer
            await joyToken.connect(user2).approve(tldRegistry.address, price);
            
            await tldRegistry.connect(user1).transferDomain(
                "test",
                "mydomain",
                user2.address,
                price
            );
            
            const domainInfo = await tldRegistry.getDomainInfo("test", "mydomain");
            expect(domainInfo.owner).to.equal(user2.address);
            expect(domainInfo.lastPrice).to.equal(price);
        });
        
        it("Should distribute platform fee on resale", async function () {
            const price = ethers.utils.parseEther("20");
            const platformFee = price.mul(250).div(10000); // 2.5%
            
            await joyToken.connect(user2).approve(tldRegistry.address, price);
            
            const initialTreasuryBalance = await joyToken.balanceOf(treasury.address);
            const initialSellerBalance = await joyToken.balanceOf(user1.address);
            
            await tldRegistry.connect(user1).transferDomain(
                "test",
                "mydomain",
                user2.address,
                price
            );
            
            expect(await joyToken.balanceOf(treasury.address))
                .to.equal(initialTreasuryBalance.add(platformFee));
                
            expect(await joyToken.balanceOf(user1.address))
                .to.equal(initialSellerBalance.add(price.sub(platformFee)));
        });
    });
    
    describe("TLD Policy Updates", function () {
        it("Should allow TLD DAO to update policies", async function () {
            await tldRegistry.connect(tldDao).updateTldPolicy(
                "test",
                ethers.utils.parseEther("15"), // New base price
                ethers.utils.parseEther("12"), // New renewal price
                false, // Disable resale
                60    // New min registration
            );
            
            const tldStats = await tldRegistry.getTldStats("test");
            expect(tldStats.basePrice).to.equal(ethers.utils.parseEther("15"));
            expect(tldStats.renewalPrice).to.equal(ethers.utils.parseEther("12"));
            expect(tldStats.allowsResale).to.be.false;
            expect(tldStats.minRegistration).to.equal(60);
        });
        
        it("Should only allow TLD DAO to update policies", async function () {
            await expect(
                tldRegistry.connect(user1).updateTldPolicy(
                    "test",
                    ethers.utils.parseEther("15"),
                    ethers.utils.parseEther("12"),
                    false,
                    60
                )
            ).to.be.revertedWith("Not TLD DAO");
        });
    });
});