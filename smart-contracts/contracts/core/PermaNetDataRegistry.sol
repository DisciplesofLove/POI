// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PermaNetDomainRegistry.sol";

/**
 * @title PermaNetDataRegistry
 * @dev Manages data pods and unions for PermaNet
 */
contract PermaNetDataRegistry is Ownable, ReentrancyGuard {
    PermaNetDomainRegistry public domainRegistry;
    
    struct DataPod {
        address owner;
        string contentHash;     // IPFS/Arweave hash
        string metadata;        // JSON metadata
        uint256 created;
        bool isActive;
        mapping(address => bool) authorizedUsers;
    }
    
    struct DataUnion {
        address owner;
        string tld;            // e.g., "medical.data"
        uint256 memberCount;
        mapping(address => bool) members;
        mapping(address => bool) subscribers;
    }
    
    // Mapping from domain hash to DataPod
    mapping(bytes32 => DataPod) public dataPods;
    
    // Mapping from TLD to DataUnion
    mapping(string => DataUnion) public dataUnions;
    
    // Events
    event DataPodCreated(string domainName, string tld, string contentHash);
    event DataPodUpdated(string domainName, string tld, string contentHash);
    event DataUnionCreated(string tld, address owner);
    event MemberAdded(string tld, address member);
    event SubscriberAdded(string tld, address subscriber);
    
    constructor(address _domainRegistry) {
        domainRegistry = PermaNetDomainRegistry(_domainRegistry);
    }
    
    /**
     * @dev Create a new data pod
     */
    function createDataPod(
        string memory domainName,
        string memory tld,
        string memory contentHash,
        string memory metadata
    ) external {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName, ".", tld));
        require(domainRegistry.domains(domainHash).owner == msg.sender, "Not domain owner");
        
        DataPod storage pod = dataPods[domainHash];
        require(!pod.isActive, "Pod already exists");
        
        pod.owner = msg.sender;
        pod.contentHash = contentHash;
        pod.metadata = metadata;
        pod.created = block.timestamp;
        pod.isActive = true;
        
        emit DataPodCreated(domainName, tld, contentHash);
    }
    
    /**
     * @dev Create a new data union
     */
    function createDataUnion(string memory tld) external {
        require(domainRegistry.tldOwners(tld) == msg.sender, "Not TLD owner");
        require(bytes(dataUnions[tld].tld).length == 0, "Union already exists");
        
        DataUnion storage union = dataUnions[tld];
        union.owner = msg.sender;
        union.tld = tld;
        union.memberCount = 0;
        
        emit DataUnionCreated(tld, msg.sender);
    }
    
    /**
     * @dev Add member to data union
     */
    function addUnionMember(string memory tld, address member) external {
        DataUnion storage union = dataUnions[tld];
        require(msg.sender == union.owner, "Not union owner");
        require(!union.members[member], "Already a member");
        
        union.members[member] = true;
        union.memberCount++;
        
        emit MemberAdded(tld, member);
    }
    
    /**
     * @dev Add subscriber to data union
     */
    function addUnionSubscriber(string memory tld, address subscriber) external {
        DataUnion storage union = dataUnions[tld];
        require(msg.sender == union.owner, "Not union owner");
        require(!union.subscribers[subscriber], "Already a subscriber");
        
        union.subscribers[subscriber] = true;
        
        emit SubscriberAdded(tld, subscriber);
    }
    
    /**
     * @dev Update data pod content
     */
    function updateDataPod(
        string memory domainName,
        string memory tld,
        string memory contentHash,
        string memory metadata
    ) external {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName, ".", tld));
        DataPod storage pod = dataPods[domainHash];
        require(pod.owner == msg.sender, "Not pod owner");
        
        pod.contentHash = contentHash;
        pod.metadata = metadata;
        
        emit DataPodUpdated(domainName, tld, contentHash);
    }
    
    /**
     * @dev Check if address is authorized for a data pod
     */
    function isAuthorized(string memory domainName, string memory tld, address user) external view returns (bool) {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName, ".", tld));
        DataPod storage pod = dataPods[domainHash];
        return pod.owner == user || pod.authorizedUsers[user];
    }
    
    /**
     * @dev Get data pod information
     */
    function getDataPodInfo(string memory domainName, string memory tld) external view returns (
        address owner,
        string memory contentHash,
        string memory metadata,
        uint256 created,
        bool isActive
    ) {
        bytes32 domainHash = keccak256(abi.encodePacked(domainName, ".", tld));
        DataPod storage pod = dataPods[domainHash];
        return (
            pod.owner,
            pod.contentHash,
            pod.metadata,
            pod.created,
            pod.isActive
        );
    }
}