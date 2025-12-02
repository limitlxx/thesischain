// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/ThesisRegistry.sol";
import "../contracts/RoyaltySplitter.sol";
import "../contracts/ForkTracker.sol";
import "../contracts/UniversityValidator.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying contracts to Basecamp testnet...");
        console.log("Deployer:", vm.addr(deployerPrivateKey));

        // Deploy ThesisRegistry
        console.log("\nDeploying ThesisRegistry...");
        ThesisRegistry thesisRegistry = new ThesisRegistry();
        console.log("ThesisRegistry deployed at:", address(thesisRegistry));

        // Deploy RoyaltySplitter
        console.log("\nDeploying RoyaltySplitter...");
        RoyaltySplitter royaltySplitter = new RoyaltySplitter();
        console.log("RoyaltySplitter deployed at:", address(royaltySplitter));

        // Deploy ForkTracker
        console.log("\nDeploying ForkTracker...");
        ForkTracker forkTracker = new ForkTracker();
        console.log("ForkTracker deployed at:", address(forkTracker));

        // Deploy UniversityValidator
        console.log("\nDeploying UniversityValidator...");
        UniversityValidator universityValidator = new UniversityValidator();
        console.log("UniversityValidator deployed at:", address(universityValidator));

        // Set contract references in ForkTracker
        console.log("\nSetting contract references in ForkTracker...");
        forkTracker.setContracts(
            address(thesisRegistry),
            address(royaltySplitter)
        );
        console.log("Contract references set successfully");

        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n========================================");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("========================================");
        console.log("ThesisRegistry:      ", address(thesisRegistry));
        console.log("RoyaltySplitter:     ", address(royaltySplitter));
        console.log("ForkTracker:         ", address(forkTracker));
        console.log("UniversityValidator: ", address(universityValidator));
        console.log("========================================");
        
        // Save addresses to file for verification
        string memory deploymentInfo = string(abi.encodePacked(
            '{\n',
            '  "ThesisRegistry": "', vm.toString(address(thesisRegistry)), '",\n',
            '  "RoyaltySplitter": "', vm.toString(address(royaltySplitter)), '",\n',
            '  "ForkTracker": "', vm.toString(address(forkTracker)), '",\n',
            '  "UniversityValidator": "', vm.toString(address(universityValidator)), '"\n',
            '}'
        ));
        
        vm.writeFile("deployments/foundry-deployments.json", deploymentInfo);
        console.log("\nDeployment addresses saved to: deployments/foundry-deployments.json");
    }
}
