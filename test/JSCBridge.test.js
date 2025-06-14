const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JSCBridge", function () {
  let JoyToken;
  let JSCBridge;
  let joyToken;
  let bridge;
  let owner;
  let user;
  let bridgeRole;
  let adminRole;

  const minDeposit = ethers.utils.parseEther("1");
  const maxDeposit = ethers.utils.parseEther("1000");
  const dailyLimit = ethers.utils.parseEther("10000");

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy JoyToken
    JoyToken = await ethers.getContractFactory("JoyToken");
    joyToken = await JoyToken.deploy();
    await joyToken.deployed();

    // Deploy JSCBridge
    JSCBridge = await ethers.getContractFactory("JSCBridge");
    bridge = await JSCBridge.deploy(
      joyToken.address,
      minDeposit,
      maxDeposit,
      dailyLimit
    );
    await bridge.deployed();

    // Grant roles
    const MINTER_ROLE = await joyToken.MINTER_ROLE();
    await joyToken.grantRole(MINTER_ROLE, bridge.address);

    bridgeRole = await bridge.BRIDGE_ROLE();
    adminRole = await bridge.ADMIN_ROLE();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await bridge.hasRole(adminRole, owner.address)).to.equal(true);
    });

    it("Should set the correct limits", async function () {
      expect(await bridge.minDeposit()).to.equal(minDeposit);
      expect(await bridge.maxDeposit()).to.equal(maxDeposit);
      expect(await bridge.dailyLimit()).to.equal(dailyLimit);
    });
  });

  describe("Deposits", function () {
    it("Should allow deposits within limits", async function () {
      const amount = ethers.utils.parseEther("10");
      const jscAddress = ethers.utils.formatBytes32String("jsc_address");

      await expect(bridge.connect(user).deposit(amount, jscAddress))
        .to.emit(bridge, "Deposit")
        .withArgs(user.address, amount, jscAddress);

      expect(await joyToken.balanceOf(user.address)).to.equal(amount);
    });

    it("Should reject deposits below minimum", async function () {
      const amount = ethers.utils.parseEther("0.5");
      const jscAddress = ethers.utils.formatBytes32String("jsc_address");

      await expect(
        bridge.connect(user).deposit(amount, jscAddress)
      ).to.be.revertedWith("Below minimum deposit");
    });

    it("Should reject deposits above maximum", async function () {
      const amount = ethers.utils.parseEther("1001");
      const jscAddress = ethers.utils.formatBytes32String("jsc_address");

      await expect(
        bridge.connect(user).deposit(amount, jscAddress)
      ).to.be.revertedWith("Exceeds maximum deposit");
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Setup: First deposit some tokens
      const amount = ethers.utils.parseEther("100");
      const jscAddress = ethers.utils.formatBytes32String("jsc_address");
      await bridge.connect(user).deposit(amount, jscAddress);
      await joyToken.connect(user).approve(bridge.address, amount);
    });

    it("Should allow withdrawals within limits", async function () {
      const amount = ethers.utils.parseEther("10");
      const jscAddress = ethers.utils.formatBytes32String("jsc_address");

      await expect(bridge.connect(user).withdraw(amount, jscAddress))
        .to.emit(bridge, "Withdrawal")
        .withArgs(user.address, amount, jscAddress);

      expect(await joyToken.balanceOf(user.address)).to.equal(
        ethers.utils.parseEther("90")
      );
    });

    it("Should reject withdrawals below minimum", async function () {
      const amount = ethers.utils.parseEther("0.5");
      const jscAddress = ethers.utils.formatBytes32String("jsc_address");

      await expect(
        bridge.connect(user).withdraw(amount, jscAddress)
      ).to.be.revertedWith("Below minimum withdrawal");
    });

    it("Should reject withdrawals above maximum", async function () {
      const amount = ethers.utils.parseEther("1001");
      const jscAddress = ethers.utils.formatBytes32String("jsc_address");

      await expect(
        bridge.connect(user).withdraw(amount, jscAddress)
      ).to.be.revertedWith("Exceeds maximum withdrawal");
    });
  });

  describe("Admin functions", function () {
    it("Should allow admin to update limits", async function () {
      const newMin = ethers.utils.parseEther("2");
      const newMax = ethers.utils.parseEther("2000");
      const newDaily = ethers.utils.parseEther("20000");

      await expect(bridge.connect(owner).updateLimits(newMin, newMax, newDaily))
        .to.emit(bridge, "BridgeLimitsUpdated")
        .withArgs(newMin, newMax, newDaily);

      expect(await bridge.minDeposit()).to.equal(newMin);
      expect(await bridge.maxDeposit()).to.equal(newMax);
      expect(await bridge.dailyLimit()).to.equal(newDaily);
    });

    it("Should allow admin to pause/unpause bridge", async function () {
      await bridge.connect(owner).pause();
      expect(await bridge.paused()).to.equal(true);

      await bridge.connect(owner).unpause();
      expect(await bridge.paused()).to.equal(false);
    });

    it("Should reject non-admin limit updates", async function () {
      const newMin = ethers.utils.parseEther("2");
      const newMax = ethers.utils.parseEther("2000");
      const newDaily = ethers.utils.parseEther("20000");

      await expect(
        bridge.connect(user).updateLimits(newMin, newMax, newDaily)
      ).to.be.reverted;
    });
  });
});