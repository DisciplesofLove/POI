// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./JoyToken.sol";

/**
 * @title JSCBridge
 * @dev Bridge contract for converting JSC to JoyTokens and vice versa
 */
contract JSCBridge is Pausable, AccessControl, ReentrancyGuard {
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    JoyToken public joyToken;

    // Bridge parameters
    uint256 public minDeposit;
    uint256 public maxDeposit;
    uint256 public dailyLimit;
    uint256 public dailyVolume;
    uint256 public lastResetTime;

    // Events
    event Deposit(address indexed user, uint256 amount, bytes32 jscAddress);
    event Withdrawal(address indexed user, uint256 amount, bytes32 jscAddress);
    event BridgeLimitsUpdated(uint256 minDeposit, uint256 maxDeposit, uint256 dailyLimit);

    constructor(
        address _joyToken,
        uint256 _minDeposit,
        uint256 _maxDeposit,
        uint256 _dailyLimit
    ) {
        require(_joyToken != address(0), "Invalid JoyToken address");
        require(_maxDeposit >= _minDeposit, "Invalid deposit limits");

        joyToken = JoyToken(_joyToken);
        minDeposit = _minDeposit;
        maxDeposit = _maxDeposit;
        dailyLimit = _dailyLimit;
        lastResetTime = block.timestamp;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(BRIDGE_ROLE, msg.sender);
    }

    /**
     * @dev Reset daily volume if 24h have passed
     */
    modifier resetDailyVolume() {
        if (block.timestamp >= lastResetTime + 24 hours) {
            dailyVolume = 0;
            lastResetTime = block.timestamp;
        }
        _;
    }

    /**
     * @dev Deposit JSC and receive JoyTokens
     * @param amount Amount of JSC to deposit
     * @param jscAddress JSC address to withdraw from
     */
    function deposit(uint256 amount, bytes32 jscAddress) external nonReentrant resetDailyVolume whenNotPaused {
        require(amount >= minDeposit, "Below minimum deposit");
        require(amount <= maxDeposit, "Exceeds maximum deposit");
        require(dailyVolume + amount <= dailyLimit, "Exceeds daily limit");

        dailyVolume += amount;

        // Mint equivalent JoyTokens to the user
        joyToken.mint(msg.sender, amount);

        emit Deposit(msg.sender, amount, jscAddress);
    }

    /**
     * @dev Withdraw JSC by burning JoyTokens
     * @param amount Amount of JoyTokens to burn
     * @param jscAddress JSC address to receive funds
     */
    function withdraw(uint256 amount, bytes32 jscAddress) external nonReentrant resetDailyVolume whenNotPaused {
        require(amount >= minDeposit, "Below minimum withdrawal");
        require(amount <= maxDeposit, "Exceeds maximum withdrawal");
        require(dailyVolume + amount <= dailyLimit, "Exceeds daily limit");

        dailyVolume += amount;

        // Burn JoyTokens from user
        joyToken.burnFrom(msg.sender, amount);

        emit Withdrawal(msg.sender, amount, jscAddress);
    }

    /**
     * @dev Update bridge limits
     */
    function updateLimits(
        uint256 _minDeposit,
        uint256 _maxDeposit,
        uint256 _dailyLimit
    ) external onlyRole(ADMIN_ROLE) {
        require(_maxDeposit >= _minDeposit, "Invalid deposit limits");

        minDeposit = _minDeposit;
        maxDeposit = _maxDeposit;
        dailyLimit = _dailyLimit;

        emit BridgeLimitsUpdated(_minDeposit, _maxDeposit, _dailyLimit);
    }

    /**
     * @dev Pause bridge operations
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause bridge operations
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}