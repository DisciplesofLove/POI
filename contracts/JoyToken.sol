// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title JoyToken
 * @dev Implementation of the JoyToken used for staking and rewards in the PoI/PoU system
 * Now supports integration with JSC privacy coin through bridge
 */
contract JoyToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant MAX_SUPPLY = 10000000000 * 10**18; // 10 billion tokens
    
    // Addresses of the system contracts
    address public poiContract;
    address public pouContract;
    address public jscBridgeContract;
    
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
     * @dev Set the address of the JSC Bridge contract
     */
    function setJSCBridgeContract(address _jscBridgeContract) external onlyOwner {
        jscBridgeContract = _jscBridgeContract;
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
    
    /**
     * @dev Mint tokens when converting from JSC
     * Only callable by JSC bridge contract
     */
    function mintFromJSC(address to, uint256 amount) external {
        require(msg.sender == jscBridgeContract, "Only JSC bridge can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens when converting to JSC
     * Only callable by JSC bridge contract
     */
    function burnForJSC(address from, uint256 amount) external {
        require(msg.sender == jscBridgeContract, "Only JSC bridge can burn");
        _burn(from, amount);
    }
}