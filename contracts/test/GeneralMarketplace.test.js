const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GeneralMarketplace", function () {
  let GeneralMarketplace, marketplace;
  let JoyToken, joyToken;
  let TokenEconomics, tokenEconomics;
  let DynamicFees, dynamicFees;
  let owner, seller, buyer;
  
  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();
    
    // Deploy JoyToken
    JoyToken = await ethers.getContractFactory("JoyToken");
    joyToken = await JoyToken.deploy();
    await joyToken.deployed();
    
    // Deploy TokenEconomics
    TokenEconomics = await ethers.getContractFactory("TokenEconomics");
    tokenEconomics = await TokenEconomics.deploy(joyToken.address);
    await tokenEconomics.deployed();
    
    // Deploy DynamicFees
    DynamicFees = await ethers.getContractFactory("DynamicFees");
    dynamicFees = await DynamicFees.deploy(tokenEconomics.address);
    await dynamicFees.deployed();
    
    // Deploy GeneralMarketplace
    GeneralMarketplace = await ethers.getContractFactory("GeneralMarketplace");
    marketplace = await GeneralMarketplace.deploy(
      joyToken.address,
      tokenEconomics.address,
      dynamicFees.address
    );
    await marketplace.deployed();
    
    // Mint tokens for testing
    await joyToken.mint(seller.address, ethers.utils.parseEther("1000"));
    await joyToken.mint(buyer.address, ethers.utils.parseEther("1000"));
    
    // Approve marketplace to spend tokens
    await joyToken.connect(seller).approve(marketplace.address, ethers.utils.parseEther("1000"));
    await joyToken.connect(buyer).approve(marketplace.address, ethers.utils.parseEther("1000"));
  });
  
  describe("Listing Creation", function () {
    it("Should create a new listing", async function () {
      const listingId = ethers.utils.id("test-listing");
      const tx = await marketplace.connect(seller).createListing(
        listingId,
        "ipfs://metadata",
        ethers.utils.parseEther("10"),
        0, // PHYSICAL_GOOD
        "shop.joy",
        true, // escrowEnabled
        100 // initialStock
      );
      
      await tx.wait();
      
      const listing = await marketplace.getListingInfo(listingId);
      expect(listing.owner).to.equal(seller.address);
      expect(listing.basePrice).to.equal(ethers.utils.parseEther("10"));
      expect(listing.listingType).to.equal(0);
      expect(listing.stock).to.equal(100);
    });
  });
  
  describe("Purchase Flow", function () {
    let listingId;
    
    beforeEach(async function () {
      listingId = ethers.utils.id("test-listing");
      await marketplace.connect(seller).createListing(
        listingId,
        "ipfs://metadata",
        ethers.utils.parseEther("10"),
        0,
        "shop.joy",
        true,
        100
      );
    });
    
    it("Should create escrow for physical goods", async function () {
      await marketplace.connect(buyer).purchaseListing(listingId, 1);
      
      const escrow = await marketplace.escrows(listingId, 0);
      expect(escrow.buyer).to.equal(buyer.address);
      expect(escrow.amount).to.equal(ethers.utils.parseEther("10"));
      expect(escrow.released).to.be.false;
      expect(escrow.refunded).to.be.false;
    });
    
    it("Should allow escrow release", async function () {
      await marketplace.connect(buyer).purchaseListing(listingId, 1);
      
      const sellerBalanceBefore = await joyToken.balanceOf(seller.address);
      await marketplace.connect(buyer).releaseEscrow(listingId, 0);
      const sellerBalanceAfter = await joyToken.balanceOf(seller.address);
      
      expect(sellerBalanceAfter.sub(sellerBalanceBefore)).to.equal(
        ethers.utils.parseEther("9.5") // 10 - 5% platform fee
      );
    });
    
    it("Should allow escrow refund after period", async function () {
      await marketplace.connect(buyer).purchaseListing(listingId, 1);
      
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]); // 7 days
      await ethers.provider.send("evm_mine");
      
      const buyerBalanceBefore = await joyToken.balanceOf(buyer.address);
      await marketplace.connect(buyer).refundEscrow(listingId, 0);
      const buyerBalanceAfter = await joyToken.balanceOf(buyer.address);
      
      expect(buyerBalanceAfter.sub(buyerBalanceBefore)).to.equal(
        ethers.utils.parseEther("10")
      );
    });
  });
  
  describe("Rating System", function () {
    let listingId;
    
    beforeEach(async function () {
      listingId = ethers.utils.id("test-listing");
      await marketplace.connect(seller).createListing(
        listingId,
        "ipfs://metadata",
        ethers.utils.parseEther("10"),
        0,
        "shop.joy",
        false,
        100
      );
    });
    
    it("Should allow rating a listing", async function () {
      await marketplace.connect(buyer).rateListing(listingId, 85);
      
      const listing = await marketplace.getListingInfo(listingId);
      expect(listing.rating).to.equal(85);
      expect(listing.totalRatingCount).to.equal(1);
    });
    
    it("Should update average rating correctly", async function () {
      await marketplace.connect(buyer).rateListing(listingId, 80);
      
      const [owner2] = await ethers.getSigners();
      await marketplace.connect(owner2).rateListing(listingId, 90);
      
      const listing = await marketplace.getListingInfo(listingId);
      expect(listing.rating).to.equal(85); // (80 + 90) / 2
      expect(listing.totalRatingCount).to.equal(2);
    });
  });
  
  describe("Listing Management", function () {
    let listingId;
    
    beforeEach(async function () {
      listingId = ethers.utils.id("test-listing");
      await marketplace.connect(seller).createListing(
        listingId,
        "ipfs://metadata",
        ethers.utils.parseEther("10"),
        0,
        "shop.joy",
        false,
        100
      );
    });
    
    it("Should update listing details", async function () {
      await marketplace.connect(seller).updateListing(
        listingId,
        ethers.utils.parseEther("15"),
        "ipfs://new-metadata",
        50
      );
      
      const listing = await marketplace.getListingInfo(listingId);
      expect(listing.basePrice).to.equal(ethers.utils.parseEther("15"));
      expect(listing.metadata).to.equal("ipfs://new-metadata");
      expect(listing.stock).to.equal(50);
    });
    
    it("Should deactivate listing", async function () {
      await marketplace.connect(seller).deactivateListing(listingId);
      
      const listing = await marketplace.getListingInfo(listingId);
      expect(listing.isActive).to.be.false;
    });
  });
});