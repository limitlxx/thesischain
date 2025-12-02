// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UniversityValidator
 * @notice Role-based validation system for supervisors to verify student theses
 * @dev Uses AccessControl for role management
 */
contract UniversityValidator is AccessControl, Ownable {
    
    bytes32 public constant SUPERVISOR_ROLE = keccak256("SUPERVISOR_ROLE");
    
    struct ValidationInfo {
        bool isValidated;
        address validator;
        uint256 timestamp;
        string university;
    }
    
    // Mapping from token ID to validation info
    mapping(uint256 => ValidationInfo) private validations;
    
    // Mapping from supervisor address to university
    mapping(address => string) private supervisorUniversities;
    
    // Events
    event ThesisValidated(
        uint256 indexed tokenId,
        address indexed supervisor,
        uint256 timestamp
    );
    
    event SupervisorAdded(
        address indexed supervisor,
        string university
    );
    
    event SupervisorRemoved(
        address indexed supervisor
    );
    
    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Adds a supervisor with university affiliation
     * @param supervisor The address to grant supervisor role
     * @param university The university name
     */
    function addSupervisor(address supervisor, string memory university) external onlyOwner {
        require(supervisor != address(0), "Invalid supervisor address");
        require(bytes(university).length > 0, "University name required");
        
        _grantRole(SUPERVISOR_ROLE, supervisor);
        supervisorUniversities[supervisor] = university;
        
        emit SupervisorAdded(supervisor, university);
    }
    
    /**
     * @notice Removes a supervisor
     * @param supervisor The address to revoke supervisor role
     */
    function removeSupervisor(address supervisor) external onlyOwner {
        require(hasRole(SUPERVISOR_ROLE, supervisor), "Not a supervisor");
        
        _revokeRole(SUPERVISOR_ROLE, supervisor);
        delete supervisorUniversities[supervisor];
        
        emit SupervisorRemoved(supervisor);
    }
    
    /**
     * @notice Validates a thesis (supervisor only)
     * @param tokenId The token ID of the thesis to validate
     * @param signature Signature data (for future use)
     */
    function validate(uint256 tokenId, bytes calldata signature) external {
        require(hasRole(SUPERVISOR_ROLE, msg.sender), "Only supervisors can validate");
        require(!validations[tokenId].isValidated, "Thesis already validated");
        require(tokenId > 0, "Invalid token ID");
        
        // Signature parameter included for future verification features
        // Currently not used but maintains interface compatibility
        
        validations[tokenId] = ValidationInfo({
            isValidated: true,
            validator: msg.sender,
            timestamp: block.timestamp,
            university: supervisorUniversities[msg.sender]
        });
        
        emit ThesisValidated(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Checks if a thesis is validated
     * @param tokenId The token ID to check
     * @return isValidated True if thesis is validated
     */
    function isValidated(uint256 tokenId) external view returns (bool) {
        return validations[tokenId].isValidated;
    }
    
    /**
     * @notice Gets the validator of a thesis
     * @param tokenId The token ID to query
     * @return validator The address of the validator
     */
    function getValidator(uint256 tokenId) external view returns (address) {
        require(validations[tokenId].isValidated, "Thesis not validated");
        return validations[tokenId].validator;
    }
    
    /**
     * @notice Gets complete validation info for a thesis
     * @param tokenId The token ID to query
     * @return info The validation information
     */
    function getValidationInfo(uint256 tokenId) external view returns (ValidationInfo memory) {
        require(validations[tokenId].isValidated, "Thesis not validated");
        return validations[tokenId];
    }
    
    /**
     * @notice Gets the university affiliation of a supervisor
     * @param supervisor The supervisor address
     * @return university The university name
     */
    function getSupervisorUniversity(address supervisor) external view returns (string memory) {
        require(hasRole(SUPERVISOR_ROLE, supervisor), "Not a supervisor");
        return supervisorUniversities[supervisor];
    }
    
    /**
     * @notice Checks if an address is a supervisor
     * @param account The address to check
     * @return isSupervisor True if address has supervisor role
     */
    function isSupervisor(address account) external view returns (bool) {
        return hasRole(SUPERVISOR_ROLE, account);
    }
}
