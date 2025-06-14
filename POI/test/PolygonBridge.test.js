const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PolygonBridge", function () {
    let JoyToken;
    let joyToken;
    let Bridge;
    let bridge;
    let owner;
    let validator1;
    let validator2;
    let validator3;
    let user;
    let addrs;

    const SOLANA_CHAIN_ID = ethers.utils.formatBytes32String("SOLANA");
    const IOTA_CHAIN_ID = ethers.utils.formatBytes32String("IOTA");

    beforeEach(async function () {
        [owner, validator1, validator2, validator3, user, ...addrs] = await ethers.getSigners();

        // Deploy JoyToken
        JoyToken = await ethers.getContractFactory("JoyTokenV2");
        joyToken = await JoyToken.deploy();
        await joyToken.deployed();

        // Deploy Bridge
        Bridge = await ethers.getContractFactory("PolygonBridge");
        bridge = await Bridge.deploy(joyToken.address);
        await bridge.deployed();

        // Authorize bridge in JoyToken
        await joyToken.authorizeBridge(bridge.address);

        // Add validators
        await bridge.addValidator(validator1.address);
        await bridge.addValidator(validator2.address);
        await bridge.addValidator(validator3.address);

        // Add supported chains
        await bridge.addSupportedChain(SOLANA_CHAIN_ID);
        await bridge.addSupportedChain(IOTA_CHAIN_ID);

        // Transfer some tokens to user
        await joyToken.transfer(user.address, ethers.utils.parseEther("1000"));
        await joyToken.connect(user).approve(bridge.address, ethers.utils.parseEther("1000"));
    });

    describe("Chain Management", function () {
        it("Should allow owner to add supported chain", async function () {
            const newChainId = ethers.utils.formatBytes32String("NEW_CHAIN");
            await bridge.addSupportedChain(newChainId);
            expect(await bridge.supportedChains(newChainId)).to.equal(true);
        });

        it("Should allow owner to remove supported chain", async function () {
            await bridge.removeSupportedChain(SOLANA_CHAIN_ID);
            expect(await bridge.supportedChains(SOLANA_CHAIN_ID)).to.equal(false);
        });

        it("Should not allow non-owner to add chain", async function () {
            const newChainId = ethers.utils.formatBytes32String("NEW_CHAIN");
            await expect(
                bridge.connect(user).addSupportedChain(newChainId)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Validator Management", function () {
        it("Should allow owner to add validator", async function () {
            await bridge.addValidator(addrs[0].address);
            expect(await bridge.validators(addrs[0].address)).to.equal(true);
        });

        it("Should allow owner to remove validator", async function () {
            await bridge.removeValidator(validator1.address);
            expect(await bridge.validators(validator1.address)).to.equal(false);
        });

        it("Should track validator count correctly", async function () {
            const initialCount = await bridge.validatorCount();
            await bridge.addValidator(addrs[0].address);
            expect(await bridge.validatorCount()).to.equal(initialCount.add(1));
        });
    });

    describe("Bridge Operations", function () {
        const amount = ethers.utils.parseEther("100");

        it("Should allow users to lock tokens", async function () {
            await expect(bridge.connect(user).lockTokens(SOLANA_CHAIN_ID, amount))
                .to.emit(bridge, "TokensLocked")
                .withArgs(user.address, SOLANA_CHAIN_ID, amount);
        });

        it("Should not allow locking tokens for unsupported chain", async function () {
            const unsupportedChain = ethers.utils.formatBytes32String("UNSUPPORTED");
            await expect(
                bridge.connect(user).lockTokens(unsupportedChain, amount)
            ).to.be.revertedWith("Unsupported chain");
        });

        it("Should unlock tokens with valid signatures", async function () {
            const txHash = ethers.utils.formatBytes32String("TEST_TX");
            const message = ethers.utils.solidityKeccak256(
                ["address", "bytes32", "uint256", "bytes32"],
                [user.address, SOLANA_CHAIN_ID, amount, txHash]
            );

            // Get signatures from validators
            const signatures = await Promise.all([
                validator1.signMessage(ethers.utils.arrayify(message)),
                validator2.signMessage(ethers.utils.arrayify(message)),
                validator3.signMessage(ethers.utils.arrayify(message))
            ]);

            await expect(
                bridge.unlockTokens(user.address, SOLANA_CHAIN_ID, amount, txHash, signatures)
            ).to.emit(bridge, "TokensUnlocked");
        });

        it("Should not unlock tokens with insufficient signatures", async function () {
            const txHash = ethers.utils.formatBytes32String("TEST_TX");
            const message = ethers.utils.solidityKeccak256(
                ["address", "bytes32", "uint256", "bytes32"],
                [user.address, SOLANA_CHAIN_ID, amount, txHash]
            );

            // Get signatures from only 2 validators
            const signatures = await Promise.all([
                validator1.signMessage(ethers.utils.arrayify(message)),
                validator2.signMessage(ethers.utils.arrayify(message))
            ]);

            await expect(
                bridge.unlockTokens(user.address, SOLANA_CHAIN_ID, amount, txHash, signatures)
            ).to.be.revertedWith("Insufficient signatures");
        });
    });

    describe("Emergency Controls", function () {
        it("Should allow owner to pause bridge", async function () {
            await bridge.pause();
            expect(await bridge.paused()).to.equal(true);
        });

        it("Should not allow operations when paused", async function () {
            await bridge.pause();
            await expect(
                bridge.connect(user).lockTokens(SOLANA_CHAIN_ID, 100)
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should allow owner to unpause bridge", async function () {
            await bridge.pause();
            await bridge.unpause();
            expect(await bridge.paused()).to.equal(false);
        });
    });
});