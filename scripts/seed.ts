import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import {
  CONTRACT_ADDRESSES,
  THESIS_REGISTRY_ABI,
  ROYALTY_SPLITTER_ABI,
  FORK_TRACKER_ABI,
  USDC_ADDRESS,
} from '../lib/contracts';

dotenv.config();

// African universities data
const UNIVERSITIES = [
  'University of Lagos (UNILAG)',
  'University of Ghana (UG)',
  'Makerere University',
  'Strathmore University',
  'University of Nairobi',
  'Kwame Nkrumah University of Science and Technology (KNUST)',
  'University of Cape Town',
  'Covenant University',
];

// Departments
const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Agricultural Science',
  'Environmental Studies',
  'Business Administration',
  'Renewable Energy',
  'Data Science',
  'Biotechnology',
];

// Realistic thesis data
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
    royaltyBps: 800, // 8%
  },
  {
    title: 'Solar Microgrids for Rural Electrification in East Africa',
    abstract: 'This thesis presents a comprehensive framework for deploying solar microgrids in rural East African communities, analyzing technical, economic, and social factors.',
    university: 'Makerere University',
    department: 'Renewable Energy',
    year: 2024,
    author: 'Sarah Nakato',
    keywords: ['Solar Energy', 'Microgrids', 'Rural Electrification', 'Sustainability'],
    royaltyBps: 1200, // 12%
  },
  {
    title: 'IoT-Based Water Management Systems for Urban Areas in Nigeria',
    abstract: 'Development of an IoT-based smart water management system to address water scarcity and distribution challenges in Nigerian urban centers.',
    university: 'Covenant University',
    department: 'Electrical Engineering',
    year: 2023,
    author: 'Chioma Nwosu',
    keywords: ['IoT', 'Water Management', 'Smart Cities', 'Infrastructure'],
    royaltyBps: 900, // 9%
  },
  {
    title: 'Climate Change Impact on Agricultural Productivity in Kenya',
    abstract: 'A comprehensive study analyzing the effects of climate change on agricultural productivity in Kenya and proposing adaptive strategies for farmers.',
    university: 'University of Nairobi',
    department: 'Environmental Studies',
    year: 2024,
    author: 'James Mwangi',
    keywords: ['Climate Change', 'Agriculture', 'Adaptation', 'Food Security'],
    royaltyBps: 700, // 7%
  },
  {
    title: 'Mobile Money Integration for Financial Inclusion in Ghana',
    abstract: 'Examining the role of mobile money platforms in promoting financial inclusion among unbanked populations in Ghana.',
    university: 'Kwame Nkrumah University of Science and Technology (KNUST)',
    department: 'Business Administration',
    year: 2023,
    author: 'Akosua Boateng',
    keywords: ['Mobile Money', 'Financial Inclusion', 'Fintech', 'Digital Banking'],
    royaltyBps: 1100, // 11%
  },
  {
    title: 'Renewable Energy Policy Framework for South Africa',
    abstract: 'Analysis of renewable energy policies in South Africa and recommendations for accelerating the transition to clean energy.',
    university: 'University of Cape Town',
    department: 'Renewable Energy',
    year: 2024,
    author: 'Thabo Mbeki',
    keywords: ['Renewable Energy', 'Policy', 'Energy Transition', 'Sustainability'],
    royaltyBps: 850, // 8.5%
  },
  {
    title: 'AI-Powered Disease Diagnosis in Resource-Limited Healthcare Settings',
    abstract: 'Development of an AI-based diagnostic tool for common diseases in resource-limited healthcare facilities across East Africa.',
    university: 'Strathmore University',
    department: 'Data Science',
    year: 2024,
    author: 'Grace Wanjiru',
    keywords: ['Artificial Intelligence', 'Healthcare', 'Diagnostics', 'Medical Technology'],
    royaltyBps: 1300, // 13%
  },
  {
    title: 'Sustainable Urban Transportation Systems for Lagos Megacity',
    abstract: 'Proposing sustainable transportation solutions to address traffic congestion and pollution in Lagos, Nigeria.',
    university: 'University of Lagos (UNILAG)',
    department: 'Environmental Studies',
    year: 2023,
    author: 'Oluwaseun Adeyemi',
    keywords: ['Transportation', 'Urban Planning', 'Sustainability', 'Smart Cities'],
    royaltyBps: 950, // 9.5%
  },
  {
    title: 'Biotechnology Applications in Cassava Crop Improvement',
    abstract: 'Research on using biotechnology to develop disease-resistant and high-yielding cassava varieties for African farmers.',
    university: 'Makerere University',
    department: 'Biotechnology',
    year: 2024,
    author: 'Moses Okello',
    keywords: ['Biotechnology', 'Cassava', 'Crop Improvement', 'Food Security'],
    royaltyBps: 1000, // 10%
  },
  {
    title: 'E-Learning Platforms for Rural Education in Ghana',
    abstract: 'Design and implementation of accessible e-learning platforms to improve educational outcomes in rural Ghanaian communities.',
    university: 'University of Ghana (UG)',
    department: 'Computer Science',
    year: 2023,
    author: 'Ama Asante',
    keywords: ['E-Learning', 'Education Technology', 'Digital Divide', 'Rural Development'],
    royaltyBps: 800, // 8%
  },
  {
    title: 'Waste-to-Energy Solutions for African Cities',
    abstract: 'Exploring waste-to-energy technologies as a sustainable solution for waste management and energy generation in African urban centers.',
    university: 'Covenant University',
    department: 'Environmental Studies',
    year: 2024,
    author: 'Ibrahim Yusuf',
    keywords: ['Waste Management', 'Energy', 'Sustainability', 'Circular Economy'],
    royaltyBps: 900, // 9%
  },
  {
    title: 'Drone Technology for Agricultural Monitoring in Kenya',
    abstract: 'Application of drone technology for crop monitoring, pest detection, and precision agriculture in Kenyan farms.',
    university: 'University of Nairobi',
    department: 'Agricultural Science',
    year: 2024,
    author: 'Lucy Kamau',
    keywords: ['Drones', 'Agriculture', 'Remote Sensing', 'Precision Farming'],
    royaltyBps: 1050, // 10.5%
  },
  {
    title: 'Cybersecurity Framework for African Financial Institutions',
    abstract: 'Development of a comprehensive cybersecurity framework tailored to the unique challenges faced by African financial institutions.',
    university: 'Strathmore University',
    department: 'Computer Science',
    year: 2023,
    author: 'David Ochieng',
    keywords: ['Cybersecurity', 'Financial Technology', 'Risk Management', 'Data Protection'],
    royaltyBps: 1150, // 11.5%
  },
  {
    title: 'Renewable Energy Integration in South African Power Grid',
    abstract: 'Technical analysis of integrating renewable energy sources into the South African national power grid.',
    university: 'University of Cape Town',
    department: 'Electrical Engineering',
    year: 2024,
    author: 'Nomsa Dlamini',
    keywords: ['Renewable Energy', 'Power Grid', 'Energy Storage', 'Grid Integration'],
    royaltyBps: 1000, // 10%
  },
];

