// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ForkTracker
 * @notice Manages derivative relationships between theses, tracking parent-child links
 * @dev Integrates with ThesisRegistry and RoyaltySplitter
 */
contract ForkTracker is Ownable {
    
    struct ForkTree {
        uint256[] parents;
        uint256[] children;
        uint256 depth;  // How many generations from original
        bool exists;
    }
    
    // Mapping from token ID to fork tree
    mapping(uint256 => ForkTree) private forkTrees;
    
    // Reference to ThesisRegistry contract
    address public thesisRegistry;
    
    // Reference to RoyaltySplitter contract
    address public royaltySplitter;
    
    // Events
    event ThesisForked(
        uint256 indexed newTokenId,
        uint256 indexed parentId,
        address indexed author
    );
    
    event ForkTreeUpdated(
        uint256 indexed tokenId
    );
    
    event ContractsSet(
        address thesisRegistry,
        address royaltySplitter
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Sets the ThesisRegistry and RoyaltySplitter contract addresses
     * @param _thesisRegistry Address of ThesisRegistry contract
     * @param _royaltySplitter Address of RoyaltySplitter contract
     */
    function setContracts(
        address _thesisRegistry,
        address _royaltySplitter
    ) external onlyOwner {
        require(_thesisRegistry != address(0), "Invalid registry address");
        require(_royaltySplitter != address(0), "Invalid splitter address");
        
        thesisRegistry = _thesisRegistry;
        royaltySplitter = _royaltySplitter;
        
        emit ContractsSet(_thesisRegistry, _royaltySplitter);
    }
    
    /**
     * @notice Creates a derivative thesis (fork)
     * @param parentId The token ID of the parent thesis
     * @param newUri The IPFS URI for the new thesis
     * @return tokenId The ID of the newly forked thesis
     */
    function forkThesis(
        uint256 parentId,
        string memory newUri
    ) external returns (uint256 tokenId) {
        require(forkTrees[parentId].exists || parentId > 0, "Parent thesis must exist");
        require(bytes(newUri).length > 0, "URI cannot be empty");
        
        // For this implementation, we'll generate a simple token ID
        // In production, this would interact with ThesisRegistry
        tokenId = uint256(keccak256(abi.encodePacked(parentId, msg.sender, block.timestamp))) % 1000000 + 1000000;
        
        // Initialize fork tree if parent doesn't have one
        if (!forkTrees[parentId].exists) {
            forkTrees[parentId] = ForkTree({
                parents: new uint256[](0),
                children: new uint256[](0),
                depth: 0,
                exists: true
            });
        }
        
        // Add this token as a child of parent
        forkTrees[parentId].children.push(tokenId);
        
        // Create fork tree for new token
        uint256[] memory parents = new uint256[](1);
        parents[0] = parentId;
        
        forkTrees[tokenId] = ForkTree({
            parents: parents,
            children: new uint256[](0),
            depth: forkTrees[parentId].depth + 1,
            exists: true
        });
        
        emit ThesisForked(tokenId, parentId, msg.sender);
        emit ForkTreeUpdated(parentId);
        emit ForkTreeUpdated(tokenId);
        
        return tokenId;
    }
    
    /**
     * @notice Returns parent thesis IDs
     * @param tokenId The token ID to query
     * @return parents Array of parent token IDs
     */
    function getParents(uint256 tokenId) external view returns (uint256[] memory) {
        require(forkTrees[tokenId].exists, "Thesis does not exist");
        return forkTrees[tokenId].parents;
    }
    
    /**
     * @notice Returns child thesis IDs (derivatives)
     * @param tokenId The token ID to query
     * @return children Array of child token IDs
     */
    function getChildren(uint256 tokenId) external view returns (uint256[] memory) {
        require(forkTrees[tokenId].exists, "Thesis does not exist");
        return forkTrees[tokenId].children;
    }
    
    /**
     * @notice Returns complete fork tree for a thesis
     * @param tokenId The token ID to query
     * @return tree The complete fork tree structure
     */
    function getForkTree(uint256 tokenId) external view returns (ForkTree memory) {
        require(forkTrees[tokenId].exists, "Thesis does not exist");
        return forkTrees[tokenId];
    }
    
    /**
     * @notice Checks if a thesis has been forked
     * @param tokenId The token ID to check
     * @return hasChildren True if thesis has derivatives
     */
    function hasChildren(uint256 tokenId) external view returns (bool) {
        if (!forkTrees[tokenId].exists) return false;
        return forkTrees[tokenId].children.length > 0;
    }
    
    /**
     * @notice Gets the fork depth (generations from original)
     * @param tokenId The token ID to query
     * @return depth The depth in the fork tree
     */
    function getForkDepth(uint256 tokenId) external view returns (uint256) {
        require(forkTrees[tokenId].exists, "Thesis does not exist");
        return forkTrees[tokenId].depth;
    }
    
    /**
     * @notice Checks if a thesis is a fork (has parents)
     * @param tokenId The token ID to check
     * @return isFork True if thesis is a derivative
     */
    function isFork(uint256 tokenId) external view returns (bool) {
        if (!forkTrees[tokenId].exists) return false;
        return forkTrees[tokenId].parents.length > 0;
    }
    
    /**
     * @notice Registers an existing thesis in the fork tracker
     * @param tokenId The token ID to register
     */
    function registerThesis(uint256 tokenId) external {
        require(!forkTrees[tokenId].exists, "Thesis already registered");
        
        forkTrees[tokenId] = ForkTree({
            parents: new uint256[](0),
            children: new uint256[](0),
            depth: 0,
            exists: true
        });
        
        emit ForkTreeUpdated(tokenId);
    }
}
