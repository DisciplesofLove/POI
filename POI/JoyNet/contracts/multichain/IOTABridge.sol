// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title IOTABridge
 * @dev Bridge contract for IOTA integration enabling feeless microtransactions
 */
contract IOTABridge is Ownable, ReentrancyGuard {
    // Events
    event MicropaymentInitiated(bytes32 indexed paymentId, address indexed sender, uint256 amount);
    event MicropaymentCompleted(bytes32 indexed paymentId, bool success);
    event DataStreamInitiated(bytes32 indexed streamId, address indexed provider, address indexed consumer);
    
    // Structs
    struct MicroPayment {
        address sender;
        address recipient;
        uint256 amount;
        bool completed;
        uint256 timestamp;
    }
    
    struct DataStream {
        address provider;
        address consumer;
        uint256 ratePerSecond;
        uint256 startTime;
        bool active;
    }
    
    // State variables
    mapping(bytes32 => MicroPayment) public micropayments;
    mapping(bytes32 => DataStream) public dataStreams;
    mapping(address => uint256) public streamingBalance;
    
    // Oracle addresses for IOTA message validation
    mapping(address => bool) public oracles;
    uint256 public requiredOracleValidations;
    
    constructor(address[] memory _oracles, uint256 _requiredValidations) {
        require(_requiredValidations <= _oracles.length, "Invalid oracle threshold");
        requiredOracleValidations = _requiredValidations;
        
        for (uint i = 0; i < _oracles.length; i++) {
            oracles[_oracles[i]] = true;
        }
    }
    
    /**
     * @dev Initiate a feeless micropayment through IOTA
     */
    function initiateMicropayment(
        bytes32 paymentId,
        address recipient,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(recipient != address(0), "Invalid recipient");
        
        micropayments[paymentId] = MicroPayment({
            sender: msg.sender,
            recipient: recipient,
            amount: amount,
            completed: false,
            timestamp: block.timestamp
        });
        
        emit MicropaymentInitiated(paymentId, msg.sender, amount);
    }
    
    /**
     * @dev Start a data stream with pay-per-second billing
     */
    function initiateDataStream(
        bytes32 streamId,
        address provider,
        uint256 ratePerSecond
    ) external nonReentrant {
        require(provider != address(0), "Invalid provider");
        require(ratePerSecond > 0, "Invalid rate");
        
        dataStreams[streamId] = DataStream({
            provider: provider,
            consumer: msg.sender,
            ratePerSecond: ratePerSecond,
            startTime: block.timestamp,
            active: true
        });
        
        emit DataStreamInitiated(streamId, provider, msg.sender);
    }
    
    /**
     * @dev Oracle validation of IOTA message
     */
    function validateIOTAMessage(
        bytes32 messageId,
        bytes memory signature
    ) external {
        require(oracles[msg.sender], "Not an oracle");
        // Verify IOTA message signature and process accordingly
        // Implementation depends on IOTA network integration
    }
    
    /**
     * @dev Complete a micropayment after IOTA confirmation
     */
    function completeMicropayment(bytes32 paymentId) external {
        require(oracles[msg.sender], "Not an oracle");
        MicroPayment storage payment = micropayments[paymentId];
        require(!payment.completed, "Already completed");
        
        payment.completed = true;
        emit MicropaymentCompleted(paymentId, true);
    }
    
    /**
     * @dev End an active data stream
     */
    function endDataStream(bytes32 streamId) external {
        DataStream storage stream = dataStreams[streamId];
        require(msg.sender == stream.consumer || msg.sender == stream.provider, "Not authorized");
        require(stream.active, "Stream not active");
        
        uint256 duration = block.timestamp - stream.startTime;
        uint256 totalCost = duration * stream.ratePerSecond;
        
        // Process final payment
        stream.active = false;
    }
    
    /**
     * @dev Add oracle for IOTA message validation
     */
    function addOracle(address oracle) external onlyOwner {
        require(!oracles[oracle], "Already an oracle");
        oracles[oracle] = true;
    }
    
    /**
     * @dev Remove oracle
     */
    function removeOracle(address oracle) external onlyOwner {
        require(oracles[oracle], "Not an oracle");
        oracles[oracle] = false;
    }
    
    /**
     * @dev Update required oracle validations
     */
    function updateRequiredValidations(uint256 newRequired) external onlyOwner {
        requiredOracleValidations = newRequired;
    }
}