// Helper function to create IPFS-like URI (mock for seeding)
function createMockIPFSUri(title: string): string {
  // Create a deterministic hash-like string from the title
  const hash = Buffer.from(title).toString('base64').substring(0, 46).replace(/[/+=]/g, '');
  return `ipfs://Qm${hash}`;
}

// Helper function to format USDC amount
function parseUSDC(amount: string): bigint {
  return ethers.parseUnits(amount, 6); // USDC has 6 decimals
}

async function main() {
  console.log('🌍 Starting ThesisChain Africa Seed Script...\n');
  const startTime = Date.now();

  // Setup provider and wallet
  const rpcUrl = process.env.BASECAMP_RPC_URL || 'https://rpc-campnetwork.xyz/';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not found in environment variables');
  }
  
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(`📝 Using wallet: ${wallet.address}\n`);

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

  // Step 1: Mint 15 thesis IPNFTs
  console.log('📚 Step 1: Minting 15 thesis IPNFTs...');
  const mintedTokenIds: bigint[] = [];
  
  for (let i = 0; i < THESIS_DATA.length; i++) {
    const thesis = THESIS_DATA[i];
    const uri = createMockIPFSUri(thesis.title);
    
    try {
      const tx = await thesisRegistry.mintThesis(uri, thesis.royaltyBps);
      const receipt = await tx.wait();
      
      // Extract token ID from event
      const event = receipt.logs.find((log: any) => {
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
      }
    } catch (error: any) {
      console.error(`  ❌ Failed to mint thesis ${i + 1}: ${error.message}`);
    }
  }
  
  console.log(`\n✨ Successfully minted ${mintedTokenIds.length} theses\n`);

  // Step 2: Create 5 fork relationships
  console.log('🔀 Step 2: Creating 5 fork relationships...');
  const forkPairs = [
    { parent: 0, child: 'Enhanced ML Agriculture with Deep Learning' },
    { parent: 1, child: 'Blockchain for Coffee Supply Chain in Ethiopia' },
    { parent: 2, child: 'Hybrid Solar-Wind Microgrids for Rural Areas' },
    { parent: 7, child: 'AI Diagnostics for Malaria in Remote Clinics' },
    { parent: 9, child: 'Biotech Solutions for Drought-Resistant Maize' },
  ];

  const forkedTokenIds: bigint[] = [];
  
  for (let i = 0; i < forkPairs.length; i++) {
    const { parent, child } = forkPairs[i];
    
    if (parent >= mintedTokenIds.length) {
      console.log(`  ⚠️  Skipping fork ${i + 1}: Parent index out of range`);
      continue;
    }
    
    const parentTokenId = mintedTokenIds[parent];
    const forkUri = createMockIPFSUri(child);
    
    try {
      const tx = await forkTracker.forkThesis(parentTokenId, forkUri);
      const receipt = await tx.wait();
      
      // Extract new token ID from event
      const event = receipt.logs.find((log: any) => {
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
      }
    } catch (error: any) {
      console.error(`  ❌ Failed to create fork ${i + 1}: ${error.message}`);
    }
  }
  
  console.log(`\n✨ Successfully created ${forkedTokenIds.length} fork relationships\n`);

  // Step 3: Simulate royalty payments (50+ USDC total)
  console.log('💰 Step 3: Simulating royalty payments...');
  
  // We'll distribute royalties to some of the minted theses
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
    
    try {
      // Set royalty shares (100% to author for simplicity)
      const thesis = THESIS_DATA[dist.tokenId];
      await royaltySplitter.setRoyaltyShares(tokenId, [wallet.address], [100]);
      
      // Distribute royalties
      const tx = await royaltySplitter.distributeForToken(tokenId, amount);
      await tx.wait();
      
      totalRoyalties += parseFloat(dist.amount);
      console.log(`  ✅ Distributed ${dist.amount} USDC to thesis "${thesis.title}"`);
    } catch (error: any) {
      console.error(`  ❌ Failed to distribute royalties: ${error.message}`);
    }
  }
  
  console.log(`\n✨ Total royalties distributed: ${totalRoyalties.toFixed(2)} USDC\n`);

  // Step 4: Create 3 Share IPs (simulated - would normally use Origin SDK)
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

  // Summary
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

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
