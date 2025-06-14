// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TLDRegistrar {
    mapping(string => address) public domains;
    event DomainRegistered(string domain, address owner);

    function registerDomain(string calldata name) external payable {
        require(msg.value >= 0.01 ether, "Insufficient fee");
        require(domains[name] == address(0), "Domain already registered");
        domains[name] = msg.sender;
        emit DomainRegistered(name, msg.sender);
    }
}