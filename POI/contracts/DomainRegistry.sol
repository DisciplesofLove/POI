// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TokenEconomics.sol";
import "./DynamicFees.sol";

/**
 * @title DomainRegistry
 * @dev Decentralized domain name registration system with ENS compatibility
 */
contract DomainRegistry is Ownable, ReentrancyGuard {
    IERC20 public joyToken;
    TokenEconomics public tokenEconomics;
    DynamicFees public feeSystem;
    
    // Domain record structure
    struct Domain {
        address owner;
        string resolverAddress;  // IPFS hash or other resolver data
        uint256 registrationTime;
        uint256 expiryTime;
        bool isActive;
    }
    
    // Mappings
    mapping(bytes32 => Domain) public domains;          // domainHash => Domain
    mapping(address => bytes32[]) public userDomains;   // user => domain hashes
    mapping(bytes32 => string) public reverseLookup;    // domainHash => domain name
    
    // Constants
    uint256 public constant MIN_REGISTRATION_PERIOD = 365 days;
    uint256 public constant MAX_REGISTRATION_PERIOD = 10 * 365 days;
    uint256 public constant GRACE_PERIOD = 30 days;
    
    // Events
    event DomainRegistered(bytes32 indexed domainHash, string name, address indexed owner, uint256 expiryTime);
    event DomainRenewed(bytes32 indexed domainHash, uint256 newExpiryTime);
    event DomainTransferred(bytes32 indexed domainHash, address indexed oldOwner, address indexed newOwner);
    event ResolverUpdated(bytes32 indexed domainHash, string newResolver);
    event DomainReleased(bytes32 indexed domainHash);
    
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
     * @dev Register a new domain
     */
    function registerDomain(
        string calldata name,
        string calldata resolver,
        uint256 registrationYears
    ) external nonReentrant {
        require(registrationYears >= 1 && registrationYears <= 10, "Invalid registration period");
        require(bytes(name).length >= 3, "Name too short");
        
        bytes32 domainHash = keccak256(abi.encodePacked(name));
        require(!isDomainActive(domainHash), "Domain not available");
        
        // Calculate registration fee
        uint256 fee = feeSystem.calculateDomainRegistrationFee(
            msg.sender,
            bytes(name).length,
            registrationYears
        );
        
        require(joyToken.transferFrom(msg.sender, address(this), fee), "Fee transfer failed");
        
        // Register domain
        uint256 registrationPeriod = registrationYears * 365 days;
        domains[domainHash] = Domain({
            owner: msg.sender,
            resolverAddress: resolver,
            registrationTime: block.timestamp,
            expiryTime: block.timestamp + registrationPeriod,
            isActive: true
        });
        
        userDomains[msg.sender].push(domainHash);
        reverseLookup[domainHash] = name;
        
        // Update participation score
        tokenEconomics.updateParticipationScore(
            msg.sender,
            tokenEconomics.participationScore(msg.sender) + 5
        );
        
        emit DomainRegistered(domainHash, name, msg.sender, block.timestamp + registrationPeriod);
    }
    
    /**
     * @dev Renew domain registration
     */
    function renewDomain(bytes32 domainHash, uint256 renewalYears) external nonReentrant {
        require(renewalYears >= 1 && renewalYears <= 10, "Invalid renewal period");
        Domain storage domain = domains[domainHash];
        require(domain.isActive, "Domain not active");
        require(domain.owner == msg.sender, "Not domain owner");
        
        string memory name = reverseLookup[domainHash];
        uint256 fee = feeSystem.calculateDomainRegistrationFee(
            msg.sender,
            bytes(name).length,
            renewalYears
        );
        
        require(joyToken.transferFrom(msg.sender, address(this), fee), "Fee transfer failed");
        
        uint256 newExpiryTime;
        if (block.timestamp > domain.expiryTime) {
            newExpiryTime = block.timestamp + (renewalYears * 365 days);
        } else {
            newExpiryTime = domain.expiryTime + (renewalYears * 365 days);
        }
        
        domain.expiryTime = newExpiryTime;
        emit DomainRenewed(domainHash, newExpiryTime);
    }
    
    /**
     * @dev Transfer domain ownership
     */
    function transferDomain(bytes32 domainHash, address newOwner) external {
        require(newOwner != address(0), "Invalid address");
        Domain storage domain = domains[domainHash];
        require(domain.isActive, "Domain not active");
        require(domain.owner == msg.sender, "Not domain owner");
        
        // Remove from old owner's list
        removeFromUserDomains(msg.sender, domainHash);
        
        // Add to new owner's list
        userDomains[newOwner].push(domainHash);
        
        // Update ownership
        domain.owner = newOwner;
        
        emit DomainTransferred(domainHash, msg.sender, newOwner);
    }
    
    /**
     * @dev Update domain resolver
     */
    function updateResolver(bytes32 domainHash, string calldata newResolver) external {
        Domain storage domain = domains[domainHash];
        require(domain.isActive, "Domain not active");
        require(domain.owner == msg.sender, "Not domain owner");
        
        domain.resolverAddress = newResolver;
        emit ResolverUpdated(domainHash, newResolver);
    }
    
    /**
     * @dev Release an expired domain
     */
    function releaseDomain(bytes32 domainHash) external {
        Domain storage domain = domains[domainHash];
        require(domain.isActive, "Domain not active");
        require(
            block.timestamp > domain.expiryTime + GRACE_PERIOD,
            "Domain not expired or in grace period"
        );
        
        removeFromUserDomains(domain.owner, domainHash);
        domain.isActive = false;
        
        emit DomainReleased(domainHash);
    }
    
    /**
     * @dev Check if a domain is active
     */
    function isDomainActive(bytes32 domainHash) public view returns (bool) {
        Domain storage domain = domains[domainHash];
        if (!domain.isActive) return false;
        if (block.timestamp > domain.expiryTime + GRACE_PERIOD) return false;
        return true;
    }
    
    /**
     * @dev Get domain information
     */
    function getDomainInfo(bytes32 domainHash) external view returns (
        address owner,
        string memory resolverAddress,
        uint256 registrationTime,
        uint256 expiryTime,
        bool isActive,
        string memory name
    ) {
        Domain storage domain = domains[domainHash];
        return (
            domain.owner,
            domain.resolverAddress,
            domain.registrationTime,
            domain.expiryTime,
            domain.isActive,
            reverseLookup[domainHash]
        );
    }
    
    /**
     * @dev Get all domains owned by a user
     */
    function getUserDomainCount(address user) external view returns (uint256) {
        return userDomains[user].length;
    }
    
    /**
     * @dev Get domain hash by index for a user
     */
    function getUserDomainAtIndex(address user, uint256 index) external view returns (bytes32) {
        require(index < userDomains[user].length, "Index out of bounds");
        return userDomains[user][index];
    }
    
    /**
     * @dev Remove domain from user's domain list
     */
    function removeFromUserDomains(address user, bytes32 domainHash) internal {
        uint256 length = userDomains[user].length;
        for (uint256 i = 0; i < length; i++) {
            if (userDomains[user][i] == domainHash) {
                if (i != length - 1) {
                    userDomains[user][i] = userDomains[user][length - 1];
                }
                userDomains[user].pop();
                break;
            }
        }
    }
    
    /**
     * @dev Withdraw accumulated fees (only owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = joyToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(joyToken.transfer(owner(), balance), "Transfer failed");
    }
}