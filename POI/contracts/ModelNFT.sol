// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ModelNFT is ERC721, ERC721URIStorage, Pausable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct ModelMetadata {
        string ipfsHash;       // IPFS hash of the model weights
        string merkleRoot;     // Merkle root of model weights
        bool isLeasable;      // Whether the model can be leased
        uint256 leasePrice;   // Price per day for leasing (in wei)
        uint256 salePrice;    // Price for direct sale (in wei)
    }

    // Mapping from token ID to metadata
    mapping(uint256 => ModelMetadata) private _modelMetadata;
    
    // Mapping from token ID to lease info
    mapping(uint256 => mapping(address => uint256)) private _leases; // tokenId => lessee => lease expiry

    event ModelMinted(uint256 indexed tokenId, address indexed creator, string ipfsHash, string merkleRoot);
    event ModelLeased(uint256 indexed tokenId, address indexed lessee, uint256 expiryTime);
    event LeaseEnded(uint256 indexed tokenId, address indexed lessee);
    event PriceUpdated(uint256 indexed tokenId, uint256 salePrice, uint256 leasePrice);

    constructor() ERC721("AI Model NFT", "AIMOD") {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mintModel(
        address creator,
        string memory ipfsHash,
        string memory merkleRoot,
        string memory metadataURI,
        bool isLeasable,
        uint256 leasePrice,
        uint256 salePrice
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(creator, newTokenId);
        _setTokenURI(newTokenId, metadataURI);

        _modelMetadata[newTokenId] = ModelMetadata({
            ipfsHash: ipfsHash,
            merkleRoot: merkleRoot,
            isLeasable: isLeasable,
            leasePrice: leasePrice,
            salePrice: salePrice
        });

        emit ModelMinted(newTokenId, creator, ipfsHash, merkleRoot);
        return newTokenId;
    }

    function leaseModel(uint256 tokenId, uint256 durationDays) public payable {
        require(_exists(tokenId), "Model does not exist");
        require(_modelMetadata[tokenId].isLeasable, "Model is not available for lease");
        require(msg.value >= _modelMetadata[tokenId].leasePrice * durationDays, "Insufficient payment");

        uint256 expiryTime = block.timestamp + (durationDays * 1 days);
        _leases[tokenId][msg.sender] = expiryTime;

        // Transfer payment to token owner
        payable(ownerOf(tokenId)).transfer(msg.value);

        emit ModelLeased(tokenId, msg.sender, expiryTime);
    }

    function updatePrices(uint256 tokenId, uint256 newSalePrice, uint256 newLeasePrice) public {
        require(_exists(tokenId), "Model does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");

        _modelMetadata[tokenId].salePrice = newSalePrice;
        _modelMetadata[tokenId].leasePrice = newLeasePrice;

        emit PriceUpdated(tokenId, newSalePrice, newLeasePrice);
    }

    function getModelMetadata(uint256 tokenId) public view returns (ModelMetadata memory) {
        require(_exists(tokenId), "Model does not exist");
        return _modelMetadata[tokenId];
    }

    function isLeaseActive(uint256 tokenId, address lessee) public view returns (bool) {
        return _leases[tokenId][lessee] > block.timestamp;
    }

    function getLeaseExpiry(uint256 tokenId, address lessee) public view returns (uint256) {
        return _leases[tokenId][lessee];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // The following functions are overrides required by Solidity.
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}