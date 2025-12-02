const fs = require("fs");
const path = require("path");

async function main() {
  console.log("📝 Updating frontend contract configuration...\n");

  // Read deployment addresses
  const deploymentsFile = path.join(__dirname, "..", "deployments", "deployments.json");
  
  let deployments = {
    contracts: {
      ThesisRegistry: "0x0000000000000000000000000000000000000000",
      RoyaltySplitter: "0x0000000000000000000000000000000000000000",
      ForkTracker: "0x0000000000000000000000000000000000000000",
      UniversityValidator: "0x0000000000000000000000000000000000000000"
    }
  };

  if (fs.existsSync(deploymentsFile)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsFile, "utf8"));
    console.log("✅ Loaded deployment addresses from deployments.json");
  } else {
    console.log("⚠️  No deployment file found, using placeholder addresses");
  }

  // Read ABIs from artifacts
  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
  
  const contracts = [
    "ThesisRegistry",
    "RoyaltySplitter",
    "ForkTracker",
    "UniversityValidator"
  ];

  const abis = {};
  
  for (const contractName of contracts) {
    const artifactPath = path.join(artifactsDir, `${contractName}.sol`, `${contractName}.json`);
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      abis[contractName] = artifact.abi;
      console.log(`✅ Loaded ABI for ${contractName}`);
    } else {
      console.log(`⚠️  ABI not found for ${contractName}`);
    }
  }

  // Create lib directory if it doesn't exist
  const libDir = path.join(__dirname, "..", "lib");
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  // Generate contracts.ts file
  const contractsConfig = `// Auto-generated contract configuration
// Generated at: ${new Date().toISOString()}

export const CONTRACT_ADDRESSES = {
  ThesisRegistry: "${deployments.contracts.ThesisRegistry || "0x0000000000000000000000000000000000000000"}",
  RoyaltySplitter: "${deployments.contracts.RoyaltySplitter || "0x0000000000000000000000000000000000000000"}",
  ForkTracker: "${deployments.contracts.ForkTracker || "0x0000000000000000000000000000000000000000"}",
  UniversityValidator: "${deployments.contracts.UniversityValidator || "0x0000000000000000000000000000000000000000"}",
} as const;

export const USDC_ADDRESS = "0x977fdEF62CE095Ae8750Fd3496730F24F60dea7a" as const;
export const ORIGIN_FACTORY_ADDRESS = "0x992C57b76E60D3c558144b15b47A73312889B12B" as const;

export const THESIS_REGISTRY_ABI = ${JSON.stringify(abis.ThesisRegistry || [], null, 2)} as const;

export const ROYALTY_SPLITTER_ABI = ${JSON.stringify(abis.RoyaltySplitter || [], null, 2)} as const;

export const FORK_TRACKER_ABI = ${JSON.stringify(abis.ForkTracker || [], null, 2)} as const;

export const UNIVERSITY_VALIDATOR_ABI = ${JSON.stringify(abis.UniversityValidator || [], null, 2)} as const;

// Network configuration
export const BASECAMP_TESTNET = {
  id: 123420001114,
  name: "Camp Network Basecamp",
  network: "basecamp",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.basecamp-testnet.camp.network"],
    },
    public: {
      http: ["https://rpc.basecamp-testnet.camp.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.basecamp-testnet.camp.network",
    },
  },
  testnet: true,
} as const;
`;

  const contractsFilePath = path.join(libDir, "contracts.ts");
  fs.writeFileSync(contractsFilePath, contractsConfig);
  console.log(`\n✅ Contract configuration written to: ${contractsFilePath}`);

  console.log("\n📋 Configuration Summary:");
  console.log("  ThesisRegistry:       ", deployments.contracts.ThesisRegistry || "Not deployed");
  console.log("  RoyaltySplitter:      ", deployments.contracts.RoyaltySplitter || "Not deployed");
  console.log("  ForkTracker:          ", deployments.contracts.ForkTracker || "Not deployed");
  console.log("  UniversityValidator:  ", deployments.contracts.UniversityValidator || "Not deployed");
  console.log("\n🎉 Frontend configuration updated successfully!");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error updating config:", error);
    process.exit(1);
  });
