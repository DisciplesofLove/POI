// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ZKVerifier.sol";

/**
 * @title ProofOfInference
 * @dev Manages proof of AI model inference execution
 */
contract ProofOfInference is Ownable {
    // ZKVerifier contract
    ZKVerifier public zkVerifier;
    
    // Structure for inference proofs
    struct InferenceProof {
        bytes32 modelId;
        bytes32 inputHash;
        bytes32 outputHash;
        bytes32 zkProof;
        bool isVerified;
        uint256 timestamp;
    }
    
    // Mapping of execution IDs to proofs
    mapping(bytes32 => InferenceProof) public proofs;
    
    // Events
    event ProofSubmitted(bytes32 indexed executionId, bytes32 indexed modelId);
    event ProofVerified(bytes32 indexed executionId, bool success);
    
    constructor(address _zkVerifier) {
        zkVerifier = ZKVerifier(_zkVerifier);
    }
    
    /**
     * @dev Submit a new inference proof
     */
    function submitProof(
        bytes32 executionId,
        bytes32 modelId,
        bytes32 inputHash,
        bytes32 outputHash,
        bytes32 zkProof
    ) external {
        require(proofs[executionId].timestamp == 0, "Proof exists");
        
        proofs[executionId] = InferenceProof({
            modelId: modelId,
            inputHash: inputHash,
            outputHash: outputHash,
            zkProof: zkProof,
            isVerified: false,
            timestamp: block.timestamp
        });
        
        emit ProofSubmitted(executionId, modelId);
        
        // Automatically verify the proof
        _verifyProof(executionId);
    }
    
    /**
     * @dev Internal function to verify a proof
     */
    function _verifyProof(bytes32 executionId) internal {
        InferenceProof storage proof = proofs[executionId];
        
        bool isValid = zkVerifier.verifyProof(
            proof.modelId,
            proof.inputHash,
            proof.outputHash,
            proof.zkProof
        );
        
        proof.isVerified = isValid;
        emit ProofVerified(executionId, isValid);
    }
    
    /**
     * @dev Check if an execution has been verified
     */
    function isVerified(bytes32 executionId) external view returns (bool) {
        return proofs[executionId].isVerified;
    }
    
    /**
     * @dev Get proof details
     */
    function getProof(bytes32 executionId) external view returns (
        bytes32 modelId,
        bytes32 inputHash,
        bytes32 outputHash,
        bytes32 zkProof,
        bool isVerified,
        uint256 timestamp
    ) {
        InferenceProof storage proof = proofs[executionId];
        return (
            proof.modelId,
            proof.inputHash,
            proof.outputHash,
            proof.zkProof,
            proof.isVerified,
            proof.timestamp
        );
    }
}