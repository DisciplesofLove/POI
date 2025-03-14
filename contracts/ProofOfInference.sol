// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProofOfInference
 * @dev Implements the Proof of Inference (PoI) system for validating AI model execution
 */
contract ProofOfInference is Ownable {
    // Token used for staking
    IERC20 public joyToken;
    
    // Minimum stake required to become a validator
    uint256 public minStakeAmount;
    
    // Structure to store validator information
    struct Validator {
        uint256 stakedAmount;
        bool isActive;
        uint256 reputation;
    }
    
    // Structure to store inference execution records
    struct InferenceExecution {
        bytes32 modelId;
        bytes32 inputHash;
        bytes32 outputHash;
        bytes32 zkProof;
        uint256 timestamp;
        address[] validators;
        bool isVerified;
    }
    
    // Mapping of validator addresses to their info
    mapping(address => Validator) public validators;
    
    // Mapping of inference execution IDs to their records
    mapping(bytes32 => InferenceExecution) public executions;
    
    // Events
    event ValidatorRegistered(address indexed validator, uint256 stake);
    event InferenceExecuted(bytes32 indexed executionId, bytes32 modelId);
    event InferenceValidated(bytes32 indexed executionId, bool isValid);
    
    constructor(address _joyToken, uint256 _minStakeAmount) {
        joyToken = IERC20(_joyToken);
        minStakeAmount = _minStakeAmount;
    }
    
    /**
     * @dev Register as a validator by staking tokens
     * @param amount Amount of tokens to stake
     */
    function registerValidator(uint256 amount) external {
        require(amount >= minStakeAmount, "Insufficient stake");
        require(!validators[msg.sender].isActive, "Already registered");
        
        require(joyToken.transferFrom(msg.sender, address(this), amount), "Stake transfer failed");
        
        validators[msg.sender] = Validator({
            stakedAmount: amount,
            isActive: true,
            reputation: 0
        });
        
        emit ValidatorRegistered(msg.sender, amount);
    }
    
    /**
     * @dev Submit an AI model execution for validation
     */
    function submitInference(
        bytes32 modelId,
        bytes32 inputHash,
        bytes32 outputHash,
        bytes32 zkProof
    ) external returns (bytes32) {
        require(validators[msg.sender].isActive, "Not a validator");
        
        bytes32 executionId = keccak256(abi.encodePacked(
            modelId,
            inputHash,
            outputHash,
            zkProof,
            block.timestamp
        ));
        
        address[] memory validatorList = new address[](1);
        validatorList[0] = msg.sender;
        
        executions[executionId] = InferenceExecution({
            modelId: modelId,
            inputHash: inputHash,
            outputHash: outputHash,
            zkProof: zkProof,
            timestamp: block.timestamp,
            validators: validatorList,
            isVerified: false
        });
        
        emit InferenceExecuted(executionId, modelId);
        return executionId;
    }
    
    /**
     * @dev Validate an inference execution
     */
    function validateInference(bytes32 executionId) external {
        require(validators[msg.sender].isActive, "Not a validator");
        InferenceExecution storage execution = executions[executionId];
        require(!execution.isVerified, "Already verified");
        
        // Verify ZK proof here
        // This is a placeholder for actual ZK proof verification
        bool isValid = true;
        
        if (isValid) {
            execution.isVerified = true;
            validators[msg.sender].reputation++;
        }
        
        emit InferenceValidated(executionId, isValid);
    }
}