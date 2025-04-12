const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TreasuryDistributor", function () {
    let TreasuryDistributor, JoyToken;
    let treasuryDistributor, joyToken;
    let owner, joynetTreasury, stakingPool, computePool, grantsPool, addr1, addr2;
    
    beforeEach(async function () {
        [owner, joynetTreasury, stakingPool, computePool, grantsPool, addr1, addr2] = await ethers.getSigners();
        
        // Deploy JoyToken
        JoyToken = await ethers.getContractFactory("JoyToken");
        joyToken = await JoyToken.deploy();
        await joyToken.deployed();
        
        // Deploy TreasuryDistributor
        TreasuryDistributor = await ethers.getContractFactory("TreasuryDistributor");
        treasuryDistributor = await TreasuryDistributor.deploy(
            joyToken.address,
            joynetTreasury.address,
            stakingPool.address,
            computePool.address,
            grantsPool.address
        );
        await treasuryDistributor.deployed();
        
        // Mint some tokens for testing
        await joyToken.mint(owner.address, ethers.utils.parseEther("1000000"));
        await joyToken.approve(treasuryDistributor.address, ethers.utils.parseEther("1000000"));
    });
    
    describe("Distribution", function () {
        it("Should distribute fees according to defined percentages", async function () {
            const amount = ethers.utils.parseEther("1000");
            
            // Calculate expected amounts
            const joynetTreasuryAmount = amount.mul(30).div(100);
            const tldAmount = amount.mul(30).div(100);
            const stakingAmount = amount.mul(20).div(100);
            const computeAmount = amount.mul(10).div(100);
            const grantsAmount = amount.mul(10).div(100);
            
            // Register a TLD treasury for testing
            await treasuryDistributor.registerTldTreasury("test", addr1.address);
            await treasuryDistributor.recordTldRevenue("test", amount);
            
            // Get initial balances
            const initialJoynetBalance = await joyToken.balanceOf(joynetTreasury.address);
            const initialStakingBalance = await joyToken.balanceOf(stakingPool.address);
            const initialComputeBalance = await joyToken.balanceOf(computePool.address);
            const initialGrantsBalance = await joyToken.balanceOf(grantsPool.address);
            const initialTldBalance = await joyToken.balanceOf(addr1.address);
            
            // Distribute fees
            await treasuryDistributor.distributeFees(amount);
            
            // Check final balances
            expect(await joyToken.balanceOf(joynetTreasury.address))
                .to.equal(initialJoynetBalance.add(joynetTreasuryAmount));
                
            expect(await joyToken.balanceOf(stakingPool.address))
                .to.equal(initialStakingBalance.add(stakingAmount));
                
            expect(await joyToken.balanceOf(computePool.address))
                .to.equal(initialComputeBalance.add(computeAmount));
                
            expect(await joyToken.balanceOf(grantsPool.address))
                .to.equal(initialGrantsBalance.add(grantsAmount));
                
            expect(await joyToken.balanceOf(addr1.address))
                .to.equal(initialTldBalance.add(tldAmount));
        });
        
        it("Should only allow owner to register TLD treasuries", async function () {
            await expect(
                treasuryDistributor.connect(addr1).registerTldTreasury("test", addr2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
            
            await expect(
                treasuryDistributor.registerTldTreasury("test", ethers.constants.AddressZero)
            ).to.be.revertedWith("Invalid treasury address");
            
            await treasuryDistributor.registerTldTreasury("test", addr1.address);
            expect(await treasuryDistributor.tldTreasuries("test")).to.equal(addr1.address);
        });
        
        it("Should distribute TLD share proportionally based on revenue", async function () {
            // Register two TLD treasuries
            await treasuryDistributor.registerTldTreasury("test1", addr1.address);
            await treasuryDistributor.registerTldTreasury("test2", addr2.address);
            
            // Record revenue (test1: 75%, test2: 25%)
            await treasuryDistributor.recordTldRevenue("test1", ethers.utils.parseEther("750"));
            await treasuryDistributor.recordTldRevenue("test2", ethers.utils.parseEther("250"));
            
            const amount = ethers.utils.parseEther("1000");
            const tldShare = amount.mul(30).div(100); // 30% goes to TLD treasuries
            
            const test1Share = tldShare.mul(75).div(100);
            const test2Share = tldShare.mul(25).div(100);
            
            const initialTest1Balance = await joyToken.balanceOf(addr1.address);
            const initialTest2Balance = await joyToken.balanceOf(addr2.address);
            
            await treasuryDistributor.distributeFees(amount);
            
            expect(await joyToken.balanceOf(addr1.address))
                .to.equal(initialTest1Balance.add(test1Share));
                
            expect(await joyToken.balanceOf(addr2.address))
                .to.equal(initialTest2Balance.add(test2Share));
        });
        
        it("Should handle zero TLD revenue case correctly", async function () {
            const amount = ethers.utils.parseEther("1000");
            const tldShare = amount.mul(30).div(100);
            
            // When no TLD revenue is recorded, TLD share should go to JoyNet treasury
            const initialJoynetBalance = await joyToken.balanceOf(joynetTreasury.address);
            
            await treasuryDistributor.distributeFees(amount);
            
            expect(await joyToken.balanceOf(joynetTreasury.address))
                .to.equal(initialJoynetBalance.add(amount.mul(30).div(100)).add(tldShare));
        });
        
        it("Should allow updating pool addresses", async function () {
            await expect(
                treasuryDistributor.updatePoolAddresses(
                    ethers.constants.AddressZero,
                    stakingPool.address,
                    computePool.address,
                    grantsPool.address
                )
            ).to.be.revertedWith("Invalid JoyNet treasury");
            
            const newJoynetTreasury = addr1.address;
            await treasuryDistributor.updatePoolAddresses(
                newJoynetTreasury,
                stakingPool.address,
                computePool.address,
                grantsPool.address
            );
            
            expect(await treasuryDistributor.joynetTreasury()).to.equal(newJoynetTreasury);
        });
    });
});