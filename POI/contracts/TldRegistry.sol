// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./JoyToken.sol";
import "./TreasuryDistributor.sol";
import "./MembershipTiers.sol";

/**
 * @title TldRegistry
 * @dev Manages TLD registration, policies, and revenue distribution in the Joy ecosystem
 */
contract TldRegistry is Ownable, ReentrancyGuard {
    JoyToken public joyToken;
    TreasuryDistributor public treasuryDistributor;
    MembershipTiers public membershipTiers;
    
    struct TldInfo {
        address dao;               // TLD DAO address
        bool isActive;            // Whether TLD is active
        uint256 basePrice;        // Base price for domain registration
        uint256 renewalPrice;     // Price for domain renewal
        bool allowsResale;        // Whether domains can be resold
        uint256 minRegistration;  // Minimum registration period (in days)
        uint256 totalRevenue;     // Total revenue generated by this TLD
        mapping(string => Domain) domains;
    }
    
    struct Domain {
        address owner;
        uint256 expiryDate;
        uint256 lastPrice;      // Last paid price (for resale tracking)
        bool isActive;
    }
    
    // Platform fee percentage (2.5%)
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    // Mappings
    mapping(string => TldInfo) public tlds;
    mapping(address => bool) public isTldDao;
    
    // Events
    event TldRegistered(string tld, address dao);
    event TldPolicyUpdated(string tld, uint256 basePrice, uint256 renewalPrice);
    event DomainRegistered(string tld, string name, address owner, uint256 expiryDate);
    event DomainRenewed(string tld, string name, uint256 newExpiryDate);
    event DomainTransferred(string tld, string name, address from, address to, uint256 price);
    event PlatformFeeDistributed(string tld, uint256 amount);
    
    constructor(
        address _joyToken,
        address _treasuryDistributor,
        address _membershipTiers
    ) {
        joyToken = JoyToken(_joyToken);
        treasuryDistributor = TreasuryDistributor(_treasuryDistributor);
        membershipTiers = MembershipTiers(_membershipTiers);
    }
    
    /**
     * @dev Register a new TLD
     */
    function registerTld(
        string memory tld,
        address dao,
        uint256 basePrice,
        uint256 renewalPrice,
        bool allowsResale,
        uint256 minRegistration
    ) external onlyOwner {
        require(!tlds[tld].isActive, "TLD already exists");
        require(dao != address(0), "Invalid DAO address");
        
        tlds[tld].dao = dao;
        tlds[tld].isActive = true;
        tlds[tld].basePrice = basePrice;
        tlds[tld].renewalPrice = renewalPrice;
        tlds[tld].allowsResale = allowsResale;
        tlds[tld].minRegistration = minRegistration;
        
        isTldDao[dao] = true;
        
        emit TldRegistered(tld, dao);
    }
    
    /**
     * @dev Register a domain name
     */
    function registerDomain(
        string memory tld,
        string memory name,
        uint256 duration
    ) external payable nonReentrant {
        TldInfo storage tldInfo = tlds[tld];
        require(tldInfo.isActive, "TLD not active");
        require(duration >= tldInfo.minRegistration, "Duration too short");
        require(!tldInfo.domains[name].isActive, "Domain taken");
        
        // Calculate total price
        uint256 totalPrice = tldInfo.basePrice * duration;
        
        // Apply membership discounts
        (
            MembershipTiers.TierLevel tier,
            ,
            ,
            ,
            ,
            ,
            uint256 domainDiscount
        ) = membershipTiers.getMembership(msg.sender);
        
        if (domainDiscount > 0) {
            totalPrice = totalPrice * (100 - domainDiscount) / 100;
        }
        
        // Calculate and distribute platform fee
        uint256 platformFee = (totalPrice * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 daoAmount = totalPrice - platformFee;
        
        // Transfer fees
        require(
            joyToken.transferFrom(msg.sender, address(treasuryDistributor), platformFee),
            "Platform fee transfer failed"
        );
        require(
            joyToken.transferFrom(msg.sender, tldInfo.dao, daoAmount),
            "DAO payment failed"
        );
        
        // Distribute platform fee
        treasuryDistributor.distributeFees(platformFee);
        treasuryDistributor.recordTldRevenue(tld, totalPrice);
        
        // Register domain
        tldInfo.domains[name] = Domain({
            owner: msg.sender,
            expiryDate: block.timestamp + (duration * 1 days),
            lastPrice: totalPrice,
            isActive: true
        });
        
        tldInfo.totalRevenue += totalPrice;
        
        emit DomainRegistered(tld, name, msg.sender, block.timestamp + (duration * 1 days));
        emit PlatformFeeDistributed(tld, platformFee);
    }
    
    /**
     * @dev Renew a domain name
     */
    function renewDomain(
        string memory tld,
        string memory name,
        uint256 duration
    ) external payable nonReentrant {
        TldInfo storage tldInfo = tlds[tld];
        Domain storage domain = tldInfo.domains[name];
        
        require(tldInfo.isActive, "TLD not active");
        require(domain.isActive, "Domain not active");
        require(domain.owner == msg.sender, "Not domain owner");
        
        uint256 totalPrice = tldInfo.renewalPrice * duration;
        
        // Apply membership discounts
        (
            MembershipTiers.TierLevel tier,
            ,
            ,
            ,
            ,
            ,
            uint256 domainDiscount
        ) = membershipTiers.getMembership(msg.sender);
        
        if (domainDiscount > 0) {
            totalPrice = totalPrice * (100 - domainDiscount) / 100;
        }
        
        // Calculate and distribute platform fee
        uint256 platformFee = (totalPrice * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 daoAmount = totalPrice - platformFee;
        
        // Transfer fees
        require(
            joyToken.transferFrom(msg.sender, address(treasuryDistributor), platformFee),
            "Platform fee transfer failed"
        );
        require(
            joyToken.transferFrom(msg.sender, tldInfo.dao, daoAmount),
            "DAO payment failed"
        );
        
        // Distribute platform fee
        treasuryDistributor.distributeFees(platformFee);
        treasuryDistributor.recordTldRevenue(tld, totalPrice);
        
        // Update domain expiry
        domain.expiryDate += duration * 1 days;
        tldInfo.totalRevenue += totalPrice;
        
        emit DomainRenewed(tld, name, domain.expiryDate);
        emit PlatformFeeDistributed(tld, platformFee);
    }
    
    /**
     * @dev Transfer domain ownership (for resale market)
     */
    function transferDomain(
        string memory tld,
        string memory name,
        address to,
        uint256 price
    ) external nonReentrant {
        TldInfo storage tldInfo = tlds[tld];
        Domain storage domain = tldInfo.domains[name];
        
        require(tldInfo.isActive, "TLD not active");
        require(tldInfo.allowsResale, "Resale not allowed");
        require(domain.isActive, "Domain not active");
        require(domain.owner == msg.sender, "Not domain owner");
        require(to != address(0), "Invalid recipient");
        
        // Calculate and distribute platform fee
        uint256 platformFee = (price * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 sellerAmount = price - platformFee;
        
        // Transfer payments
        require(
            joyToken.transferFrom(to, address(treasuryDistributor), platformFee),
            "Platform fee transfer failed"
        );
        require(
            joyToken.transferFrom(to, msg.sender, sellerAmount),
            "Seller payment failed"
        );
        
        // Distribute platform fee
        treasuryDistributor.distributeFees(platformFee);
        treasuryDistributor.recordTldRevenue(tld, price);
        
        // Transfer domain
        domain.owner = to;
        domain.lastPrice = price;
        tldInfo.totalRevenue += price;
        
        emit DomainTransferred(tld, name, msg.sender, to, price);
        emit PlatformFeeDistributed(tld, platformFee);
    }
    
    /**
     * @dev Update TLD policies (only TLD DAO can call)
     */
    function updateTldPolicy(
        string memory tld,
        uint256 newBasePrice,
        uint256 newRenewalPrice,
        bool newAllowsResale,
        uint256 newMinRegistration
    ) external {
        TldInfo storage tldInfo = tlds[tld];
        require(msg.sender == tldInfo.dao, "Not TLD DAO");
        
        tldInfo.basePrice = newBasePrice;
        tldInfo.renewalPrice = newRenewalPrice;
        tldInfo.allowsResale = newAllowsResale;
        tldInfo.minRegistration = newMinRegistration;
        
        emit TldPolicyUpdated(tld, newBasePrice, newRenewalPrice);
    }
    
    /**
     * @dev Get domain information
     */
    function getDomainInfo(string memory tld, string memory name) external view returns (
        address owner,
        uint256 expiryDate,
        uint256 lastPrice,
        bool isActive
    ) {
        Domain storage domain = tlds[tld].domains[name];
        return (
            domain.owner,
            domain.expiryDate,
            domain.lastPrice,
            domain.isActive
        );
    }
    
    /**
     * @dev Get TLD revenue statistics
     */
    function getTldStats(string memory tld) external view returns (
        address dao,
        bool isActive,
        uint256 basePrice,
        uint256 renewalPrice,
        bool allowsResale,
        uint256 minRegistration,
        uint256 totalRevenue
    ) {
        TldInfo storage tldInfo = tlds[tld];
        return (
            tldInfo.dao,
            tldInfo.isActive,
            tldInfo.basePrice,
            tldInfo.renewalPrice,
            tldInfo.allowsResale,
            tldInfo.minRegistration,
            tldInfo.totalRevenue
        );
    }
}