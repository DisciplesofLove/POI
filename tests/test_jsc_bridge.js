const JSCBridge = artifacts.require("JSCBridge");
const JoyToken = artifacts.require("JoyToken");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('JSCBridge', function(accounts) {
    const [owner, user1, user2] = accounts;
    const amount = web3.utils.toWei('100', 'ether');
    const jscAddress = '0x1234567890123456789012345678901234567890123456789012345678901234';
    const jscTxHash = '0x9876543210987654321098765432109876543210987654321098765432109876';

    beforeEach(async function() {
        // Deploy JoyToken
        this.joyToken = await JoyToken.new({ from: owner });
        
        // Deploy JSCBridge
        this.bridge = await JSCBridge.new(this.joyToken.address, { from: owner });
        
        // Set bridge in JoyToken
        await this.joyToken.setJSCBridgeContract(this.bridge.address, { from: owner });
        
        // Transfer some tokens to user1
        await this.joyToken.transfer(user1, amount, { from: owner });
        
        // Approve bridge to spend tokens
        await this.joyToken.approve(this.bridge.address, amount, { from: user1 });
    });

    describe('deposit', function() {
        it('should accept deposits and emit event', async function() {
            const receipt = await this.bridge.deposit(amount, jscAddress, { from: user1 });
            
            expectEvent(receipt, 'Deposit', {
                user: user1,
                amount: amount,
                jscAddress: jscAddress
            });
            
            const bridgeBalance = await this.joyToken.balanceOf(this.bridge.address);
            expect(bridgeBalance.toString()).to.equal(amount);
        });

        it('should revert if amount is 0', async function() {
            await expectRevert(
                this.bridge.deposit('0', jscAddress, { from: user1 }),
                'Amount must be greater than 0'
            );
        });

        it('should revert if JSC address is zero', async function() {
            await expectRevert(
                this.bridge.deposit(amount, '0x0000000000000000000000000000000000000000000000000000000000000000', { from: user1 }),
                'Invalid JSC address'
            );
        });
    });

    describe('processWithdrawal', function() {
        beforeEach(async function() {
            // First deposit some tokens to the bridge
            await this.bridge.deposit(amount, jscAddress, { from: user1 });
        });

        it('should process withdrawals correctly', async function() {
            const receipt = await this.bridge.processWithdrawal(user2, amount, jscTxHash, { from: owner });
            
            expectEvent(receipt, 'Withdrawal', {
                user: user2,
                amount: amount,
                jscTxHash: jscTxHash
            });
            
            const user2Balance = await this.joyToken.balanceOf(user2);
            expect(user2Balance.toString()).to.equal(amount);
        });

        it('should revert if called by non-owner', async function() {
            await expectRevert(
                this.bridge.processWithdrawal(user2, amount, jscTxHash, { from: user1 }),
                'Ownable: caller is not the owner'
            );
        });

        it('should revert if transaction hash already processed', async function() {
            await this.bridge.processWithdrawal(user2, amount, jscTxHash, { from: owner });
            
            await expectRevert(
                this.bridge.processWithdrawal(user2, amount, jscTxHash, { from: owner }),
                'Transaction already processed'
            );
        });
    });

    describe('pause/unpause', function() {
        it('should pause and unpause correctly', async function() {
            await this.bridge.pause({ from: owner });
            
            await expectRevert(
                this.bridge.deposit(amount, jscAddress, { from: user1 }),
                'Pausable: paused'
            );

            await this.bridge.unpause({ from: owner });
            
            const receipt = await this.bridge.deposit(amount, jscAddress, { from: user1 });
            expectEvent(receipt, 'Deposit');
        });

        it('should only allow owner to pause/unpause', async function() {
            await expectRevert(
                this.bridge.pause({ from: user1 }),
                'Ownable: caller is not the owner'
            );

            await expectRevert(
                this.bridge.unpause({ from: user1 }),
                'Ownable: caller is not the owner'
            );
        });
    });

    describe('emergencyWithdraw', function() {
        beforeEach(async function() {
            await this.bridge.deposit(amount, jscAddress, { from: user1 });
        });

        it('should allow owner to withdraw stuck tokens', async function() {
            const initialBalance = await this.joyToken.balanceOf(owner);
            
            await this.bridge.emergencyWithdraw({ from: owner });
            
            const finalBalance = await this.joyToken.balanceOf(owner);
            expect(finalBalance.sub(initialBalance).toString()).to.equal(amount);
        });

        it('should only allow owner to emergency withdraw', async function() {
            await expectRevert(
                this.bridge.emergencyWithdraw({ from: user1 }),
                'Ownable: caller is not the owner'
            );
        });
    });
});