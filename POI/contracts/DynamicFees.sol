// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TokenEconomics.sol";

/**
 * @title DynamicFees
 * @dev Implements dynamic fee calculation based on user reputation and platform metrics
 */
contract DynamicFees is Ownable {
    TokenEconomics public tokenEconomics;
    
    // Base fees (in JOY tokens)
    uint256 public baseModelListingFee = 100 * 10**18;    // 100 JOY
    uint256 public baseDomainRegistrationFee = 50 * 10**18; // 50 JOY
    uint256 public baseInferenceFee = 1 * 10**18;         // 1 JOY
    
    // Fee adjustment parameters
    uint256 public constant MAX_REPUTATION_DISCOUNT = 50;  // 50% max discount
    uint256 public constant SIZE_FEE_MULTIPLIER = 10**16; // 0.01 JOY per MB
    uint256 public constant STAKE_DISCOUNT_RATE = 5;      // 5% discount per tier
    
    // Network load parameters
    uint256 public networkLoad = 100; // Base load (100%)
    
    event FeeCalculated(address user, string feeType, uint256 amount);
    event BaseFeesUpdated(uint256 modelListing, uint256 domainReg, uint256 inference);
    event NetworkLoadUpdated(uint256 newLoad);

    constructor(address _tokenEconomics) {
        tokenEconomics = TokenEconomics(_tokenEconomics);
    }
    
    /**
     * @dev Calculate model listing fee based on model size and user reputation
     */
    function calculateModelListingFee(
        address user,
        uint256 modelSizeMB
    ) public view returns (uint256) {
        uint256 fee = baseModelListingFee;
        
        // Apply reputation discount
        uint256 reputation = tokenEconomics.qualityContributions(user);
        if (reputation > 0) {
            uint256 discount = (fee * reputation * MAX_REPUTATION_DISCOUNT) / (100 * 100);
            fee = fee - discount;
        }
        
        // Add size-based fee
        fee += modelSizeMB * SIZE_FEE_MULTIPLIER;
        
        // Apply staking tier discount
        (,uint256 tierId,,) = tokenEconomics.getUserStakeInfo(user);
        if (tierId > 0) {
            uint256 stakeDiscount = (fee * tierId * STAKE_DISCOUNT_RATE) / 100;
            fee = fee - stakeDiscount;
        }
        
        // Adjust for network load
        fee = (fee * networkLoad) / 100;
        
        emit FeeCalculated(user, "modelListing", fee);
        return fee;
    }
    
    /**
     * @dev Calculate domain registration fee based on name length and registration period
     */
    function calculateDomainRegistrationFee(
        address user,
        uint256 nameLength,
        uint256 registrationYears
    ) public view returns (uint256) {
        uint256 fee = baseDomainRegistrationFee;
        
        // Premium for short names
        if (nameLength <= 5) {
            fee = fee * 2;
        }
        
        // Multi-year discount
        if (registrationYears > 1) {
            fee = (fee * registrationYears * 90) / 100; // 10% discount per year
        }
        
        // Apply reputation discount
        uint256 reputation = tokenEconomics.qualityContributions(user);
        if (reputation > 0) {
            uint256 discount = (fee * reputation * MAX_REPUTATION_DISCOUNT) / (100 * 100);
            fee = fee - discount;
        }
        
        emit FeeCalculated(user, "domainRegistration", fee);
        return fee;
    }
    
    /**
     * @dev Calculate inference fee based on model complexity and network load
     */
    function calculateInferenceFee(
        address user,
        uint256 complexity
    ) public view returns (uint256) {
        uint256 fee = baseInferenceFee;
        
        // Adjust for complexity
        fee = fee + ((complexity * fee) / 100);
        
        // Apply staking discount
        (,uint256 tierId,,) = tokenEconomics.getUserStakeInfo(user);
        if (tierId > 0) {
            uint256 stakeDiscount = (fee * tierId * STAKE_DISCOUNT_RATE) / 100;
            fee = fee - stakeDiscount;
        }
        
        // Adjust for network load
        fee = (fee * networkLoad) / 100;
        
        emit FeeCalculated(user, "inference", fee);
        return fee;
    }
    
    /**
     * @dev Update base fees (only owner)
     */
    function updateBaseFees(
        uint256 _modelListingFee,
        uint256 _domainRegistrationFee,
        uint256 _inferenceFee
    ) external onlyOwner {
        baseModelListingFee = _modelListingFee;
        baseDomainRegistrationFee = _domainRegistrationFee;
        baseInferenceFee = _inferenceFee;
        
        emit BaseFeesUpdated(_modelListingFee, _domainRegistrationFee, _inferenceFee);
    }
    
    /**
     * @dev Update network load factor (only owner)
     */
    function updateNetworkLoad(uint256 _networkLoad) external onlyOwner {
        require(_networkLoad >= 50 && _networkLoad <= 200, "Invalid load range");
        networkLoad = _networkLoad;
        
        emit NetworkLoadUpdated(_networkLoad);
    }
}