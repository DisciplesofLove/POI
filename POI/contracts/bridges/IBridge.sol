// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IBridge
 * @dev Interface for JoyToken bridge implementations
 */
interface IBridge {
    // Events
    event TokensLocked(address indexed from, bytes32 indexed targetChain, uint256 amount);
    event TokensUnlocked(address indexed to, bytes32 indexed sourceChain, uint256 amount);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    
    // Chain Management
    function addSupportedChain(bytes32 chainId) external;
    function removeSupportedChain(bytes32 chainId) external;
    function isSupportedChain(bytes32 chainId) external view returns (bool);
    
    // Validator Management
    function addValidator(address validator) external;
    function removeValidator(address validator) external;
    function isValidator(address validator) external view returns (bool);
    
    // Bridge Operations
    function lockTokens(bytes32 targetChain, uint256 amount) external;
    function unlockTokens(
        address to,
        bytes32 sourceChain,
        uint256 amount,
        bytes32 txHash,
        bytes[] calldata signatures
    ) external;
    
    // State Queries
    function getValidatorCount() external view returns (uint256);
    function getRequiredSignatures() external view returns (uint256);
}