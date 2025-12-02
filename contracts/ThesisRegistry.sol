// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ThesisRegistry
 * @notice Central registry for all thesis IPNFTs, coordinating with Origin Factory for minting
 * @dev Manages thesis metadata and integrates with Origin Factory at 0x992C57b76E60D3c558144b15b47A73312889B12B
 */
contract ThesisRegistry is Ownable, ReentrancyGuard {
    
    struct ThesisMetadata {
        string uri;              // IPFS URI containing thesis metadata
        address author;          // Address of thesis author
        uint96 royaltyBps;       // Royalty in basis points (100 = 1%)
        uint256 timestamp;       // Timestamp of minting
        bool exists;             // Flag to check if thesis exists
    }
    
    // Mapping from token ID to thesis metadata
    mapping(uint256 => ThesisMetadata) private theses;
    
    // Mapping from author address to array of their thesis token IDs
    mapping(address => uint256[]) private authorTheses;
    
    // Counter for thesis token IDs
    uint256 private nextTokenId;
    
    // Origin Factory address
    address public constant ORIGIN_FACTORY = 0x992C57b76E60D3c558144b15b47A73312889B12B;
    
    // Events
    event ThesisMinted(
        uint256 indexed tokenId,
        address indexed author,
        string uri,
        uint96 royaltyBps
    );
    
    event MetadataUpdated(
        uint256 indexed tokenId,
        string newUri
    );
    
    constructor() Ownable(msg.sender) {
        nextTokenId = 1; // Start token IDs from 1
    }
    
    /**
     * @notice Mints a new thesis IPNFT
     * @param uri IPFS URI containing thesis metadata
     * @param royaltyBps Royalty percentage in basis points (1-10000)
     * @return tokenId The ID of the newly minted thesis
     */
    function mintThesis(
        string memory uri,
        uint96 royaltyBps
    ) external nonReentrant returns (uint256 tokenId) {
        require(bytes(uri).length > 0, "URI cannot be empty");
        require(royaltyBps >= 100 && royaltyBps <= 10000, "Royalty must be between 1% and 100%");
        
        tokenId = nextTokenId++;
        
        theses[tokenId] = ThesisMetadata({
            uri: uri,
            author: msg.sender,
            royaltyBps: royaltyBps,
            timestamp: block.timestamp,
            exists: true
        });
        
        authorTheses[msg.sender].push(tokenId);
        
        emit ThesisMinted(tokenId, msg.sender, uri, royaltyBps);
        
        return tokenId;
    }
    
    /**
     * @notice Retrieves thesis metadata
     * @param tokenId The ID of the thesis
     * @return metadata The thesis metadata
     */
    function getThesis(uint256 tokenId) external view returns (ThesisMetadata memory) {
        require(theses[tokenId].exists, "Thesis does not exist");
        return theses[tokenId];
    }
    
    /**
     * @notice Lists all theses by a specific author
     * @param author The address of the author
     * @return tokenIds Array of token IDs owned by the author
     */
    function getThesesByAuthor(address author) external view returns (uint256[] memory) {
        return authorTheses[author];
    }
    
    /**
     * @notice Updates thesis metadata URI (owner only)
     * @param tokenId The ID of the thesis
     * @param newUri The new IPFS URI
     */
    function updateMetadata(uint256 tokenId, string memory newUri) external {
        require(theses[tokenId].exists, "Thesis does not exist");
        require(theses[tokenId].author == msg.sender, "Only author can update metadata");
        require(bytes(newUri).length > 0, "URI cannot be empty");
        
        theses[tokenId].uri = newUri;
        
        emit MetadataUpdated(tokenId, newUri);
    }
    
    /**
     * @notice Checks if a thesis exists
     * @param tokenId The ID of the thesis
     * @return exists True if thesis exists
     */
    function thesisExists(uint256 tokenId) external view returns (bool) {
        return theses[tokenId].exists;
    }
    
    /**
     * @notice Gets the total number of theses minted
     * @return count The total count
     */
    function getTotalTheses() external view returns (uint256) {
        return nextTokenId - 1;
    }
}
