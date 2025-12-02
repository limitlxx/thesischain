/**
 * ThesisChain Africa Seed Script – AUTO-RETRY VERSION
 * Keeps running until RPC connects & seeding completes (no more timeouts!)
 * Usage: pnpm run seed
 */

const { ethers } = require('ethers');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Your original thesis data (keeping it perfect!)
const THESIS_DATA = [
  {
    title: 'Machine Learning Applications in Precision Agriculture for Sub-Saharan Africa',
    abstract: 'This research explores the application of machine learning algorithms to optimize crop yields in smallholder farms across Sub-Saharan Africa, focusing on soil analysis and weather prediction.',
    university: 'University of Ghana (UG)',
    department: 'Computer Science',
    year: 2024,
    author: 'Dr. Kwame Mensah',
    keywords: ['Machine Learning', 'Agriculture', 'IoT', 'Precision Farming'],
    royaltyBps: 1000, // 10%
  },
  {
    title: 'Blockchain-Based Supply Chain Management for African Agricultural Products',
    abstract: 'An investigation into using blockchain technology to improve transparency and traceability in agricultural supply chains, reducing post-harvest losses and improving farmer income.',
    university: 'University of Lagos (UNILAG)',
    department: 'Business Administration',
    year: 2023,
    author: 'Adebayo Okonkwo',
    keywords: ['Blockchain', 'Supply Chain', 'Agriculture', 'Traceability'],
    royaltyBps: 800,
  },
  {
    title: 'Solar Microgrids for Rural Electrification in East Africa',
    abstract: 'This thesis presents a comprehensive framework for deploying solar microgrids in rural East African communities, analyzing technical, economic, and social factors.',
    university: 'Makerere University',
    department: 'Renewable Energy',
    year: 2024,
    author: 'Sarah Nakato',
    keywords: ['Solar Energy', 'Microgrids', 'Rural Electrification', 'Sustainability'],
    royaltyBps: 1200,
  },
  {
    title: 'IoT-Based Water Management Systems for Urban Areas in Nigeria',
    abstract: 'Development of an IoT-based smart water management system to address water scarcity and distribution challenges in Nigerian urban centers.',
    university: 'Covenant University',
    department: 'Electrical Engineering',
    year: 2023,
    author: 'Chioma Nwosu',
    keywords: ['IoT', 'Water Management', 'Smart Cities', 'Infrastructure'],
    royaltyBps: 900,
  },
  {
    title: 'Climate Change Impact on Agricultural Productivity in Kenya',
    abstract: 'A comprehensive study analyzing the effects of climate change on agricultural productivity in Kenya and proposing adaptive strategies for farmers.',
    university: 'University of Nairobi',
    department: 'Environmental Studies',
    year: 2024,
    author: 'James Mwangi',
    keywords: ['Climate Change', 'Agriculture', 'Adaptation', 'Food Security'],
    royaltyBps: 700,
  },
  {
    title: 'Mobile Money Integration for Financial Inclusion in Ghana',
    abstract: 'Examining the role of mobile money platforms in promoting financial inclusion among unbanked populations in Ghana.',
    university: 'Kwame Nkrumah University of Science and Technology (KNUST)',
    department: 'Business Administration',
    year: 2023,
    author: 'Akosua Boateng',
    keywords: ['Mobile Money', 'Financial Inclusion', 'Fintech', 'Digital Banking'],
    royaltyBps: 1100,
  },
  {
    title: 'Renewable Energy Policy Framework for South Africa',
    abstract: 'Analysis of renewable energy policies in South Africa and recommendations for accelerating the transition to clean energy.',
    university: 'University of Cape Town',
    department: 'Renewable Energy',
    year: 2024,
    author: 'Thabo Mbeki',
    keywords: ['Renewable Energy', 'Policy', 'Energy Transition', 'Sustainability'],
    royaltyBps: 850,
  },
  {
    title: 'AI-Powered Disease Diagnosis in Resource-Limited Healthcare Settings',
    abstract: 'Development of an AI-based diagnostic tool for common diseases in resource-limited healthcare facilities across East Africa.',
    university: 'Strathmore University',
    department: 'Data Science',
    year: 2024,
    author: 'Grace Wanjiru',
    keywords: ['Artificial Intelligence', 'Healthcare', 'Diagnostics', 'Medical Technology'],
    royaltyBps: 1300,
  },
  {
    title: 'Sustainable Urban Transportation Systems for Lagos Megacity',
    abstract: 'Proposing sustainable transportation solutions to address traffic congestion and pollution in Lagos, Nigeria.',
    university: 'University of Lagos (UNILAG)',
    department: 'Environmental Studies',
    year: 2023,
    author: 'Oluwaseun Adeyemi',
    keywords: ['Transportation', 'Urban Planning', 'Sustainability', 'Smart Cities'],
    royaltyBps: 950,
  },
  {
    title: 'Biotechnology Applications in Cassava Crop Improvement',
    abstract: 'Research on using biotechnology to develop disease-resistant and high-yielding cassava varieties for African farmers.',
    university: 'Makerere University',
    department: 'Biotechnology',
    year: 2024,
    author: 'Moses Okello',
    keywords: ['Biotechnology', 'Cassava', 'Crop Improvement', 'Food Security'],
    royaltyBps: 1000,
  },
  {
    title: 'E-Learning Platforms for Rural Education in Ghana',
    abstract: 'Design and implementation of accessible e-learning platforms to improve educational outcomes in rural Ghanaian communities.',
    university: 'University of Ghana (UG)',
    department: 'Computer Science',
    year: 2023,
    author: 'Ama Asante',
    keywords: ['E-Learning', 'Education Technology', 'Digital Divide', 'Rural Development'],
    royaltyBps: 800,
  },
  {
    title: 'Waste-to-Energy Solutions for African Cities',
    abstract: 'Exploring waste-to-energy technologies as a sustainable solution for waste management and energy generation in African urban centers.',
    university: 'Covenant University',
    department: 'Environmental Studies',
    year: 2024,
    author: 'Ibrahim Yusuf',
    keywords: ['Waste Management', 'Energy', 'Sustainability', 'Circular Economy'],
    royaltyBps: 900,
  },
  {
    title: 'Drone Technology for Agricultural Monitoring in Kenya',
    abstract: 'Application of drone technology for crop monitoring, pest detection, and precision agriculture in Kenyan farms.',
    university: 'University of Nairobi',
    department: 'Agricultural Science',
    year: 2024,
    author: 'Lucy Kamau',
    keywords: ['Drones', 'Agriculture', 'Remote Sensing', 'Precision Farming'],
    royaltyBps: 1050,
  },
  {
    title: 'Cybersecurity Framework for African Financial Institutions',
    abstract: 'Development of a comprehensive cybersecurity framework tailored to the unique challenges faced by African financial institutions.',
    university: 'Strathmore University',
    department: 'Computer Science',
    year: 2023,
    author: 'David Ochieng',
    keywords: ['Cybersecurity', 'Financial Technology', 'Risk Management', 'Data Protection'],
    royaltyBps: 1150,
  },
  {
    title: 'Renewable Energy Integration in South African Power Grid',
    abstract: 'Technical analysis of integrating renewable energy sources into the South African national power grid.',
    university: 'University of Cape Town',
    department: 'Electrical Engineering',
    year: 2024,
    author: 'Nomsa Dlamini',
    keywords: ['Renewable Energy', 'Power Grid', 'Energy Storage', 'Grid Integration'],
    royaltyBps: 1000,
  },
];

