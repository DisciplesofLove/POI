// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IIOTAValidator.sol";

/**
 * @title RevenueLogger
 * @dev Logs revenue and royalty information to IOTA Tangle
 */
contract RevenueLogger is Ownable, ReentrancyGuard {
    IIOTAValidator public iotaValidator;
    
    // Revenue record structure
    struct RevenueRecord {
        bytes32 modelId;
        address seller;
        address buyer;
        uint256 amount;
        uint256 royalty;
        uint256 timestamp;
        bytes32 iotaMessageId;
    }
    
    // Mapping from transaction hash to revenue record
    mapping(bytes32 => RevenueRecord) public revenueRecords;
    
    // Events
    event RevenueLogged(
        bytes32 indexed txHash,
        bytes32 indexed modelId,
        address seller,
        address buyer,
        uint256 amount,
        uint256 royalty,
        bytes32 iotaMessageId
    );
    
    event BatchLogged(bytes32 indexed batchId, uint256 recordCount);
    
    constructor(address _iotaValidator) {
        iotaValidator = IIOTAValidator(_iotaValidator);
    }
    
    /**
     * @dev Log a revenue transaction to IOTA Tangle
     */
    function logRevenue(
        bytes32 txHash,
        bytes32 modelId,
        address seller,
        address buyer,
        uint256 amount,
        uint256 royalty
    ) external nonReentrant returns (bytes32) {
        require(revenueRecords[txHash].timestamp == 0, "Transaction already logged");
        
        // Prepare revenue data for IOTA
        bytes memory revenueData = abi.encode(
            modelId,
            seller,
            buyer,
            amount,
            royalty,
            block.timestamp
        );
        
        // Submit to IOTA Tangle
        bytes32 iotaMessageId = iotaValidator.submitMessage(revenueData);
        
        // Store the record
        revenueRecords[txHash] = RevenueRecord({
            modelId: modelId,
            seller: seller,
            buyer: buyer,
            amount: amount,
            royalty: royalty,
            timestamp: block.timestamp,
            iotaMessageId: iotaMessageId
        });
        
        emit RevenueLogged(
            txHash,
            modelId,
            seller,
            buyer,
            amount,
            royalty,
            iotaMessageId
        );
        
        return iotaMessageId;
    }
    
    /**
     * @dev Log multiple revenue records in a batch
     */
    function logRevenueBatch(
        bytes32[] memory txHashes,
        bytes32[] memory modelIds,
        address[] memory sellers,
        address[] memory buyers,
        uint256[] memory amounts,
        uint256[] memory royalties
    ) external nonReentrant returns (bytes32) {
        require(
            txHashes.length == modelIds.length &&
            modelIds.length == sellers.length &&
            sellers.length == buyers.length &&
            buyers.length == amounts.length &&
            amounts.length == royalties.length,
            "Array lengths mismatch"
        );
        
        bytes memory batchData = abi.encode(
            txHashes,
            modelIds,
            sellers,
            buyers,
            amounts,
            royalties,
            block.timestamp
        );
        
        // Submit batch to IOTA Tangle
        bytes32 batchMessageId = iotaValidator.submitBatchMessage(batchData);
        
        // Store individual records
        for (uint256 i = 0; i < txHashes.length; i++) {
            require(revenueRecords[txHashes[i]].timestamp == 0, "Transaction already logged");
            
            revenueRecords[txHashes[i]] = RevenueRecord({
                modelId: modelIds[i],
                seller: sellers[i],
                buyer: buyers[i],
                amount: amounts[i],
                royalty: royalties[i],
                timestamp: block.timestamp,
                iotaMessageId: batchMessageId
            });
            
            emit RevenueLogged(
                txHashes[i],
                modelIds[i],
                sellers[i],
                buyers[i],
                amounts[i],
                royalties[i],
                batchMessageId
            );
        }
        
        emit BatchLogged(batchMessageId, txHashes.length);
        return batchMessageId;
    }
    
    /**
     * @dev Verify a revenue record on IOTA Tangle
     */
    function verifyRevenueRecord(bytes32 txHash) external view returns (bool) {
        RevenueRecord memory record = revenueRecords[txHash];
        require(record.timestamp > 0, "Record not found");
        
        bytes memory recordData = abi.encode(
            record.modelId,
            record.seller,
            record.buyer,
            record.amount,
            record.royalty,
            record.timestamp
        );
        
        return iotaValidator.verifyMessage(record.iotaMessageId, recordData);
    }
    
    /**
     * @dev Get revenue record details
     */
    function getRevenueRecord(bytes32 txHash) external view returns (
        bytes32 modelId,
        address seller,
        address buyer,
        uint256 amount,
        uint256 royalty,
        uint256 timestamp,
        bytes32 iotaMessageId
    ) {
        RevenueRecord memory record = revenueRecords[txHash];
        require(record.timestamp > 0, "Record not found");
        
        return (
            record.modelId,
            record.seller,
            record.buyer,
            record.amount,
            record.royalty,
            record.timestamp,
            record.iotaMessageId
        );
    }
}