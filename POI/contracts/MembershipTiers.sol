// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./JoyToken.sol";
import "./TreasuryDistributor.sol";

/**
 * @title MembershipTiers
 * @dev Manages membership tiers and their associated benefits in the Joy ecosystem
 */
contract MembershipTiers is Ownable, ReentrancyGuard {
    JoyToken public joyToken;
    TreasuryDistributor public treasuryDistributor;
    
    // Membership tier details
    enum TierLevel { Basic, Premium, Enterprise }
    
    struct Tier {
        string name;
        uint256 monthlyFee;
        uint256 annualFee;
        uint256 computePriority;    // 1-100, higher = better priority
        uint256 bridgingDiscount;   // Percentage discount on bridging fees
        uint256 domainDiscount;     // Percentage discount on domain fees
        bool customTldStructures;   // Whether tier allows custom TLD structures
        uint256 maxDataIngestion;   // Maximum data ingestion per month (in GB)
        bool dedicatedCompute;      // Whether tier has dedicated compute resources
        bool enhancedAnalytics;     // Whether tier has access to enhanced analytics
        uint256 maxUsageCap;        // Maximum monthly usage cap (0 = unlimited)
    }
    
    // User membership details
    struct Membership {
        TierLevel tier;
        uint256 expiryTime;
        uint256 lastRenewalTime;
        uint256 usageThisMonth;
    }
    
    // Constants
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%
    uint256 public constant BPS_DENOMINATOR = 10000;
    
    // Mappings
    mapping(TierLevel => Tier) public tiers;
    mapping(address => Membership) public memberships;
    
    // Events
    event MembershipPurchased(address indexed user, TierLevel tier, uint256 duration);
    event MembershipRenewed(address indexed user, TierLevel tier);
    event MembershipExpired(address indexed user, TierLevel tier);
    event TierConfigUpdated(TierLevel tier);
    event UsageRecorded(address indexed user, uint256 amount);
    
    constructor(address _joyToken, address _treasuryDistributor) {
        joyToken = JoyToken(_joyToken);
        treasuryDistributor = TreasuryDistributor(_treasuryDistributor);
        
        // Initialize tier configurations
        tiers[TierLevel.Basic] = Tier({
            name: "Basic",
            monthlyFee: 0,
            annualFee: 0,
            computePriority: 10,
            bridgingDiscount: 0,
            domainDiscount: 0,
            customTldStructures: false,
            maxDataIngestion: 10,
            dedicatedCompute: false,
            enhancedAnalytics: false,
            maxUsageCap: 1000
        });
        
        tiers[TierLevel.Premium] = Tier({
            name: "Premium",
            monthlyFee: 20 ether, // 20 JOY
            annualFee: 200 ether, // 200 JOY (≈2 months free)
            computePriority: 50,
            bridgingDiscount: 20,  // 20% discount
            domainDiscount: 15,    // 15% discount
            customTldStructures: false,
            maxDataIngestion: 100,
            dedicatedCompute: false,
            enhancedAnalytics: true,
            maxUsageCap: 10000
        });
        
        tiers[TierLevel.Enterprise] = Tier({
            name: "Enterprise",
            monthlyFee: 1000 ether, // 1000 JOY
            annualFee: 10000 ether, // 10000 JOY
            computePriority: 100,
            bridgingDiscount: 50,   // 50% discount
            domainDiscount: 30,     // 30% discount
            customTldStructures: true,
            maxDataIngestion: 0,    // Unlimited
            dedicatedCompute: true,
            enhancedAnalytics: true,
            maxUsageCap: 0          // Unlimited
        });
    }
    
    /**
     * @dev Purchase or upgrade membership
     */
    function purchaseMembership(TierLevel tier, bool annual) external nonReentrant {
        require(tier != TierLevel.Basic, "Basic tier is free");
        
        Tier storage selectedTier = tiers[tier];
        uint256 fee = annual ? selectedTier.annualFee : selectedTier.monthlyFee;
        require(fee > 0, "Invalid tier fee");
        
        // Calculate platform fee
        uint256 platformFee = (fee * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        
        // Transfer fees
        require(joyToken.transferFrom(msg.sender, address(this), fee), "Fee transfer failed");
        
        // Send platform fee to treasury distributor
        require(joyToken.transfer(address(treasuryDistributor), platformFee), "Platform fee transfer failed");
        
        // Update membership
        uint256 duration = annual ? 365 days : 30 days;
        memberships[msg.sender] = Membership({
            tier: tier,
            expiryTime: block.timestamp + duration,
            lastRenewalTime: block.timestamp,
            usageThisMonth: 0
        });
        
        emit MembershipPurchased(msg.sender, tier, duration);
    }
    
    /**
     * @dev Record usage for a member
     */
    function recordUsage(address user, uint256 amount) external {
        require(msg.sender == owner() || msg.sender == address(joyToken), "Not authorized");
        
        Membership storage membership = memberships[user];
        if (membership.tier == TierLevel.Basic) {
            require(
                membership.usageThisMonth + amount <= tiers[TierLevel.Basic].maxUsageCap,
                "Usage cap exceeded"
            );
        }
        
        membership.usageThisMonth += amount;
        emit UsageRecorded(user, amount);
    }
    
    /**
     * @dev Reset monthly usage (called at start of each month)
     */
    function resetMonthlyUsage(address user) external {
        require(msg.sender == owner() || msg.sender == address(joyToken), "Not authorized");
        memberships[user].usageThisMonth = 0;
    }
    
    /**
     * @dev Check if a user has access to a specific feature
     */
    function hasFeatureAccess(address user, string memory feature) external view returns (bool) {
        Membership storage membership = memberships[user];
        if (block.timestamp > membership.expiryTime && membership.tier != TierLevel.Basic) {
            return false;
        }
        
        Tier storage tier = tiers[membership.tier];
        
        if (keccak256(bytes(feature)) == keccak256(bytes("customTldStructures"))) {
            return tier.customTldStructures;
        } else if (keccak256(bytes(feature)) == keccak256(bytes("dedicatedCompute"))) {
            return tier.dedicatedCompute;
        } else if (keccak256(bytes(feature)) == keccak256(bytes("enhancedAnalytics"))) {
            return tier.enhancedAnalytics;
        }
        
        return false;
    }
    
    /**
     * @dev Get membership details
     */
    function getMembership(address user) external view returns (
        TierLevel tier,
        uint256 expiryTime,
        uint256 lastRenewalTime,
        uint256 usageThisMonth,
        uint256 computePriority,
        uint256 bridgingDiscount,
        uint256 domainDiscount
    ) {
        Membership storage membership = memberships[user];
        Tier storage tierConfig = tiers[membership.tier];
        
        return (
            membership.tier,
            membership.expiryTime,
            membership.lastRenewalTime,
            membership.usageThisMonth,
            tierConfig.computePriority,
            tierConfig.bridgingDiscount,
            tierConfig.domainDiscount
        );
    }
    
    /**
     * @dev Update tier configuration (admin only)
     */
    function updateTierConfig(
        TierLevel tier,
        uint256 monthlyFee,
        uint256 annualFee,
        uint256 computePriority,
        uint256 bridgingDiscount,
        uint256 domainDiscount,
        bool customTldStructures,
        uint256 maxDataIngestion,
        bool dedicatedCompute,
        bool enhancedAnalytics,
        uint256 maxUsageCap
    ) external onlyOwner {
        require(computePriority <= 100, "Invalid priority");
        require(bridgingDiscount <= 100, "Invalid discount");
        require(domainDiscount <= 100, "Invalid discount");
        
        tiers[tier] = Tier({
            name: tiers[tier].name,
            monthlyFee: monthlyFee,
            annualFee: annualFee,
            computePriority: computePriority,
            bridgingDiscount: bridgingDiscount,
            domainDiscount: domainDiscount,
            customTldStructures: customTldStructures,
            maxDataIngestion: maxDataIngestion,
            dedicatedCompute: dedicatedCompute,
            enhancedAnalytics: enhancedAnalytics,
            maxUsageCap: maxUsageCap
        });
        
        emit TierConfigUpdated(tier);
    }
}