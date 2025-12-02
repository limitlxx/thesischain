const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Delay helper for retry logic
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function verifyContract(address, constructorArguments = [], contractName, retries = 3) {
  console.log(`\n🔍 Verifying ${contractName} at ${address}...`);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: constructorArguments,
      });
      console.log(`✅ ${contractName} verified successfully!`);
      return true;
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log(`✅ ${contractName} is already verified!`);
        return true;
      }
      
      if (attempt < retries) {
        console.log(`⚠️  Verification attempt ${attempt} failed: ${error.message}`);
        console.log(`🔄 Retrying in 10 seconds... (${retries - attempt} attempts remaining)`);
        await delay(10000);
      } else {
        console.error(`❌ ${contractName} verification failed after ${retries} attempts`);
        console.error(`   Error: ${error.message}`);
        return false;
      }
    }
  }
  return false;
}

async function main() {
  console.log("🔍 Starting contract verification on Blockscout...\n");

  // Read deployment addresses
  const deploymentsFile = path.join(__dirname, "..", "deployments", "deployments.json");
  
  if (!fs.existsSync(deploymentsFile)) {
    console.error("❌ Deployments file not found!");
    console.error("   Please run deployment first: npm run deploy");
    process.exit(1);
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
  const contracts = deployments.contracts;

  console.log("📋 Contracts to verify:");
  console.log("  Network:", deployments.network);
  console.log("  Chain ID:", deployments.chainId);
  console.log("  Deployer:", deployments.deployer);
  console.log("");

  const verificationResults = {
    network: deployments.network,
    chainId: deployments.chainId,
    timestamp: new Date().toISOString(),
    results: {}
  };

  // Verify ThesisRegistry
  if (contracts.ThesisRegistry) {
    const success = await verifyContract(
      contracts.ThesisRegistry,
      [], // No constructor arguments
      "ThesisRegistry"
    );
    verificationResults.results.ThesisRegistry = {
      address: contracts.ThesisRegistry,
      verified: success
    };
  }

  // Verify RoyaltySplitter
  if (contracts.RoyaltySplitter) {
    const success = await verifyContract(
      contracts.RoyaltySplitter,
      [], // No constructor arguments
      "RoyaltySplitter"
    );
    verificationResults.results.RoyaltySplitter = {
      address: contracts.RoyaltySplitter,
      verified: success
    };
  }

  // Verify ForkTracker
  if (contracts.ForkTracker) {
    const success = await verifyContract(
      contracts.ForkTracker,
      [], // No constructor arguments
      "ForkTracker"
    );
    verificationResults.results.ForkTracker = {
      address: contracts.ForkTracker,
      verified: success
    };
  }

  // Verify UniversityValidator
  if (contracts.UniversityValidator) {
    const success = await verifyContract(
      contracts.UniversityValidator,
      [], // No constructor arguments
      "UniversityValidator"
    );
    verificationResults.results.UniversityValidator = {
      address: contracts.UniversityValidator,
      verified: success
    };
  }

  // Save verification results
  const verificationFile = path.join(__dirname, "..", "deployments", "verification.json");
  fs.writeFileSync(verificationFile, JSON.stringify(verificationResults, null, 2));
  console.log("\n💾 Verification results saved to:", verificationFile);

  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 VERIFICATION SUMMARY");
  console.log("=".repeat(60));
  
  let allVerified = true;
  for (const [contractName, result] of Object.entries(verificationResults.results)) {
    const status = result.verified ? "✅ Verified" : "❌ Failed";
    console.log(`  ${contractName.padEnd(25)} ${status}`);
    if (!result.verified) allVerified = false;
  }

  if (allVerified) {
    console.log("\n🎉 All contracts verified successfully!");
    console.log("\n🔗 View on Blockscout:");
    console.log(`   https://explorer.basecamp-testnet.camp.network/address/${contracts.ThesisRegistry}`);
  } else {
    console.log("\n⚠️  Some contracts failed verification");
    console.log("   You can retry verification later with: npm run verify");
  }
  console.log("");

  process.exit(allVerified ? 0 : 1);
}

// Execute verification
main()
  .then(() => {})
  .catch((error) => {
    console.error("\n❌ Verification script error:", error);
    process.exit(1);
  });
