// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./EnhancedSovereignRPC.sol";

/**
 * @title ProofOfUse
 * @dev Handles immutable logging of usage proofs, data integrity, and inference tracking
 */
contract ProofOfUse is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // Constants
    uint256 public constant PROOF_EXPIRATION = 30 days;
    uint256 public constant MIN_VERIFIERS = 3;

    // Structs
    struct UsageProof {
        bytes32 contentHash;
        address user;
        uint256 timestamp;
        ProofType proofType;
        bytes32 metadataHash;
        uint256 verifierCount;
        bool isValid;
    }

    struct DataIntegrityProof {
        bytes32 originalHash;
        bytes32[] replicaHashes;
        address[] verifiers;
        uint256 timestamp;
        bool isValid;
    }

    struct InferenceProof {
        bytes32 modelHash;
        bytes32 inputHash;
        bytes32 outputHash;
        address[] verifiers;
        uint256 timestamp;
        bool isValid;
    }

    // Enums
    enum ProofType { USE, INTEGRITY, INFERENCE }

    // State variables
    EnhancedSovereignRPC public rpcContract;
    mapping(bytes32 => UsageProof) public usageProofs;
    mapping(bytes32 => DataIntegrityProof) public integrityProofs;
    mapping(bytes32 => InferenceProof) public inferenceProofs;
    mapping(address => bool) public verifiers;
    uint256 public totalVerifiers;

    // Events
    event UsageProofSubmitted(bytes32 indexed proofId, address indexed user, ProofType proofType);
    event ProofVerified(bytes32 indexed proofId, address indexed verifier, bool isValid);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    event DataIntegrityVerified(bytes32 indexed contentHash, bool isValid);
    event InferenceVerified(bytes32 indexed modelHash, bytes32 indexed inputHash, bool isValid);

    /**
     * @dev Constructor
     */
    constructor(address _rpcContract) {
        rpcContract = EnhancedSovereignRPC(_rpcContract);
    }

    /**
     * @dev Submit a new usage proof
     */
    function submitUsageProof(
        bytes32 contentHash,
        ProofType proofType,
        bytes32 metadataHash,
        bytes memory signature
    ) external nonReentrant {
        require(contentHash != bytes32(0), "Invalid content hash");
        
        bytes32 proofId = keccak256(abi.encodePacked(
            contentHash,
            msg.sender,
            block.timestamp,
            proofType,
            metadataHash
        ));

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(proofId)).toEthSignedMessageHash();
        require(messageHash.recover(signature) == msg.sender, "Invalid signature");

        usageProofs[proofId] = UsageProof({
            contentHash: contentHash,
            user: msg.sender,
            timestamp: block.timestamp,
            proofType: proofType,
            metadataHash: metadataHash,
            verifierCount: 0,
            isValid: false
        });

        emit UsageProofSubmitted(proofId, msg.sender, proofType);
    }

    /**
     * @dev Submit data integrity proof
     */
    function submitIntegrityProof(
        bytes32 originalHash,
        bytes32[] memory replicaHashes
    ) external {
        require(verifiers[msg.sender], "Not an authorized verifier");
        require(replicaHashes.length > 0, "No replica hashes provided");

        bytes32 proofId = keccak256(abi.encodePacked(originalHash, block.timestamp));
        
        DataIntegrityProof storage proof = integrityProofs[proofId];
        proof.originalHash = originalHash;
        proof.replicaHashes = replicaHashes;
        proof.timestamp = block.timestamp;
        proof.verifiers.push(msg.sender);
        
        if (proof.verifiers.length >= MIN_VERIFIERS) {
            proof.isValid = true;
            emit DataIntegrityVerified(originalHash, true);
        }
    }

    /**
     * @dev Submit inference proof
     */
    function submitInferenceProof(
        bytes32 modelHash,
        bytes32 inputHash,
        bytes32 outputHash,
        bytes memory signature
    ) external {
        require(verifiers[msg.sender], "Not an authorized verifier");

        bytes32 proofId = keccak256(abi.encodePacked(
            modelHash,
            inputHash,
            outputHash,
            block.timestamp
        ));

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(proofId)).toEthSignedMessageHash();
        require(messageHash.recover(signature) == msg.sender, "Invalid signature");

        InferenceProof storage proof = inferenceProofs[proofId];
        proof.modelHash = modelHash;
        proof.inputHash = inputHash;
        proof.outputHash = outputHash;
        proof.timestamp = block.timestamp;
        proof.verifiers.push(msg.sender);

        if (proof.verifiers.length >= MIN_VERIFIERS) {
            proof.isValid = true;
            emit InferenceVerified(modelHash, inputHash, true);
        }
    }

    /**
     * @dev Verify a usage proof
     */
    function verifyProof(bytes32 proofId) external {
        require(verifiers[msg.sender], "Not an authorized verifier");
        require(usageProofs[proofId].timestamp > 0, "Proof does not exist");
        require(block.timestamp - usageProofs[proofId].timestamp <= PROOF_EXPIRATION, "Proof expired");

        UsageProof storage proof = usageProofs[proofId];
        proof.verifierCount++;

        if (proof.verifierCount >= MIN_VERIFIERS) {
            proof.isValid = true;
        }

        emit ProofVerified(proofId, msg.sender, proof.isValid);
    }

    /**
     * @dev Add a new verifier
     */
    function addVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        require(!verifiers[verifier], "Verifier already exists");

        verifiers[verifier] = true;
        totalVerifiers++;

        emit VerifierAdded(verifier);
    }

    /**
     * @dev Remove a verifier
     */
    function removeVerifier(address verifier) external onlyOwner {
        require(verifiers[verifier], "Verifier does not exist");
        require(totalVerifiers > MIN_VERIFIERS, "Cannot remove verifier");

        verifiers[verifier] = false;
        totalVerifiers--;

        emit VerifierRemoved(verifier);
    }

    /**
     * @dev Get proof details
     */
    function getProofDetails(bytes32 proofId) external view returns (
        address user,
        uint256 timestamp,
        ProofType proofType,
        bool isValid
    ) {
        UsageProof storage proof = usageProofs[proofId];
        return (
            proof.user,
            proof.timestamp,
            proof.proofType,
            proof.isValid
        );
    }

    /**
     * @dev Get integrity proof details
     */
    function getIntegrityProofDetails(bytes32 proofId) external view returns (
        bytes32 originalHash,
        uint256 replicaCount,
        uint256 verifierCount,
        bool isValid
    ) {
        DataIntegrityProof storage proof = integrityProofs[proofId];
        return (
            proof.originalHash,
            proof.replicaHashes.length,
            proof.verifiers.length,
            proof.isValid
        );
    }

    /**
     * @dev Get inference proof details
     */
    function getInferenceProofDetails(bytes32 proofId) external view returns (
        bytes32 modelHash,
        bytes32 inputHash,
        bytes32 outputHash,
        uint256 verifierCount,
        bool isValid
    ) {
        InferenceProof storage proof = inferenceProofs[proofId];
        return (
            proof.modelHash,
            proof.inputHash,
            proof.outputHash,
            proof.verifiers.length,
            proof.isValid
        );
    }

    /**
     * @dev Check if an address is a verifier
     */
    function isVerifier(address account) external view returns (bool) {
        return verifiers[account];
    }
}