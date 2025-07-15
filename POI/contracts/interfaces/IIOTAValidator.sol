// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IIOTAValidator {
    function validateStreamId(string memory streamId) external view returns (bool);
    function validateMessage(string memory messageId) external view returns (bool);
    function getStreamData(string memory streamId) external view returns (bytes memory);
}