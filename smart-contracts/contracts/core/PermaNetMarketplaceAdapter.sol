// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PermaNetDomainRegistry.sol";
import "./PermaNetDAORegistry.sol";
import "../../POI/contracts/ModelMarketplaceV2.sol";

/**
 * @title PermaNetMarketplaceAdapter
 * @dev Integrates PermaNet domains with the ModelMarketplace ecosystem
 */
contract PermaNetMarketplaceAdapter is Ownable, ReentrancyGuard {
    PermaNetDomainRegistry public domainRegistry;
    PermaNetDAORegistry public daoRegistry;
    ModelMarketplaceV2 public marketplace;
    
    // Mapping from model ID to domain name
    mapping(bytes32 => string) public modelDomains;
    
    // Events
    event ModelDomainLinked(bytes32 indexed modelId, string domain);
    event ModelDomainUpdated(bytes32 indexed modelId, string newDomain);
    
    constructor(
        address _domainRegistry,
        address _daoRegistry,
        address _marketplace
    ) {
        domainRegistry = PermaNetDomainRegistry(_domainRegistry);
        daoRegistry = PermaNetDAORegistry(_daoRegistry);
        marketplace = ModelMarketplaceV2(_marketplace);
    }
    
    /**
     * @dev Register a model and associate it with a PermaNet domain
     */
    function registerModelWithDomain(
        bytes32 modelId,
        string memory metadata,
        uint256 price,
        string memory iotaStreamId,
        string memory domainName,
        string memory tld
    ) external nonReentrant {
        // First check if TLD has a DAO
        address tldOwner = domainRegistry.tldOwners(tld);
        if (tldOwner == address(daoRegistry)) {
            // If TLD is DAO controlled, ensure domain registration goes through DAO governance
            require(
                daoRegistry.tldDAOs(tld).allowedDomains[domainName],
                "Domain not approved by DAO"
            );
        }
        
        // Then register the domain
        domainRegistry.registerDomain(domainName, tld);
        
        // Then register the model
        marketplace.registerModel(modelId, metadata, price, iotaStreamId);
        
        // Link the domain to the model
        string memory fullDomain = string(abi.encodePacked(domainName, ".", tld));
        modelDomains[modelId] = fullDomain;
        
        emit ModelDomainLinked(modelId, fullDomain);
    }
    
    /**
     * @dev Update the domain associated with a model
     */
    function updateModelDomain(
        bytes32 modelId,
        string memory newDomainName,
        string memory tld
    ) external {
        // Verify caller owns the model
        (address owner,,,,,,) = marketplace.getModelInfo(modelId);
        require(msg.sender == owner, "Not model owner");
        
        // Register new domain
        domainRegistry.registerDomain(newDomainName, tld);
        
        // Update the mapping
        string memory fullDomain = string(abi.encodePacked(newDomainName, ".", tld));
        modelDomains[modelId] = fullDomain;
        
        emit ModelDomainUpdated(modelId, fullDomain);
    }
    
    /**
     * @dev Get the domain associated with a model
     */
    function getModelDomain(bytes32 modelId) external view returns (string memory) {
        return modelDomains[modelId];
    }
}