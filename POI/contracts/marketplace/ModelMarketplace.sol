// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../JoyTokenV2.sol";

/**
 * @title ModelMarketplace
 * @dev Marketplace contract for AI model licensing and usage payments
 */
contract ModelMarketplace is Ownable, Pausable, ReentrancyGuard {
    JoyTokenV2 public joyToken;
    
    // Model registration fee in JOY tokens
    uint256 public registrationFee;
    
    // Platform fee percentage (in basis points, e.g. 250 = 2.5%)
    uint256 public platformFee;
    
    struct Model {
        address owner;
        string ipfsCid;
        uint256 licenseFee;
        uint256 usageFee; // Per-inference fee
        bool isSubscriptionEnabled;
        uint256 subscriptionFee; // Monthly fee
        bool isActive;
    }
    
    struct License {
        bool isValid;
        uint256 expiryTime; // 0 for perpetual
        bool isSubscription;
    }
    
    // Mapping of model ID to Model struct
    mapping(uint256 => Model) public models;
    
    // Mapping of model ID to user address to License struct
    mapping(uint256 => mapping(address => License)) public licenses;
    
    // Counter for model IDs
    uint256 public modelCounter;
    
    // Events
    event ModelRegistered(uint256 indexed modelId, address indexed owner, string ipfsCid);
    event ModelUpdated(uint256 indexed modelId);
    event ModelDeactivated(uint256 indexed modelId);
    event LicensePurchased(uint256 indexed modelId, address indexed licensee, bool isSubscription);
    event UsageFeePaid(uint256 indexed modelId, address indexed user, uint256 amount);
    event RoyaltyPaid(uint256 indexed modelId, address indexed owner, uint256 amount);
    
    constructor(address _joyToken) {
        require(_joyToken != address(0), "Invalid token address");
        joyToken = JoyTokenV2(_joyToken);
        registrationFee = 1000 * 10**18; // 1000 JOY
        platformFee = 250; // 2.5%
    }
    
    // Model Management
    
    function registerModel(
        string memory ipfsCid,
        uint256 licenseFee,
        uint256 usageFee,
        bool isSubscriptionEnabled,
        uint256 subscriptionFee
    ) external whenNotPaused nonReentrant {
        require(bytes(ipfsCid).length > 0, "Invalid IPFS CID");
        require(joyToken.transferFrom(msg.sender, address(this), registrationFee), "Registration fee transfer failed");
        
        uint256 modelId = ++modelCounter;
        models[modelId] = Model({
            owner: msg.sender,
            ipfsCid: ipfsCid,
            licenseFee: licenseFee,
            usageFee: usageFee,
            isSubscriptionEnabled: isSubscriptionEnabled,
            subscriptionFee: subscriptionFee,
            isActive: true
        });
        
        emit ModelRegistered(modelId, msg.sender, ipfsCid);
    }
    
    function updateModel(
        uint256 modelId,
        uint256 licenseFee,
        uint256 usageFee,
        bool isSubscriptionEnabled,
        uint256 subscriptionFee
    ) external {
        require(models[modelId].owner == msg.sender, "Not model owner");
        require(models[modelId].isActive, "Model not active");
        
        Model storage model = models[modelId];
        model.licenseFee = licenseFee;
        model.usageFee = usageFee;
        model.isSubscriptionEnabled = isSubscriptionEnabled;
        model.subscriptionFee = subscriptionFee;
        
        emit ModelUpdated(modelId);
    }
    
    function deactivateModel(uint256 modelId) external {
        require(models[modelId].owner == msg.sender, "Not model owner");
        models[modelId].isActive = false;
        emit ModelDeactivated(modelId);
    }
    
    // Licensing & Usage
    
    function purchaseLicense(uint256 modelId) external whenNotPaused nonReentrant {
        Model storage model = models[modelId];
        require(model.isActive, "Model not active");
        require(model.licenseFee > 0, "License not available");
        
        uint256 platformCut = (model.licenseFee * platformFee) / 10000;
        uint256 ownerCut = model.licenseFee - platformCut;
        
        require(joyToken.transferFrom(msg.sender, address(this), platformCut), "Platform fee transfer failed");
        require(joyToken.transferFrom(msg.sender, model.owner, ownerCut), "Owner fee transfer failed");
        
        licenses[modelId][msg.sender] = License({
            isValid: true,
            expiryTime: 0, // Perpetual license
            isSubscription: false
        });
        
        emit LicensePurchased(modelId, msg.sender, false);
        emit RoyaltyPaid(modelId, model.owner, ownerCut);
    }
    
    function purchaseSubscription(uint256 modelId) external whenNotPaused nonReentrant {
        Model storage model = models[modelId];
        require(model.isActive, "Model not active");
        require(model.isSubscriptionEnabled, "Subscription not available");
        
        uint256 platformCut = (model.subscriptionFee * platformFee) / 10000;
        uint256 ownerCut = model.subscriptionFee - platformCut;
        
        require(joyToken.transferFrom(msg.sender, address(this), platformCut), "Platform fee transfer failed");
        require(joyToken.transferFrom(msg.sender, model.owner, ownerCut), "Owner fee transfer failed");
        
        licenses[modelId][msg.sender] = License({
            isValid: true,
            expiryTime: block.timestamp + 30 days,
            isSubscription: true
        });
        
        emit LicensePurchased(modelId, msg.sender, true);
        emit RoyaltyPaid(modelId, model.owner, ownerCut);
    }
    
    function payUsageFee(uint256 modelId, uint256 inferenceCount) external whenNotPaused nonReentrant {
        Model storage model = models[modelId];
        require(model.isActive, "Model not active");
        require(licenses[modelId][msg.sender].isValid, "No valid license");
        
        if (licenses[modelId][msg.sender].isSubscription) {
            require(block.timestamp <= licenses[modelId][msg.sender].expiryTime, "Subscription expired");
        }
        
        uint256 totalFee = model.usageFee * inferenceCount;
        uint256 platformCut = (totalFee * platformFee) / 10000;
        uint256 ownerCut = totalFee - platformCut;
        
        require(joyToken.transferFrom(msg.sender, address(this), platformCut), "Platform fee transfer failed");
        require(joyToken.transferFrom(msg.sender, model.owner, ownerCut), "Owner fee transfer failed");
        
        emit UsageFeePaid(modelId, msg.sender, totalFee);
        emit RoyaltyPaid(modelId, model.owner, ownerCut);
    }
    
    // Admin Functions
    
    function setRegistrationFee(uint256 newFee) external onlyOwner {
        registrationFee = newFee;
    }
    
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }
    
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = joyToken.balanceOf(address(this));
        require(joyToken.transfer(owner(), balance), "Transfer failed");
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // View Functions
    
    function getModel(uint256 modelId) external view returns (
        address owner,
        string memory ipfsCid,
        uint256 licenseFee,
        uint256 usageFee,
        bool isSubscriptionEnabled,
        uint256 subscriptionFee,
        bool isActive
    ) {
        Model storage model = models[modelId];
        return (
            model.owner,
            model.ipfsCid,
            model.licenseFee,
            model.usageFee,
            model.isSubscriptionEnabled,
            model.subscriptionFee,
            model.isActive
        );
    }
    
    function getLicense(uint256 modelId, address user) external view returns (
        bool isValid,
        uint256 expiryTime,
        bool isSubscription
    ) {
        License storage license = licenses[modelId][user];
        return (
            license.isValid,
            license.expiryTime,
            license.isSubscription
        );
    }
}