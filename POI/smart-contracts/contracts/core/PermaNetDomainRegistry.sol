// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ProofOfUse.sol";
import "./ProofOfIntegrity.sol";
import "./ProofOfInference.sol";

/**
 * @title PermaNetDomainRegistry
 * @dev Manages permanent domain registration for the PermaNet decentralized internet
 */
contract PermaNetDomainRegistry is Ownable, ReentrancyGuard {
    using Strings for uint256;

    // Core contracts
    IERC20 public joyToken;
    ProofOfUse public pouContract;
    ProofOfIntegrity public poiContract;
    ProofOfInference public poinfContract;

    // Struct to store domain information
    struct Domain {
        address owner;
        string tld;           // Top Level Domain (e.g., "joy", "dao", "ai")
        string name;          // Domain name without TLD
        uint256 registered;   // Registration timestamp
        string contentHash;   // IPFS/Arweave hash for domain content
        bool isActive;
        bool pouEnabled;      // Whether POU is required
        bool poiEnabled;      // Whether POI is required
        bool poinfEnabled;    // Whether POInf is enabled
    }

    // Mapping from domain hash to Domain struct
    mapping(bytes32 => Domain) public domains;
    
    // Mapping from TLD to its owner/DAO
    mapping(string => address) public tldOwners;
    
    // Reserved TLDs
    mapping(string => bool) public reservedTlds;
    
    // Bonding curve parameters
    uint256 public constant BASE_PRICE = 1000 * 10**18;  // Base price in JOY tokens
    uint256 public constant LENGTH_MULTIPLIER = 2;        // Price multiplier based on length

    // Events
    event DomainRegistered(string name, string tld, address owner);
    event TldCreated(string tld, address owner);
    event DomainContentUpdated(string fullDomain, string contentHash);
    event DomainTransferred(string fullDomain, address from, address to);
    event ProofConfigUpdated(string fullDomain, bool pouEnabled, bool poiEnabled, bool poinfEnabled);

    constructor(
        address _joyToken,
        address _pouContract,
        address _poiContract,
        address _poinfContract
    ) {
        joyToken = IERC20(_joyToken);
        pouContract = ProofOfUse(_pouContract);
        poiContract = ProofOfIntegrity(_poiContract);
        poinfContract = ProofOfInference(_poinfContract);

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
    function registerTld(string memory tld) external nonReentrant {
        require(!reservedTlds[tld], "TLD is reserved");
        require(tldOwners[tld] == address(0), "TLD already registered");
        require(bytes(tld).length >= 2, "TLD too short");
        
        uint256 price = calculateTldPrice(tld);
        require(joyToken.transferFrom(msg.sender, address(this), price), "Payment failed");

        tldOwners[tld] = msg.sender;
        emit TldCreated(tld, msg.sender);
    }

    /**
     * @dev Register a domain under a TLD
     */
    function registerDomain(
        string memory name,
        string memory tld,
        bool pouEnabled,
        bool poiEnabled,
        bool poinfEnabled
    ) external {
        require(tldOwners[tld] != address(0), "TLD not registered");
        
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        require(domains[domainHash].owner == address(0), "Domain already registered");

        domains[domainHash] = Domain({
            owner: msg.sender,
            tld: tld,
            name: name,
            registered: block.timestamp,
            contentHash: "",
            isActive: true,
            pouEnabled: pouEnabled,
            poiEnabled: poiEnabled,
            poinfEnabled: poinfEnabled
        });

        emit DomainRegistered(name, tld, msg.sender);
        emit ProofConfigUpdated(
            string(abi.encodePacked(name, ".", tld)),
            pouEnabled,
            poiEnabled,
            poinfEnabled
        );
    }

    /**
     * @dev Update domain content hash (IPFS/Arweave)
     */
    function updateDomainContent(
        string memory name,
        string memory tld,
        string memory contentHash
    ) external {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        require(domains[domainHash].owner == msg.sender, "Not domain owner");
        
        Domain storage domain = domains[domainHash];
        require(domain.isActive, "Domain not active");
        
        if (domain.poiEnabled) {
            require(
                poiContract.verifyIntegrity(name, tld, contentHash),
                "POI verification failed"
            );
        }
        
        domain.contentHash = contentHash;
        emit DomainContentUpdated(string(abi.encodePacked(name, ".", tld)), contentHash);
    }

    /**
     * @dev Transfer domain ownership
     */
    function transferDomain(
        string memory name,
        string memory tld,
        address newOwner
    ) external {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        require(domains[domainHash].owner == msg.sender, "Not domain owner");
        require(newOwner != address(0), "Invalid new owner");

        Domain storage domain = domains[domainHash];
        require(domain.isActive, "Domain not active");
        
        if (domain.pouEnabled) {
            require(
                pouContract.checkPOUCompliance(name, tld),
                "Domain not compliant with POU"
            );
        }

        address previousOwner = domain.owner;
        domain.owner = newOwner;
        
        emit DomainTransferred(
            string(abi.encodePacked(name, ".", tld)),
            previousOwner,
            newOwner
        );
    }

    /**
     * @dev Update proof requirements for a domain
     */
    function updateProofConfig(
        string memory name,
        string memory tld,
        bool pouEnabled,
        bool poiEnabled,
        bool poinfEnabled
    ) external {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        require(domains[domainHash].owner == msg.sender, "Not domain owner");
        
        Domain storage domain = domains[domainHash];
        domain.pouEnabled = pouEnabled;
        domain.poiEnabled = poiEnabled;
        domain.poinfEnabled = poinfEnabled;
        
        emit ProofConfigUpdated(
            string(abi.encodePacked(name, ".", tld)),
            pouEnabled,
            poiEnabled,
            poinfEnabled
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
        bool isActive,
        bool pouEnabled,
        bool poiEnabled,
        bool poinfEnabled
    ) {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        Domain storage domain = domains[domainHash];
        return (
            domain.owner,
            domain.registered,
            domain.contentHash,
            domain.isActive,
            domain.pouEnabled,
            domain.poiEnabled,
            domain.poinfEnabled
        );
    }

    /**
     * @dev Check if a domain is compliant with all enabled proofs
     */
    function checkDomainCompliance(string memory name, string memory tld) external view returns (bool) {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        Domain storage domain = domains[domainHash];
        
        if (!domain.isActive) {
            return false;
        }
        
        if (domain.pouEnabled && !pouContract.checkPOUCompliance(name, tld)) {
            return false;
        }
        
        if (domain.poiEnabled && domain.contentHash != "") {
            if (!poiContract.verifyIntegrity(name, tld, domain.contentHash)) {
                return false;
            }
        }
        
        return true;
    }
}