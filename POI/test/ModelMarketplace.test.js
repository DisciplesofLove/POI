const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ModelMarketplace", function () {
    let JoyToken;
    let joyToken;
    let Marketplace;
    let marketplace;
    let owner;
    let creator;
    let buyer;
    let addrs;

    const IPFS_CID = "QmTest123";
    const LICENSE_FEE = ethers.utils.parseEther("100");
    const USAGE_FEE = ethers.utils.parseEther("1");
    const SUBSCRIPTION_FEE = ethers.utils.parseEther("50");

    beforeEach(async function () {
        [owner, creator, buyer, ...addrs] = await ethers.getSigners();

        // Deploy JoyToken
        JoyToken = await ethers.getContractFactory("JoyTokenV2");
        joyToken = await JoyToken.deploy();
        await joyToken.deployed();

        // Deploy Marketplace
        Marketplace = await ethers.getContractFactory("ModelMarketplace");
        marketplace = await Marketplace.deploy(joyToken.address);
        await marketplace.deployed();

        // Transfer tokens to creator and buyer
        await joyToken.transfer(creator.address, ethers.utils.parseEther("10000"));
        await joyToken.transfer(buyer.address, ethers.utils.parseEther("10000"));

        // Approve marketplace for token transfers
        await joyToken.connect(creator).approve(marketplace.address, ethers.utils.parseEther("10000"));
        await joyToken.connect(buyer).approve(marketplace.address, ethers.utils.parseEther("10000"));
    });

    describe("Model Registration", function () {
        it("Should allow registering a new model", async function () {
            await expect(
                marketplace.connect(creator).registerModel(
                    IPFS_CID,
                    LICENSE_FEE,
                    USAGE_FEE,
                    true,
                    SUBSCRIPTION_FEE
                )
            ).to.emit(marketplace, "ModelRegistered");

            const model = await marketplace.getModel(1);
            expect(model.owner).to.equal(creator.address);
            expect(model.ipfsCid).to.equal(IPFS_CID);
        });

        it("Should not allow registering with invalid IPFS CID", async function () {
            await expect(
                marketplace.connect(creator).registerModel(
                    "",
                    LICENSE_FEE,
                    USAGE_FEE,
                    true,
                    SUBSCRIPTION_FEE
                )
            ).to.be.revertedWith("Invalid IPFS CID");
        });
    });

    describe("Model Licensing", function () {
        beforeEach(async function () {
            await marketplace.connect(creator).registerModel(
                IPFS_CID,
                LICENSE_FEE,
                USAGE_FEE,
                true,
                SUBSCRIPTION_FEE
            );
        });

        it("Should allow purchasing a perpetual license", async function () {
            await expect(
                marketplace.connect(buyer).purchaseLicense(1)
            ).to.emit(marketplace, "LicensePurchased");

            const license = await marketplace.getLicense(1, buyer.address);
            expect(license.isValid).to.equal(true);
            expect(license.isSubscription).to.equal(false);
        });

        it("Should allow purchasing a subscription", async function () {
            await expect(
                marketplace.connect(buyer).purchaseSubscription(1)
            ).to.emit(marketplace, "LicensePurchased");

            const license = await marketplace.getLicense(1, buyer.address);
            expect(license.isValid).to.equal(true);
            expect(license.isSubscription).to.equal(true);
        });

        it("Should correctly distribute fees between platform and creator", async function () {
            const initialCreatorBalance = await joyToken.balanceOf(creator.address);
            const initialPlatformBalance = await joyToken.balanceOf(marketplace.address);

            await marketplace.connect(buyer).purchaseLicense(1);

            const platformFee = LICENSE_FEE.mul(250).div(10000); // 2.5%
            const creatorFee = LICENSE_FEE.sub(platformFee);

            expect(await joyToken.balanceOf(creator.address))
                .to.equal(initialCreatorBalance.add(creatorFee));
            expect(await joyToken.balanceOf(marketplace.address))
                .to.equal(initialPlatformBalance.add(platformFee));
        });
    });

    describe("Usage Fees", function () {
        beforeEach(async function () {
            await marketplace.connect(creator).registerModel(
                IPFS_CID,
                LICENSE_FEE,
                USAGE_FEE,
                true,
                SUBSCRIPTION_FEE
            );
            await marketplace.connect(buyer).purchaseLicense(1);
        });

        it("Should allow paying usage fees", async function () {
            const inferenceCount = 5;
            await expect(
                marketplace.connect(buyer).payUsageFee(1, inferenceCount)
            ).to.emit(marketplace, "UsageFeePaid");
        });

        it("Should not allow usage without valid license", async function () {
            await expect(
                marketplace.connect(addrs[0]).payUsageFee(1, 1)
            ).to.be.revertedWith("No valid license");
        });

        it("Should not allow usage with expired subscription", async function () {
            await marketplace.connect(buyer).purchaseSubscription(1);
            
            // Move time forward 31 days
            await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine");

            await expect(
                marketplace.connect(buyer).payUsageFee(1, 1)
            ).to.be.revertedWith("Subscription expired");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to set registration fee", async function () {
            const newFee = ethers.utils.parseEther("2000");
            await marketplace.setRegistrationFee(newFee);
            expect(await marketplace.registrationFee()).to.equal(newFee);
        });

        it("Should allow owner to set platform fee", async function () {
            const newFee = 300; // 3%
            await marketplace.setPlatformFee(newFee);
            expect(await marketplace.platformFee()).to.equal(newFee);
        });

        it("Should not allow setting platform fee above 10%", async function () {
            await expect(
                marketplace.setPlatformFee(1100)
            ).to.be.revertedWith("Fee too high");
        });

        it("Should allow owner to withdraw platform fees", async function () {
            // First make a sale to generate platform fees
            await marketplace.connect(creator).registerModel(
                IPFS_CID,
                LICENSE_FEE,
                USAGE_FEE,
                true,
                SUBSCRIPTION_FEE
            );
            await marketplace.connect(buyer).purchaseLicense(1);

            const initialBalance = await joyToken.balanceOf(owner.address);
            await marketplace.withdrawPlatformFees();
            expect(await joyToken.balanceOf(owner.address)).to.be.gt(initialBalance);
        });
    });

    describe("Emergency Controls", function () {
        it("Should allow owner to pause marketplace", async function () {
            await marketplace.pause();
            expect(await marketplace.paused()).to.equal(true);
        });

        it("Should not allow operations when paused", async function () {
            await marketplace.pause();
            await expect(
                marketplace.connect(creator).registerModel(
                    IPFS_CID,
                    LICENSE_FEE,
                    USAGE_FEE,
                    true,
                    SUBSCRIPTION_FEE
                )
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should allow owner to unpause marketplace", async function () {
            await marketplace.pause();
            await marketplace.unpause();
            expect(await marketplace.paused()).to.equal(false);
        });
    });
});