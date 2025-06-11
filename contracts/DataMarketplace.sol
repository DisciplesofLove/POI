// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DataOwnership.sol";
import "./JoyToken.sol";

/**
 * @title DataMarketplace
 * @dev Marketplace for data monetization with fair compensation
 */
contract DataMarketplace is ReentrancyGuard {
    DataOwnership public dataOwnership;
    JoyToken public joyToken;
    
    // Fee structure
    uint256 public platformFee = 5; // 5% platform fee
    uint256 public constant FEE_DENOMINATOR = 100;
    
    // Data subscription structure
    struct Subscription {
        uint256 dataId;
        address subscriber;
        uint256 startTime;
        uint256 endTime;
        uint256 price;
    }
    
    // Mapping of subscription IDs to Subscription
    mapping(uint256 => Subscription) public subscriptions;
    uint256 private subscriptionCounter;
    
    // Events
    event DataPurchased(uint256 dataId, address buyer, uint256 price, uint256 duration);
    event SubscriptionCreated(uint256 subscriptionId, uint256 dataId, address subscriber);
    event RevenueDistributed(address dataOwner, uint256 amount);
    
    constructor(address _dataOwnership, address _joyToken) {
        dataOwnership = DataOwnership(_dataOwnership);
        joyToken = JoyToken(_joyToken);
    }
    
    /**
     * @dev Purchase access to data
     */
    function purchaseDataAccess(uint256 dataId, uint256 duration) external nonReentrant {
        DataOwnership.DataAsset memory asset = dataOwnership.dataAssets(dataId);
        require(asset.isAvailable, "Data not available");
        
        uint256 totalPrice = asset.accessPrice * duration;
        address dataOwner = dataOwnership.ownerOf(dataId);
        
        // Calculate fees
        uint256 platformAmount = (totalPrice * platformFee) / FEE_DENOMINATOR;
        uint256 ownerAmount = totalPrice - platformAmount;
        
        // Transfer tokens
        require(joyToken.transferFrom(msg.sender, address(this), platformAmount), "Platform fee transfer failed");
        require(joyToken.transferFrom(msg.sender, dataOwner, ownerAmount), "Owner payment failed");
        
        // Grant access
        dataOwnership.grantAccess(dataId, msg.sender, duration);
        
        // Create subscription record
        subscriptionCounter++;
        subscriptions[subscriptionCounter] = Subscription({
            dataId: dataId,
            subscriber: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            price: totalPrice
        });
        
        emit DataPurchased(dataId, msg.sender, totalPrice, duration);
        emit SubscriptionCreated(subscriptionCounter, dataId, msg.sender);
        emit RevenueDistributed(dataOwner, ownerAmount);
    }
    
    /**
     * @dev Check if subscription is active
     */
    function isSubscriptionActive(uint256 subscriptionId) public view returns (bool) {
        Subscription memory sub = subscriptions[subscriptionId];
        return sub.endTime > block.timestamp;
    }
    
    /**
     * @dev Update platform fee (admin only)
     */
    function updatePlatformFee(uint256 newFee) external {
        // In production, add access control
        require(newFee <= 20, "Fee too high"); // Max 20%
        platformFee = newFee;
    }
}