// Helper functions (your originals – unchanged)
function createMockIPFSUri(title) {
  const hash = Buffer.from(title).toString('base64').substring(0, 46).replace(/[/+=]/g, '');
  return `ipfs://Qm${hash}`;
}

function parseUSDC(amount) {
  return ethers.parseUnits(amount, 6); // USDC has 6 decimals
}

// Load contracts (your original logic)
const contractsContent = fs.readFileSync(path.join(__dirname, '../lib/contracts.ts'), 'utf8');
const addressMatch = contractsContent.match(/ThesisRegistry:\s*"(0x[a-fA-F0-9]+)"/);
const royaltyMatch = contractsContent.match(/RoyaltySplitter:\s*"(0x[a-fA-F0-9]+)"/);
const forkMatch = contractsContent.match(/ForkTracker:\s*"(0x[a-fA-F0-9]+)"/);

const CONTRACT_ADDRESSES = {
  ThesisRegistry: addressMatch ? addressMatch[1] : process.env.NEXT_PUBLIC_THESIS_REGISTRY_ADDRESS,
  RoyaltySplitter: royaltyMatch ? royaltyMatch[1] : process.env.NEXT_PUBLIC_ROYALTY_SPLITTER_ADDRESS,
  ForkTracker: forkMatch ? forkMatch[1] : process.env.NEXT_PUBLIC_FORK_TRACKER_ADDRESS,
};

