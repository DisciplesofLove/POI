// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PermaNetDomainRegistry.sol";
import "./ProofOfIntegrity.sol";

/**
 * @title ProofOfInference
 * @dev Manages Proof of Inference (POInf) for AI model usage
 */
contract ProofOfInference is Ownable, ReentrancyGuard {
    PermaNetDomainRegistry public domainRegistry;
    ProofOfIntegrity public poiContract;
    IERC20 public joyToken;
    
    struct InferenceConfig {
        uint256 pricePerInference;   // Price in JOY tokens
        bool isEnabled;              // Whether inferences are allowed
        address paymentReceiver;     // Where to send payments (usually domain owner)
    }
    
    struct InferenceProof {
        string modelHash;            // Hash of the model used
        string inputHash;            // Hash of the input data
        string outputHash;           // Hash of the output data
        string iotaMessageId;        // IOTA message ID containing proof
        uint256 timestamp;           // When the inference occurred
        address user;                // Who requested the inference
    }
    
    // Mapping from domain hash to inference configuration
    mapping(bytes32 => InferenceConfig) public inferenceConfigs;
    
    // Mapping from domain hash to array of inference proofs
    mapping(bytes32 => InferenceProof[]) public inferenceProofs;
    
    // Mapping from domain hash to total inferences
    mapping(bytes32 => uint256) public totalInferences;
    
    // Events
    event InferenceConfigUpdated(
        string domain,
        uint256 price,
        bool enabled,
        address paymentReceiver
    );
    
    event InferenceProofSubmitted(
        string domain,
        string modelHash,
        string inputHash,
        string outputHash,
        string iotaMessageId,
        address user
    );
    
    event InferencePaymentProcessed(
        string domain,
        address user,
        address receiver,
        uint256 amount
    );
    
    constructor(
        address _domainRegistry,
        address _poiContract,
        address _joyToken
    ) {
        domainRegistry = PermaNetDomainRegistry(_domainRegistry);
        poiContract = ProofOfIntegrity(_poiContract);
        joyToken = IERC20(_joyToken);
    }
    
    /**
     * @dev Update inference configuration for a domain
     */
    function updateInferenceConfig(
        string memory name,
        string memory tld,
        uint256 price,
        bool enabled,
        address paymentReceiver
    ) external {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        
        // Verify domain ownership
        (address owner,,,,) = domainRegistry.getDomainInfo(name, tld);
        require(owner == msg.sender, "Not domain owner");
        
        inferenceConfigs[domainHash] = InferenceConfig({
            pricePerInference: price,
            isEnabled: enabled,
            paymentReceiver: paymentReceiver == address(0) ? msg.sender : paymentReceiver
        });
        
        emit InferenceConfigUpdated(
            string(abi.encodePacked(name, ".", tld)),
            price,
            enabled,
            paymentReceiver == address(0) ? msg.sender : paymentReceiver
        );
    }
    
    /**
     * @dev Submit a proof of inference
     */
    function submitInferenceProof(
        string memory name,
        string memory tld,
        string memory modelHash,
        string memory inputHash,
        string memory outputHash,
        string memory iotaMessageId
    ) external nonReentrant {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        InferenceConfig storage config = inferenceConfigs[domainHash];
        
        require(config.isEnabled, "Inferences not enabled");
        
        // Verify model integrity
        require(
            poiContract.verifyIntegrity(name, tld, modelHash),
            "Invalid model hash"
        );
        
        // Process payment
        if (config.pricePerInference > 0) {
            require(
                joyToken.transferFrom(msg.sender, config.paymentReceiver, config.pricePerInference),
                "Payment failed"
            );
            
            emit InferencePaymentProcessed(
                string(abi.encodePacked(name, ".", tld)),
                msg.sender,
                config.paymentReceiver,
                config.pricePerInference
            );
        }
        
        // Record the inference proof
        inferenceProofs[domainHash].push(InferenceProof({
            modelHash: modelHash,
            inputHash: inputHash,
            outputHash: outputHash,
            iotaMessageId: iotaMessageId,
            timestamp: block.timestamp,
            user: msg.sender
        }));
        
        totalInferences[domainHash]++;
        
        emit InferenceProofSubmitted(
            string(abi.encodePacked(name, ".", tld)),
            modelHash,
            inputHash,
            outputHash,
            iotaMessageId,
            msg.sender
        );
    }
    
    /**
     * @dev Get inference statistics for a domain
     */
    function getInferenceStats(string memory name, string memory tld) external view returns (
        uint256 total,
        uint256 price,
        bool enabled,
        address paymentReceiver
    ) {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        InferenceConfig storage config = inferenceConfigs[domainHash];
        
        return (
            totalInferences[domainHash],
            config.pricePerInference,
            config.isEnabled,
            config.paymentReceiver
        );
    }
    
    /**
     * @dev Get recent inferences for a domain
     */
    function getRecentInferences(
        string memory name,
        string memory tld,
        uint256 count
    ) external view returns (
        string[] memory modelHashes,
        string[] memory inputHashes,
        string[] memory outputHashes,
        string[] memory iotaMessageIds,
        uint256[] memory timestamps,
        address[] memory users
    ) {
        bytes32 domainHash = keccak256(abi.encodePacked(name, ".", tld));
        InferenceProof[] storage proofs = inferenceProofs[domainHash];
        
        uint256 resultCount = count > proofs.length ? proofs.length : count;
        uint256 startIdx = proofs.length - resultCount;
        
        modelHashes = new string[](resultCount);
        inputHashes = new string[](resultCount);
        outputHashes = new string[](resultCount);
        iotaMessageIds = new string[](resultCount);
        timestamps = new uint256[](resultCount);
        users = new address[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            InferenceProof storage proof = proofs[startIdx + i];
            modelHashes[i] = proof.modelHash;
            inputHashes[i] = proof.inputHash;
            outputHashes[i] = proof.outputHash;
            iotaMessageIds[i] = proof.iotaMessageId;
            timestamps[i] = proof.timestamp;
            users[i] = proof.user;
        }
        
        return (modelHashes, inputHashes, outputHashes, iotaMessageIds, timestamps, users);
    }
}