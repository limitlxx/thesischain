// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title RoyaltySplitter
 * @notice Automatically distributes royalty payments to original authors, supervisors, and fork contributors
 * @dev Integrates with USDC at 0x977fdEF62CE095Ae8750Fd3496730F24F60dea7a
 */
contract RoyaltySplitter is Ownable, ReentrancyGuard {
    
    // USDC token address on Basecamp testnet
    address public constant USDC_ADDRESS = 0x977fdEF62CE095Ae8750Fd3496730F24F60dea7a;
    
    // Mapping from token ID to royalty configuration
    struct RoyaltyConfig {
        address[] recipients;
        uint256[] shares;  // Shares in basis points (total must equal 10000)
        bool configured;
    }
    
    mapping(uint256 => RoyaltyConfig) private royaltyConfigs;
    
    // Mapping from recipient address to pending royalties
    mapping(address => uint256) private pendingRoyalties;
    
    // Events
    event RoyaltiesSplit(
        uint256 indexed tokenId,
        address[] recipients,
        uint256[] amounts
    );
    
    event RoyaltiesClaimed(
        address indexed recipient,
        uint256 amount
    );
    
    event RoyaltySharesSet(
        uint256 indexed tokenId,
        address[] recipients,
        uint256[] shares
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Distributes royalty payment to configured recipients
     * @param recipients Array of recipient addresses
     * @param shares Array of shares in basis points (must sum to 10000)
     * @param amount Total amount to distribute in USDC
     */
    function splitRoyalties(
        address[] memory recipients,
        uint256[] memory shares,
        uint256 amount
    ) external nonReentrant {
        require(recipients.length > 0, "No recipients");
        require(recipients.length == shares.length, "Length mismatch");
        require(amount > 0, "Amount must be greater than 0");
        
        // Verify shares sum to 10000 (100%)
        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            totalShares += shares[i];
        }
        require(totalShares == 10000, "Shares must sum to 10000");
        
        // Transfer USDC from sender to this contract
        IERC20 usdc = IERC20(USDC_ADDRESS);
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );
        
        // Calculate and distribute shares
        uint256[] memory amounts = new uint256[](recipients.length);
        uint256 distributed = 0;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 share = (amount * shares[i]) / 10000;
            amounts[i] = share;
            pendingRoyalties[recipients[i]] += share;
            distributed += share;
        }
        
        // Handle rounding dust by giving it to the first recipient
        if (distributed < amount) {
            uint256 dust = amount - distributed;
            pendingRoyalties[recipients[0]] += dust;
            amounts[0] += dust;
        }
        
        emit RoyaltiesSplit(0, recipients, amounts); // tokenId 0 for direct splits
    }
    
    /**
     * @notice Gets pending royalties for a recipient
     * @param recipient The address to check
     * @return amount The pending royalty amount
     */
    function getPendingRoyalties(address recipient) external view returns (uint256) {
        return pendingRoyalties[recipient];
    }
    
    /**
     * @notice Claims pending royalties for the caller
     */
    function claimRoyalties() external nonReentrant {
        uint256 amount = pendingRoyalties[msg.sender];
        require(amount > 0, "No royalties to claim");
        
        pendingRoyalties[msg.sender] = 0;
        
        IERC20 usdc = IERC20(USDC_ADDRESS);
        require(usdc.transfer(msg.sender, amount), "USDC transfer failed");
        
        emit RoyaltiesClaimed(msg.sender, amount);
    }
    
    /**
     * @notice Configures royalty shares for a specific token
     * @param tokenId The token ID
     * @param recipients Array of recipient addresses
     * @param shares Array of shares in basis points (must sum to 10000)
     */
    function setRoyaltyShares(
        uint256 tokenId,
        address[] memory recipients,
        uint256[] memory shares
    ) external onlyOwner {
        require(recipients.length > 0, "No recipients");
        require(recipients.length == shares.length, "Length mismatch");
        
        // Verify shares sum to 10000 (100%)
        uint256 totalShares = 0;
        for (uint256 i = 0; i < shares.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            totalShares += shares[i];
        }
        require(totalShares == 10000, "Shares must sum to 10000");
        
        royaltyConfigs[tokenId] = RoyaltyConfig({
            recipients: recipients,
            shares: shares,
            configured: true
        });
        
        emit RoyaltySharesSet(tokenId, recipients, shares);
    }
    
    /**
     * @notice Gets royalty configuration for a token
     * @param tokenId The token ID
     * @return recipients Array of recipient addresses
     * @return shares Array of shares
     */
    function getRoyaltyShares(uint256 tokenId) 
        external 
        view 
        returns (address[] memory recipients, uint256[] memory shares) 
    {
        require(royaltyConfigs[tokenId].configured, "Not configured");
        RoyaltyConfig memory config = royaltyConfigs[tokenId];
        return (config.recipients, config.shares);
    }
    
    /**
     * @notice Distributes royalties for a configured token
     * @param tokenId The token ID
     * @param amount The amount to distribute
     */
    function distributeForToken(uint256 tokenId, uint256 amount) external nonReentrant {
        require(royaltyConfigs[tokenId].configured, "Token not configured");
        require(amount > 0, "Amount must be greater than 0");
        
        RoyaltyConfig memory config = royaltyConfigs[tokenId];
        
        // Transfer USDC from sender to this contract
        IERC20 usdc = IERC20(USDC_ADDRESS);
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );
        
        // Calculate and distribute shares
        uint256[] memory amounts = new uint256[](config.recipients.length);
        uint256 distributed = 0;
        
        for (uint256 i = 0; i < config.recipients.length; i++) {
            uint256 share = (amount * config.shares[i]) / 10000;
            amounts[i] = share;
            pendingRoyalties[config.recipients[i]] += share;
            distributed += share;
        }
        
        // Handle rounding dust
        if (distributed < amount) {
            uint256 dust = amount - distributed;
            pendingRoyalties[config.recipients[0]] += dust;
            amounts[0] += dust;
        }
        
        emit RoyaltiesSplit(tokenId, config.recipients, amounts);
    }
}
