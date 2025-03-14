// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title PermaNetDomainRegistry
 * @dev Manages permanent domain registration for the PermaNet decentralized internet
 */
contract PermaNetDomainRegistry is Ownable, ReentrancyGuard {
    using Strings for uint256;

    // Struct to store domain information
    struct Domain {
        address owner;
        string tld;           // Top Level Domain (e.g., "joy", "dao", "ai")
        string name;          // Domain name without TLD
        uint256 registered;   // Registration timestamp
        string contentHash;   // IPFS/Arweave hash for domain content
        bool isActive;
    }

    // Mapping from domain hash to Domain struct
    mapping(bytes32 => Domain) public domains;
    
    // Mapping from TLD to its owner/DAO
    mapping(string => address) public tldOwners;
    
    // Reserved TLDs
    mapping(string => bool) public reservedTlds;
    
    // Bonding curve parameters
    uint256 public constant BASE_PRICE = 1 ether;    // Base price for TLDs
    uint256 public constant LENGTH_MULTIPLIER = 2;   // Price multiplier based on length

    // Events
    event DomainRegistered(string name, string tld, address owner);
    event TldCreated(string tld, address owner);
    event DomainContentUpdated(string fullDomain, string contentHash);
    event DomainTransferred(string fullDomain, address from, address to);

    constructor() {
        // Reserve initial TLDs
        reservedTlds["joy"] = true;
        reservedTlds["dao"] = true;
        reservedTlds["ai"] = true;
        
        // Set contract owner as initial owner of reserved TLDs
        tldOwners["joy"] = owner();
        tldOwners["dao"] = owner();
        tldOwners["ai"] = owner();
    }

    /**
     * @dev Calculate the price for a TLD based on length
     */
    function calculateTldPrice(string memory tld) public pure returns (uint256) {
        return BASE_PRICE * (LENGTH_MULTIPLIER ** bytes(tld).length);
    }

    /**
     * @dev Register a new TLD
     */
    function registerTld(string memory tld) external payable nonReentrant {
        require(!reservedTlds[tld], "TLD is reserved");
        require(tldOwners[tld] == address(0), "TLD already registered");
        require(bytes(tld).length >= 2, "TLD too short");
        
        uint256 price = calculateTldPrice(tld);
        require(msg.value >= price, "Insufficient payment");

        tldOwners[tld] = msg.sender;
        emit TldCreated(tld, msg.sender);
    }

    /**
     * @dev Register a domain under a TLD
     */
    function registerDomain(string memory name, string memory tld) external {
        require(tldOwners[tld] != address(0), "TLD not registered");
        
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        require(domains[domainHash].owner == address(0), "Domain already registered");

        domains[domainHash] = Domain({
            owner: msg.sender,
            tld: tld,
            name: name,
            registered: block.timestamp,
            contentHash: "",
            isActive: true
        });

        emit DomainRegistered(name, tld, msg.sender);
    }

    /**
     * @dev Update domain content hash (IPFS/Arweave)
     */
    function updateDomainContent(string memory name, string memory tld, string memory contentHash) external {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        require(domains[domainHash].owner == msg.sender, "Not domain owner");
        
        domains[domainHash].contentHash = contentHash;
        emit DomainContentUpdated(string(abi.encodePacked(name, ".", tld)), contentHash);
    }

    /**
     * @dev Transfer domain ownership
     */
    function transferDomain(string memory name, string memory tld, address newOwner) external {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        require(domains[domainHash].owner == msg.sender, "Not domain owner");
        require(newOwner != address(0), "Invalid new owner");

        address previousOwner = domains[domainHash].owner;
        domains[domainHash].owner = newOwner;
        
        emit DomainTransferred(
            string(abi.encodePacked(name, ".", tld)),
            previousOwner,
            newOwner
        );
    }

    /**
     * @dev Check if a domain is available
     */
    function isDomainAvailable(string memory name, string memory tld) external view returns (bool) {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        return domains[domainHash].owner == address(0);
    }

    /**
     * @dev Get domain information
     */
    function getDomainInfo(string memory name, string memory tld) external view returns (
        address owner,
        uint256 registered,
        string memory contentHash,
        bool isActive
    ) {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        Domain storage domain = domains[domainHash];
        return (
            domain.owner,
            domain.registered,
            domain.contentHash,
            domain.isActive
        );
    }
}