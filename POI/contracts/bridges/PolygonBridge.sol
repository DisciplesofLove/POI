// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../JoyTokenV2.sol";

/**
 * @title PolygonBridge
 * @dev Bridge contract for handling JoyToken transfers between Polygon and other chains
 */
contract PolygonBridge is Ownable, Pausable, ReentrancyGuard {
    JoyTokenV2 public joyToken;
    
    // Mapping of supported chains to their identifiers
    mapping(bytes32 => bool) public supportedChains;
    
    // Mapping to track processed transactions from other chains
    mapping(bytes32 => bool) public processedIncomingTx;
    
    // Required number of validator signatures for cross-chain transfers
    uint256 public constant REQUIRED_SIGNATURES = 5;
    
    // Mapping of authorized validators
    mapping(address => bool) public validators;
    uint256 public validatorCount;
    
    // Events
    event ChainAdded(bytes32 indexed chainId);
    event ChainRemoved(bytes32 indexed chainId);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event TokensLocked(address indexed from, bytes32 indexed targetChain, uint256 amount);
    event TokensUnlocked(address indexed to, bytes32 indexed sourceChain, uint256 amount);
    
    constructor(address _joyToken) {
        require(_joyToken != address(0), "Invalid token address");
        joyToken = JoyTokenV2(_joyToken);
    }
    
    // Chain Management
    
    function addSupportedChain(bytes32 chainId) external onlyOwner {
        require(!supportedChains[chainId], "Chain already supported");
        supportedChains[chainId] = true;
        emit ChainAdded(chainId);
    }
    
    function removeSupportedChain(bytes32 chainId) external onlyOwner {
        require(supportedChains[chainId], "Chain not supported");
        supportedChains[chainId] = false;
        emit ChainRemoved(chainId);
    }
    
    // Validator Management
    
    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "Invalid validator address");
        require(!validators[validator], "Already a validator");
        validators[validator] = true;
        validatorCount++;
        emit ValidatorAdded(validator);
    }
    
    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Not a validator");
        validators[validator] = false;
        validatorCount--;
        emit ValidatorRemoved(validator);
    }
    
    // Bridge Operations
    
    function lockTokens(bytes32 targetChain, uint256 amount) external whenNotPaused nonReentrant {
        require(supportedChains[targetChain], "Unsupported chain");
        require(amount > 0, "Amount must be positive");
        
        // Transfer tokens from user to bridge contract
        require(joyToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        emit TokensLocked(msg.sender, targetChain, amount);
    }
    
    function unlockTokens(
        address to,
        bytes32 sourceChain,
        uint256 amount,
        bytes32 txHash,
        bytes[] calldata signatures
    ) external whenNotPaused nonReentrant {
        require(supportedChains[sourceChain], "Unsupported chain");
        require(!processedIncomingTx[txHash], "Transaction already processed");
        require(signatures.length >= REQUIRED_SIGNATURES, "Insufficient signatures");
        
        // Verify signatures from validators
        bytes32 message = keccak256(abi.encodePacked(to, sourceChain, amount, txHash));
        _verifySignatures(message, signatures);
        
        processedIncomingTx[txHash] = true;
        require(joyToken.transfer(to, amount), "Transfer failed");
        
        emit TokensUnlocked(to, sourceChain, amount);
    }
    
    // Internal Functions
    
    function _verifySignatures(bytes32 message, bytes[] calldata signatures) internal view {
        uint256 validSignatures = 0;
        address[] memory usedAddresses = new address[](signatures.length);
        
        for (uint i = 0; i < signatures.length; i++) {
            address signer = _recoverSigner(message, signatures[i]);
            
            // Check if signer is a validator and hasn't signed already
            if (validators[signer] && !_addressUsed(usedAddresses, signer)) {
                usedAddresses[validSignatures] = signer;
                validSignatures++;
            }
        }
        
        require(validSignatures >= REQUIRED_SIGNATURES, "Invalid signatures");
    }
    
    function _recoverSigner(bytes32 message, bytes memory signature) internal pure returns (address) {
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        return ecrecover(message, v, r, s);
    }
    
    function _addressUsed(address[] memory addresses, address target) internal pure returns (bool) {
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i] == target) return true;
        }
        return false;
    }
    
    // Emergency Controls
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}