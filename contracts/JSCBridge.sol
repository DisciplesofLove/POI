// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title JSCBridge
 * @dev Bridge contract to handle conversions between JoyToken (ERC20) and JSC (privacy coin)
 */
contract JSCBridge is Ownable, Pausable, ReentrancyGuard {
    IERC20 public joyToken;
    
    // Events
    event Deposit(address indexed user, uint256 amount, bytes32 jscAddress);
    event Withdrawal(address indexed user, uint256 amount, bytes32 jscTxHash);
    
    // Mapping to track pending withdrawals that need verification
    mapping(bytes32 => bool) public processedJSCTxs;
    
    constructor(address _joyTokenAddress) {
        joyToken = IERC20(_joyTokenAddress);
    }
    
    /**
     * @dev Deposit JoyTokens to receive JSC
     * @param amount Amount of JoyTokens to convert
     * @param jscAddress The JSC address to receive the converted coins
     */
    function deposit(uint256 amount, bytes32 jscAddress) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(jscAddress != bytes32(0), "Invalid JSC address");
        
        // Transfer JoyTokens to this contract
        require(joyToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Emit event for the JSC network to process
        emit Deposit(msg.sender, amount, jscAddress);
    }
    
    /**
     * @dev Process withdrawal from JSC to JoyToken
     * @param user Address to receive JoyTokens
     * @param amount Amount to withdraw
     * @param jscTxHash Hash of the JSC transaction
     */
    function processWithdrawal(
        address user,
        uint256 amount,
        bytes32 jscTxHash
    ) external onlyOwner nonReentrant {
        require(!processedJSCTxs[jscTxHash], "Transaction already processed");
        require(user != address(0), "Invalid address");
        require(amount > 0, "Amount must be greater than 0");
        
        processedJSCTxs[jscTxHash] = true;
        
        require(joyToken.transfer(user, amount), "Transfer failed");
        
        emit Withdrawal(user, amount, jscTxHash);
    }
    
    /**
     * @dev Pause bridge operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause bridge operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal of stuck tokens
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = joyToken.balanceOf(address(this));
        require(joyToken.transfer(owner(), balance), "Transfer failed");
    }
}