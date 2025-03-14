// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title JoyToken
 * @dev Implementation of the JoyToken used for staking and rewards in the PoI/PoU system
 */
contract JoyToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant MAX_SUPPLY = 10000000000 * 10**18; // 10 billion tokens
    
    // Addresses of the PoI and PoU contracts
    address public poiContract;
    address public pouContract;
    
    constructor() ERC20("JoyToken", "JOY") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Set the address of the ProofOfInference contract
     */
    function setPoiContract(address _poiContract) external onlyOwner {
        poiContract = _poiContract;
    }
    
    /**
     * @dev Set the address of the ProofOfUse contract
     */
    function setPouContract(address _pouContract) external onlyOwner {
        pouContract = _pouContract;
    }
    
    /**
     * @dev Mint new tokens for validator rewards
     * Only callable by PoI or PoU contracts
     */
    function mintRewards(address to, uint256 amount) external {
        require(
            msg.sender == poiContract || msg.sender == pouContract,
            "Only PoI/PoU can mint"
        );
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens when slashing validators
     * Only callable by PoI contract
     */
    function burnFromValidator(address validator, uint256 amount) external {
        require(msg.sender == poiContract, "Only PoI can burn");
        _burn(validator, amount);
    }
}