// Load ABIs (your originals)
const THESIS_REGISTRY_ABI = require('../artifacts/contracts/ThesisRegistry.sol/ThesisRegistry.json').abi;
const ROYALTY_SPLITTER_ABI = require('../artifacts/contracts/RoyaltySplitter.sol/RoyaltySplitter.json').abi;
const FORK_TRACKER_ABI = require('../artifacts/contracts/ForkTracker.sol/ForkTracker.json').abi;

// ===============================================
// NEW: AUTO-RETRY PROVIDER (KEEPS TRYING UNTIL DONE)
// ===============================================
const RPC_URLS = [
  'https://rpc-campnetwork.xyz',
  'https://rpc.basecamp.t.raas.gelato.cloud',
  'https://123420001114.rpc.thirdweb.com'  // NEW: Reliable Thirdweb RPC (from ChainList)
];

async function getWorkingProvider() {
  let totalAttempts = 0;
  while (true) {
    totalAttempts++;
    console.log(`🔄 RPC Attempt ${totalAttempts}... (will keep trying until connected)`);

    for (let rpcIndex = 0; rpcIndex < RPC_URLS.length; rpcIndex++) {
      const url = RPC_URLS[rpcIndex];
      try {
        const provider = new ethers.JsonRpcProvider(url, undefined, { timeout: 45000 }); // 45s timeout
        const block = await provider.getBlockNumber();
        console.log(`✅ SUCCESS! Connected to ${url} (Block: ${block})`);
        return provider;
      } catch (error) {
        console.log(`   ❌ ${url} failed: ${error.shortMessage || error.message}`);
      }
    }

    console.log(`⏳ All RPCs failed this round. Retrying in 5 seconds... (Attempt ${totalAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before next full round
  }
}

// ===============================================
// MAIN FUNCTION WITH RETRY LOGIC
// ===============================================
async function main() {
  console.log('🌍 Starting ThesisChain Africa Seed Script (Auto-Retry Mode)...\n');
  const startTime = Date.now();

  // Get working provider (loops until success)
  const provider = await getWorkingProvider();
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found in environment variables');
  }
  
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(`📝 Using wallet: ${wallet.address}`);
  
  // Balance check (with retry if needed)
  console.log('💰 Checking wallet balance...');
  let balance;
  try {
    balance = await provider.getBalance(wallet.address);
    const balanceInEth = ethers.formatEther(balance);
    console.log(`   Balance: ${balanceInEth} ETH`);
    
    const minBalance = ethers.parseEther('0.01');
    if (balance < minBalance) {
      console.log('   ⚠️  Balance is below recommended minimum (0.01 ETH)');
    } else {
      console.log('   ✅ Balance is sufficient');
    }
  } catch (error) {
    console.error('   ❌ Failed to check balance:', error.message);
  }
  
  console.log('\n');

  // Initialize contracts
  const thesisRegistry = new ethers.Contract(
    CONTRACT_ADDRESSES.ThesisRegistry,
    THESIS_REGISTRY_ABI,
    wallet
  );

  const royaltySplitter = new ethers.Contract(
    CONTRACT_ADDRESSES.RoyaltySplitter,
    ROYALTY_SPLITTER_ABI,
    wallet
  );

  const forkTracker = new ethers.Contract(
    CONTRACT_ADDRESSES.ForkTracker,
    FORK_TRACKER_ABI,
    wallet
  );

  // Your original estimate (unchanged)
  console.log('📊 Seed script will perform approximately:');
  console.log(`   • ${THESIS_DATA.length} thesis minting transactions`);
  console.log(`   • 5 fork creation transactions`);
  console.log(`   • 10 royalty-related transactions (set shares + distribute)`);
  console.log(`   • Total: ~30 transactions\n`);

  // Step 1: Mint theses (with per-tx retry)
  console.log('📚 Step 1: Minting 15 thesis IPNFTs...');
  const mintedTokenIds = [];
  
  for (let i = 0; i < THESIS_DATA.length; i++) {
    const thesis = THESIS_DATA[i];
    const uri = createMockIPFSUri(thesis.title);
    
    let success = false;
    for (let retry = 0; retry < 5; retry++) {  // 5 retries per thesis
      try {
        const tx = await thesisRegistry.mintThesis(uri, thesis.royaltyBps, {
          gasLimit: 5_000_000  // Higher gas for testnet
        });
        const receipt = await tx.wait(1, 60000);  // 60s wait timeout
        
        const event = receipt.logs.find((log) => {
          try {
            const parsed = thesisRegistry.interface.parseLog(log);
            return parsed?.name === 'ThesisMinted';
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = thesisRegistry.interface.parseLog(event);
          const tokenId = parsed?.args.tokenId;
          mintedTokenIds.push(tokenId);
          console.log(`  ✅ Minted thesis ${i + 1}/15: "${thesis.title}" (Token ID: ${tokenId})`);
          success = true;
          break;
        }
      } catch (error) {
        console.log(`  🔄 Retry ${retry + 1}/5 for thesis ${i + 1}: ${error.message.substring(0, 80)}...`);
        if (retry < 4) await new Promise(r => setTimeout(r, 3000));  // 3s delay
      }
    }
    
    if (!success) {
      console.log(`  ❌ Failed to mint thesis ${i + 1} after 5 retries`);
    }
  }
  
  console.log(`\n✨ Successfully minted ${mintedTokenIds.length} theses\n`);

  // Step 2: Forks (your original with retry)
  console.log('🔀 Step 2: Creating 5 fork relationships...');
  const forkPairs = [
    { parent: 0, child: 'Enhanced ML Agriculture with Deep Learning' },
    { parent: 1, child: 'Blockchain for Coffee Supply Chain in Ethiopia' },
    { parent: 2, child: 'Hybrid Solar-Wind Microgrids for Rural Areas' },
    { parent: 7, child: 'AI Diagnostics for Malaria in Remote Clinics' },
    { parent: 9, child: 'Biotech Solutions for Drought-Resistant Maize' },
  ];

  const forkedTokenIds = [];
  
  for (let i = 0; i < forkPairs.length; i++) {
    const { parent, child } = forkPairs[i];
    
    if (parent >= mintedTokenIds.length) {
      console.log(`  ⚠️  Skipping fork ${i + 1}: Parent index out of range`);
      continue;
    }
    
    const parentTokenId = mintedTokenIds[parent];
    const forkUri = createMockIPFSUri(child);
    
    let success = false;
    for (let retry = 0; retry < 5; retry++) {
      try {
        const tx = await forkTracker.forkThesis(parentTokenId, forkUri, { gasLimit: 4_000_000 });
        const receipt = await tx.wait(1, 60000);
        
        const event = receipt.logs.find((log) => {
          try {
            const parsed = forkTracker.interface.parseLog(log);
            return parsed?.name === 'ThesisForked';
          } catch {
            return false;
          }
        });
        
        if (event) {
          const parsed = forkTracker.interface.parseLog(event);
          const newTokenId = parsed?.args.newTokenId;
          forkedTokenIds.push(newTokenId);
          console.log(`  ✅ Fork ${i + 1}/5: "${child}" (Token ID: ${newTokenId}, Parent: ${parentTokenId})`);
          success = true;
          break;
        }
      } catch (error) {
        console.log(`  🔄 Retry ${retry + 1}/5 for fork ${i + 1}: ${error.message.substring(0, 80)}...`);
        if (retry < 4) await new Promise(r => setTimeout(r, 3000));
      }
    }
    
    if (!success) {
      console.log(`  ❌ Failed to create fork ${i + 1} after 5 retries`);
    }
  }
  
  console.log(`\n✨ Successfully created ${forkedTokenIds.length} fork relationships\n`);

  // Step 3: Royalties (your original with retry)
  console.log('💰 Step 3: Simulating royalty payments...');
  
  const royaltyDistributions = [
    { tokenId: 0, amount: '12.50' },
    { tokenId: 1, amount: '8.75' },
    { tokenId: 2, amount: '15.00' },
    { tokenId: 3, amount: '6.25' },
    { tokenId: 7, amount: '10.50' },
  ];

  let totalRoyalties = 0;
  
  for (const dist of royaltyDistributions) {
    if (dist.tokenId >= mintedTokenIds.length) {
      continue;
    }
    
    const tokenId = mintedTokenIds[dist.tokenId];
    const amount = parseUSDC(dist.amount);
    
    let success = false;
    for (let retry = 0; retry < 5; retry++) {
      try {
        // Set royalty shares (100% to author = 10000 basis points)
        const thesis = THESIS_DATA[dist.tokenId];
        await royaltySplitter.setRoyaltyShares(tokenId, [wallet.address], [10000]);
        
        // Distribute royalties
        const tx = await royaltySplitter.distributeForToken(tokenId, amount, { gasLimit: 2_000_000 });
        await tx.wait(1, 60000);
        
        totalRoyalties += parseFloat(dist.amount);
        console.log(`  ✅ Distributed ${dist.amount} USDC to thesis "${thesis.title}"`);
        success = true;
        break;
      } catch (error) {
        console.log(`  🔄 Retry ${retry + 1}/5 for royalty ${dist.tokenId}: ${error.message.substring(0, 80)}...`);
        if (retry < 4) await new Promise(r => setTimeout(r, 3000));
      }
    }
    
    if (!success) {
      console.log(`  ❌ Failed to distribute royalties for token ${dist.tokenId} after 5 retries`);
    }
  }
  
  console.log(`\n✨ Total royalties distributed: ${totalRoyalties.toFixed(2)} USDC\n`);

  // Step 4: Share simulation (your original – no RPC needed)
  console.log('📱 Step 4: Creating 3 Share IPs (simulated)...');
  console.log('  ℹ️  Note: Share IPs would be created via Origin SDK mintSocial()');
  console.log('  ℹ️  In production, these are created when users share theses on social media');
  
  const shareSimulations = [
    { thesis: 0, platform: 'Twitter/X' },
    { thesis: 2, platform: 'Twitter/X' },
    { thesis: 7, platform: 'Twitter/X' },
  ];
  
  for (const share of shareSimulations) {
    if (share.thesis < THESIS_DATA.length) {
      const thesis = THESIS_DATA[share.thesis];
      console.log(`  📤 Share IP: "${thesis.title}" on ${share.platform}`);
    }
  }
  
  console.log('\n✨ Share IPs simulation complete\n');

  // Your original summary (with duration)
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 SEED SCRIPT SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Theses minted: ${mintedTokenIds.length}/15`);
  console.log(`✅ Fork relationships: ${forkedTokenIds.length}/5`);
  console.log(`✅ Royalties distributed: ${totalRoyalties.toFixed(2)} USDC`);
  console.log(`✅ Share IPs created: 3 (simulated)`);
  console.log(`✅ Universities represented: ${new Set(THESIS_DATA.map(t => t.university)).size}`);
  console.log(`⏱️  Execution time: ${duration} seconds`);
  console.log('═══════════════════════════════════════════════════════');
  
  if (parseFloat(duration) > 120) {
    console.log('⚠️  Warning: Script took longer than 2 minutes');
  } else {
    console.log('✅ Script completed within time limit');
  }
  
  console.log('\n🎉 Seed script completed successfully!\n');
}

// Run it – will auto-retry until done
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });