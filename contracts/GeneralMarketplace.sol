// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./TokenEconomics.sol";
import "./DynamicFees.sol";

/**
 * @title GeneralMarketplace
 * @dev Extended marketplace for all types of goods and services
 */
contract GeneralMarketplace is Ownable, ReentrancyGuard {
    // Platform contracts
    IERC20 public joyToken;
    TokenEconomics public tokenEconomics;
    DynamicFees public feeSystem;
    
    // Listing types
    enum ListingType { PHYSICAL_GOOD, DIGITAL_GOOD, SERVICE, AI_MODEL }
    
    // Structure to store listing information
    struct Listing {
        address owner;
        string metadata;     // IPFS hash pointing to listing metadata
        uint256 basePrice;   // Base price in JOY tokens
        bool isActive;
        uint256 totalSales;
        uint256 revenue;
        ListingType listingType;
        uint256 rating;      // Average user rating (1-100)
        string domainName;   // Associated PermaNet domain
        bool escrowEnabled;  // Whether escrow is required for transactions
        uint256 stock;      // Available inventory (0 for unlimited/services)
    }
    
    // Mapping of listing IDs to their info
    mapping(bytes32 => Listing) public listings;
    
    // User ratings
    mapping(bytes32 => mapping(address => uint256)) public userRatings;
    mapping(bytes32 => uint256) public totalRatings;
    
    // Escrow for physical goods
    struct Escrow {
        address buyer;
        uint256 amount;
        uint256 releaseTime;
        bool released;
        bool refunded;
    }
    
    mapping(bytes32 => mapping(uint256 => Escrow)) public escrows; // listingId => orderNum => Escrow
    uint256 public escrowPeriod = 7 days;
    
    // Events
    event ListingCreated(bytes32 indexed listingId, address indexed owner, ListingType listingType);
    event ListingPurchased(bytes32 indexed listingId, address indexed buyer, uint256 amount);
    event EscrowCreated(bytes32 indexed listingId, uint256 indexed orderNum, address buyer);
    event EscrowReleased(bytes32 indexed listingId, uint256 indexed orderNum);
    event EscrowRefunded(bytes32 indexed listingId, uint256 indexed orderNum);
    event ListingRated(bytes32 indexed listingId, address indexed user, uint256 rating);
    event RevenueDistributed(bytes32 indexed listingId, address indexed owner, uint256 amount);
    
    constructor(
        address _joyToken,
        address _tokenEconomics,
        address _feeSystem
    ) {
        joyToken = IERC20(_joyToken);
        tokenEconomics = TokenEconomics(_tokenEconomics);
        feeSystem = DynamicFees(_feeSystem);
    }
    
    /**
     * @dev Create a new listing
     */
    function createListing(
        bytes32 listingId,
        string memory metadata,
        uint256 basePrice,
        ListingType listingType,
        string memory domainName,
        bool escrowEnabled,
        uint256 initialStock
    ) external nonReentrant {
        require(!listings[listingId].isActive, "Listing ID already exists");
        
        // Calculate and charge listing fee
        uint256 listingFee = feeSystem.calculateListingFee(msg.sender, listingType);
        require(joyToken.transferFrom(msg.sender, address(this), listingFee), "Listing fee transfer failed");
        
        listings[listingId] = Listing({
            owner: msg.sender,
            metadata: metadata,
            basePrice: basePrice,
            isActive: true,
            totalSales: 0,
            revenue: 0,
            listingType: listingType,
            rating: 0,
            domainName: domainName,
            escrowEnabled: escrowEnabled,
            stock: initialStock
        });
        
        // Update quality score
        tokenEconomics.updateQualityScore(msg.sender, 10);
        
        emit ListingCreated(listingId, msg.sender, listingType);
    }
    
    /**
     * @dev Purchase a listing
     */
    function purchaseListing(bytes32 listingId, uint256 quantity) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.stock == 0 || listing.stock >= quantity, "Insufficient stock");
        
        uint256 totalPrice = listing.basePrice * quantity;
        uint256 fee = feeSystem.calculatePurchaseFee(msg.sender, totalPrice);
        uint256 totalAmount = totalPrice + fee;
        
        require(joyToken.transferFrom(msg.sender, address(this), totalAmount), "Payment failed");
        
        if (listing.escrowEnabled && listing.listingType == ListingType.PHYSICAL_GOOD) {
            // Create escrow
            uint256 orderNum = listing.totalSales;
            escrows[listingId][orderNum] = Escrow({
                buyer: msg.sender,
                amount: totalPrice,
                releaseTime: block.timestamp + escrowPeriod,
                released: false,
                refunded: false
            });
            emit EscrowCreated(listingId, orderNum, msg.sender);
        } else {
            // Direct payment for digital goods/services
            uint256 platformFee = (totalAmount * 5) / 100; // 5% platform fee
            uint256 ownerRevenue = totalAmount - platformFee;
            require(joyToken.transfer(listing.owner, ownerRevenue), "Owner payment failed");
            listing.revenue += ownerRevenue;
            emit RevenueDistributed(listingId, listing.owner, ownerRevenue);
        }
        
        // Update listing stats
        listing.totalSales += quantity;
        if (listing.stock > 0) {
            listing.stock -= quantity;
        }
        
        // Update participation scores
        tokenEconomics.updateParticipationScore(msg.sender, 
            tokenEconomics.participationScore(msg.sender) + 1);
        
        emit ListingPurchased(listingId, msg.sender, quantity);
    }
    
    /**
     * @dev Release escrow to seller
     */
    function releaseEscrow(bytes32 listingId, uint256 orderNum) external {
        Escrow storage escrow = escrows[listingId][orderNum];
        require(escrow.buyer == msg.sender, "Not the buyer");
        require(!escrow.released && !escrow.refunded, "Escrow already settled");
        
        escrow.released = true;
        Listing storage listing = listings[listingId];
        
        uint256 platformFee = (escrow.amount * 5) / 100;
        uint256 ownerRevenue = escrow.amount - platformFee;
        
        require(joyToken.transfer(listing.owner, ownerRevenue), "Owner payment failed");
        listing.revenue += ownerRevenue;
        
        emit EscrowReleased(listingId, orderNum);
        emit RevenueDistributed(listingId, listing.owner, ownerRevenue);
    }
    
    /**
     * @dev Refund escrow to buyer (only if escrow period has passed)
     */
    function refundEscrow(bytes32 listingId, uint256 orderNum) external {
        Escrow storage escrow = escrows[listingId][orderNum];
        require(block.timestamp > escrow.releaseTime, "Escrow period not ended");
        require(!escrow.released && !escrow.refunded, "Escrow already settled");
        
        escrow.refunded = true;
        require(joyToken.transfer(escrow.buyer, escrow.amount), "Refund failed");
        
        emit EscrowRefunded(listingId, orderNum);
    }
    
    /**
     * @dev Rate a listing
     */
    function rateListing(bytes32 listingId, uint256 rating) external {
        require(rating >= 1 && rating <= 100, "Invalid rating");
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        
        uint256 oldRating = userRatings[listingId][msg.sender];
        if (oldRating > 0) {
            listing.rating = ((listing.rating * totalRatings[listingId]) - oldRating + rating) / totalRatings[listingId];
        } else {
            totalRatings[listingId]++;
            listing.rating = ((listing.rating * (totalRatings[listingId] - 1)) + rating) / totalRatings[listingId];
        }
        
        userRatings[listingId][msg.sender] = rating;
        
        if (totalRatings[listingId] >= 5) {
            tokenEconomics.updateQualityScore(listing.owner, listing.rating);
        }
        
        emit ListingRated(listingId, msg.sender, rating);
    }
    
    /**
     * @dev Update listing information
     */
    function updateListing(
        bytes32 listingId,
        uint256 newPrice,
        string memory newMetadata,
        uint256 newStock
    ) external {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.owner, "Not listing owner");
        
        listing.basePrice = newPrice;
        listing.metadata = newMetadata;
        listing.stock = newStock;
    }
    
    /**
     * @dev Deactivate a listing
     */
    function deactivateListing(bytes32 listingId) external {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.owner || msg.sender == owner(), "Not authorized");
        listing.isActive = false;
    }
    
    /**
     * @dev Get listing information
     */
    function getListingInfo(bytes32 listingId) external view returns (
        address owner,
        string memory metadata,
        uint256 basePrice,
        bool isActive,
        uint256 totalSales,
        uint256 revenue,
        ListingType listingType,
        uint256 rating,
        string memory domainName,
        bool escrowEnabled,
        uint256 stock,
        uint256 totalRatingCount
    ) {
        Listing storage listing = listings[listingId];
        return (
            listing.owner,
            listing.metadata,
            listing.basePrice,
            listing.isActive,
            listing.totalSales,
            listing.revenue,
            listing.listingType,
            listing.rating,
            listing.domainName,
            listing.escrowEnabled,
            listing.stock,
            totalRatings[listingId]
        );
    }
    
    /**
     * @dev Update escrow period (only owner)
     */
    function updateEscrowPeriod(uint256 newPeriod) external onlyOwner {
        escrowPeriod = newPeriod;
    }
    
    /**
     * @dev Withdraw accumulated platform fees (only owner)
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = joyToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(joyToken.transfer(owner(), balance), "Transfer failed");
    }
}