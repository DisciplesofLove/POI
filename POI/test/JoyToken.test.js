const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JoyToken V2", function () {
    let JoyToken;
    let joyToken;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        JoyToken = await ethers.getContractFactory("JoyTokenV2");
        joyToken = await JoyToken.deploy();
        await joyToken.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await joyToken.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await joyToken.balanceOf(owner.address);
            expect(await joyToken.totalSupply()).to.equal(ownerBalance);
        });
    });

    describe("Bridge Management", function () {
        it("Should allow owner to authorize bridge", async function () {
            await joyToken.authorizeBridge(addr1.address);
            expect(await joyToken.authorizedBridges(addr1.address)).to.equal(true);
        });

        it("Should allow owner to deauthorize bridge", async function () {
            await joyToken.authorizeBridge(addr1.address);
            await joyToken.deauthorizeBridge(addr1.address);
            expect(await joyToken.authorizedBridges(addr1.address)).to.equal(false);
        });

        it("Should not allow non-owner to authorize bridge", async function () {
            await expect(
                joyToken.connect(addr1).authorizeBridge(addr2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Staking", function () {
        const stakeAmount = ethers.utils.parseEther("1000");

        beforeEach(async function () {
            await joyToken.transfer(addr1.address, stakeAmount);
            await joyToken.connect(addr1).approve(joyToken.address, stakeAmount);
        });

        it("Should allow users to stake tokens", async function () {
            await joyToken.connect(addr1).stake(stakeAmount);
            expect(await joyToken.stakedBalance(addr1.address)).to.equal(stakeAmount);
        });

        it("Should not allow staking more than balance", async function () {
            const tooMuch = ethers.utils.parseEther("2000");
            await expect(
                joyToken.connect(addr1).stake(tooMuch)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("Should not allow unstaking before minimum duration", async function () {
            await joyToken.connect(addr1).stake(stakeAmount);
            await expect(
                joyToken.connect(addr1).unstake(stakeAmount)
            ).to.be.revertedWith("Minimum stake duration not met");
        });
    });

    describe("Governance Integration", function () {
        it("Should allow setting governance contract", async function () {
            await joyToken.setGovernanceContract(addr1.address);
            expect(await joyToken.governanceContract()).to.equal(addr1.address);
        });

        it("Should not allow non-owner to set governance contract", async function () {
            await expect(
                joyToken.connect(addr1).setGovernanceContract(addr2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Marketplace Integration", function () {
        it("Should allow setting marketplace contract", async function () {
            await joyToken.setMarketplaceContract(addr1.address);
            expect(await joyToken.marketplaceContract()).to.equal(addr1.address);
        });

        it("Should not allow non-owner to set marketplace contract", async function () {
            await expect(
                joyToken.connect(addr1).setMarketplaceContract(addr2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Emergency Controls", function () {
        it("Should allow owner to pause", async function () {
            await joyToken.pause();
            expect(await joyToken.paused()).to.equal(true);
        });

        it("Should allow owner to unpause", async function () {
            await joyToken.pause();
            await joyToken.unpause();
            expect(await joyToken.paused()).to.equal(false);
        });

        it("Should not allow transfers when paused", async function () {
            await joyToken.pause();
            await expect(
                joyToken.transfer(addr1.address, 100)
            ).to.be.revertedWith("Pausable: paused");
        });
    });
});