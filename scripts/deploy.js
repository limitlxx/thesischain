const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to Basecamp testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Object to store deployed addresses
  const deployments = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  try {
    // Deploy ThesisRegistry
    console.log("📄 Deploying ThesisRegistry...");
    const ThesisRegistry = await hre.ethers.getContractFactory("ThesisRegistry");
    const thesisRegistry = await ThesisRegistry.deploy();
    await thesisRegistry.waitForDeployment();
    const thesisRegistryAddress = await thesisRegistry.getAddress();
    deployments.contracts.ThesisRegistry = thesisRegistryAddress;
    console.log("✅ ThesisRegistry deployed to:", thesisRegistryAddress);
    console.log("");

    // Deploy RoyaltySplitter
    console.log("💰 Deploying RoyaltySplitter...");
    const RoyaltySplitter = await hre.ethers.getContractFactory("RoyaltySplitter");
    const royaltySplitter = await RoyaltySplitter.deploy();
    await royaltySplitter.waitForDeployment();
    const royaltySplitterAddress = await royaltySplitter.getAddress();
    deployments.contracts.RoyaltySplitter = royaltySplitterAddress;
    console.log("✅ RoyaltySplitter deployed to:", royaltySplitterAddress);
    console.log("");

    // Deploy ForkTracker
    console.log("🔱 Deploying ForkTracker...");
    const ForkTracker = await hre.ethers.getContractFactory("ForkTracker");
    const forkTracker = await ForkTracker.deploy();
    await forkTracker.waitForDeployment();
    const forkTrackerAddress = await forkTracker.getAddress();
    deployments.contracts.ForkTracker = forkTrackerAddress;
    console.log("✅ ForkTracker deployed to:", forkTrackerAddress);
    console.log("");

    // Deploy UniversityValidator
    console.log("🎓 Deploying UniversityValidator...");
    const UniversityValidator = await hre.ethers.getContractFactory("UniversityValidator");
    const universityValidator = await UniversityValidator.deploy();
    await universityValidator.waitForDeployment();
    const universityValidatorAddress = await universityValidator.getAddress();
    deployments.contracts.UniversityValidator = universityValidatorAddress;
    console.log("✅ UniversityValidator deployed to:", universityValidatorAddress);
    console.log("");

    // Set contract references in ForkTracker
    console.log("🔗 Setting contract references in ForkTracker...");
    const setContractsTx = await forkTracker.setContracts(
      thesisRegistryAddress,
      royaltySplitterAddress
    );
    await setContractsTx.wait();
    console.log("✅ Contract references set successfully");
    console.log("");

    // Save deployment addresses to file
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentsFile = path.join(deploymentsDir, "deployments.json");
    fs.writeFileSync(deploymentsFile, JSON.stringify(deployments, null, 2));
    console.log("💾 Deployment addresses saved to:", deploymentsFile);
    console.log("");

    // Display summary
    console.log("=" .repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=" .repeat(60));
    console.log("\n📋 Deployed Contracts:");
    console.log("  ThesisRegistry:       ", thesisRegistryAddress);
    console.log("  RoyaltySplitter:      ", royaltySplitterAddress);
    console.log("  ForkTracker:          ", forkTrackerAddress);
    console.log("  UniversityValidator:  ", universityValidatorAddress);
    console.log("\n🔍 Next steps:");
    console.log("  1. Run verification: npm run verify");
    console.log("  2. Update frontend config: npm run update-config");
    console.log("  3. Seed test data: npm run seed");
    console.log("");

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    
    // Save partial deployment info if any contracts were deployed
    if (Object.keys(deployments.contracts).length > 0) {
      const deploymentsDir = path.join(__dirname, "..", "deployments");
      if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
      }
      const failedDeploymentsFile = path.join(deploymentsDir, "failed-deployment.json");
      fs.writeFileSync(failedDeploymentsFile, JSON.stringify(deployments, null, 2));
      console.log("💾 Partial deployment saved to:", failedDeploymentsFile);
    }
    
    // Retry logic suggestion
    console.log("\n🔄 To retry deployment:");
    console.log("  npm run deploy");
    
    process.exit(1);
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
