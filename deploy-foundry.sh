#!/bin/bash

# ThesisChain Foundry Deployment Script
# This script deploys all contracts to Basecamp testnet using Foundry

set -e  # Exit on error

echo "🚀 ThesisChain Deployment Script"
echo "================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your PRIVATE_KEY and BASECAMP_RPC_URL"
    exit 1
fi

# Load environment variables
source .env

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env file!"
    exit 1
fi

# Set default RPC URL if not provided
if [ -z "$BASECAMP_RPC_URL" ]; then
    export BASECAMP_RPC_URL="https://rpc.basecamp-testnet.camp.network"
    echo "ℹ️  Using default RPC URL: $BASECAMP_RPC_URL"
fi

echo "📋 Configuration:"
echo "  RPC URL: $BASECAMP_RPC_URL"
echo "  Chain ID: 123420001114"
echo ""

# Check if forge is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Error: Foundry (forge) is not installed!"
    echo "Install it with: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
fi

echo "🔨 Building contracts..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Create deployments directory if it doesn't exist
mkdir -p deployments

echo "🚀 Deploying contracts to Basecamp testnet..."
echo ""

# Deploy with or without verification based on whether BLOCKSCOUT_API_KEY is set
if [ -z "$BLOCKSCOUT_API_KEY" ]; then
    echo "ℹ️  No BLOCKSCOUT_API_KEY found, deploying without verification"
    forge script script/Deploy.s.sol:DeployScript \
        --rpc-url $BASECAMP_RPC_URL \
        --private-key $PRIVATE_KEY \
        --broadcast \
        --legacy \
        -vvvv
else
    echo "ℹ️  BLOCKSCOUT_API_KEY found, deploying with verification"
    forge script script/Deploy.s.sol:DeployScript \
        --rpc-url $BASECAMP_RPC_URL \
        --private-key $PRIVATE_KEY \
        --broadcast \
        --verify \
        --etherscan-api-key $BLOCKSCOUT_API_KEY \
        --verifier-url https://explorer.basecamp-testnet.camp.network/api \
        --legacy \
        -vvvv
fi

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "  - Insufficient funds: Get testnet ETH from a faucet"
    echo "  - RPC connection error: Check network status or try again"
    echo "  - Nonce issues: Wait a moment and try again"
    exit 1
fi

echo ""
echo "✅ Deployment successful!"
echo ""

# Update frontend configuration
if [ -f "scripts/update-config.js" ]; then
    echo "📝 Updating frontend configuration..."
    node scripts/update-config.js
    echo "✅ Frontend configuration updated!"
else
    echo "⚠️  Warning: update-config.js not found, skipping frontend update"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Check deployments/foundry-deployments.json for contract addresses"
echo "  2. View contracts on Blockscout: https://explorer.basecamp-testnet.camp.network"
echo "  3. Test the contracts using the frontend or cast commands"
echo ""
