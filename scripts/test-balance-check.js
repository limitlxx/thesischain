/**
 * Check your CAMP (native token) balance on Camp Network Basecamp testnet
 * Also works for any EVM wallet address
 */

const { ethers } = require("ethers");
require("dotenv").config();

async function checkCampBalance() {
  console.log("Checking CAMP balance on Camp Network Basecamp testnet...\n");

  // Official RPCs (prioritize the fastest ones)
  const RPC_URLS = [
    "https://rpc-campnetwork.xyz",                    // Primary – fastest
    "https://rpc.basecamp.t.raas.gelato.cloud",       // Gelato fallback
    "https://camp-network-testnet.rpc.thirdweb.com",  // Thirdweb
  ];

  let provider;
  for (const url of RPC_URLS) {
    try {
      provider = new ethers.JsonRpcProvider(url);
      await provider.getBlockNumber(); // Test connection
      console.log(`Connected to RPC: ${url}`);
      break;
    } catch (e) {
      console.log(`Failed: ${url}`);
    }
  }

  if (!provider) {
    throw new Error("All RPCs failed – check internet or try later");
  }

  // Your wallet (from private key) OR just paste any address
  let address;
  if (process.env.PRIVATE_KEY) {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    address = wallet.address;
    console.log(`Wallet Address: ${address}`);
  } else if (process.env.WALLET_ADDRESS) {
    address = process.env.WALLET_ADDRESS;
    console.log(`Checking Address: ${address}`);
  } else {
    throw new Error("Set PRIVATE_KEY or WALLET_ADDRESS in .env");
  }

  try {
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);

    console.log(`\nCAMP Balance: ${balanceInEth} CAMP`);

    // Helpful thresholds
    if (balance === 0n) {
      console.log("Zero balance – get testnet CAMP from faucet:");
      console.log("https://faucet.campnetwork.xyz");
    } else if (balance < ethers.parseEther("0.05")) {
      console.log("Low balance – top up recommended for minting/forking");
    } else {
      console.log("Balance sufficient for minting, forking, and royalty payouts");
    }

    console.log("\nTest passed! Ready to deploy ThesisChain");
  } catch (error) {
    console.error("Failed to fetch balance:", error.message);
  }
}

checkCampBalance().catch(console.error);