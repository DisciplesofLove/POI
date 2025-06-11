// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ModelMarketplace.sol";
import "./ProofOfInference.sol";

/**
 * @title PrivacyPreservingAI
 * @dev Enables privacy-preserving AI inference using zero-knowledge proofs
 */
contract PrivacyPreservingAI is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    ModelMarketplace public modelMarketplace;
    ProofOfInference public proofOfInference;
    
    // Privacy computation request
    struct PrivacyRequest {
        uint256 requestId;
        address requester;
        uint256 modelId;
        string encryptedInputHash;  // IPFS hash of encrypted input
        string encryptedOutputHash; // IPFS hash of encrypted output
        bytes zkProof;              // Zero-knowledge proof of correct computation
        bool isVerified;
        uint256 timestamp;
    }
    
    // Mapping from request ID to PrivacyRequest
    mapping(uint256 => PrivacyRequest) public privacyRequests;
    uint256 private requestCounter;
    
    // Events
    event PrivacyRequestCreated(uint256 requestId, address requester, uint256 modelId);
    event ResultSubmitted(uint256 requestId, string encryptedOutputHash);
    event ResultVerified(uint256 requestId, bool isValid);
    
    constructor(address _modelMarketplace, address _proofOfInference) {
        modelMarketplace = ModelMarketplace(_modelMarketplace);
        proofOfInference = ProofOfInference(_proofOfInference);
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new privacy-preserving computation request
     */
    function createPrivacyRequest(
        uint256 modelId,
        string memory encryptedInputHash
    ) external returns (uint256) {
        // Ensure model exists
        require(modelMarketplace.modelExists(modelId), "Model does not exist");
        
        requestCounter++;
        uint256 requestId = requestCounter;
        
        privacyRequests[requestId] = PrivacyRequest({
            requestId: requestId,
            requester: msg.sender,
            modelId: modelId,
            encryptedInputHash: encryptedInputHash,
            encryptedOutputHash: "",
            zkProof: new bytes(0),
            isVerified: false,
            timestamp: block.timestamp
        });
        
        emit PrivacyRequestCreated(requestId, msg.sender, modelId);
        
        return requestId;
    }
    
    /**
     * @dev Submit computation result with zero-knowledge proof
     */
    function submitResult(
        uint256 requestId,
        string memory encryptedOutputHash,
        bytes memory zkProof
    ) external {
        PrivacyRequest storage request = privacyRequests[requestId];
        require(request.timestamp > 0, "Request does not exist");
        require(bytes(request.encryptedOutputHash).length == 0, "Result already submitted");
        
        // In production, verify that sender is an authorized compute node
        
        request.encryptedOutputHash = encryptedOutputHash;
        request.zkProof = zkProof;
        
        emit ResultSubmitted(requestId, encryptedOutputHash);
    }
    
    /**
     * @dev Verify computation result using zero-knowledge proof
     */
    function verifyResult(uint256 requestId) external onlyRole(VERIFIER_ROLE) {
        PrivacyRequest storage request = privacyRequests[requestId];
        require(request.timestamp > 0, "Request does not exist");
        require(bytes(request.encryptedOutputHash).length > 0, "Result not submitted");
        require(!request.isVerified, "Already verified");
        
        // In production, implement actual ZK proof verification
        // This is a placeholder for the actual verification logic
        bool isValid = true; // Replace with actual verification
        
        request.isVerified = isValid;
        
        emit ResultVerified(requestId, isValid);
    }
    
    /**
     * @dev Get privacy request details
     */
    function getPrivacyRequest(uint256 requestId) external view returns (
        address requester,
        uint256 modelId,
        string memory encryptedInputHash,
        string memory encryptedOutputHash,
        bool isVerified,
        uint256 timestamp
    ) {
        PrivacyRequest memory request = privacyRequests[requestId];
        require(request.timestamp > 0, "Request does not exist");
        
        return (
            request.requester,
            request.modelId,
            request.encryptedInputHash,
            request.encryptedOutputHash,
            request.isVerified,
            request.timestamp
        );
    }
}