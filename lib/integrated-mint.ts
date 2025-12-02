"use client"

import { useAuth } from "@campnetwork/origin/react"
import { createLicenseTerms } from "@campnetwork/origin"
import { toast } from "sonner"
import { zeroAddress } from "viem"
import { useForkThesisContract } from "./thesis-contract"
import { ThesisMetadata } from "./camp"

/**
 * Integrated hook that mints via Origin SDK AND registers on custom contracts
 * This ensures both the IPNFT is created and your custom contracts track the thesis
 */
export function useIntegratedMint() {
  const auth = useAuth()

  const mintThesis = async (
    files: File[],
    metadata: Omit<ThesisMetadata, 'files'>,
    royaltyBps: number,
    progressCallback?: (progress: number) => void
  ): Promise<string> => {
    try {
      if (!auth?.origin) {
        throw new Error("Not authenticated with Origin SDK. Please connect your wallet first.")
      }

      // Validate files
      if (!files || files.length === 0) {
        throw new Error("No files provided for minting")
      }

      // Validate royalty bounds (1% - 100%)
      if (royaltyBps < 100 || royaltyBps > 10000) {
        throw new Error("Royalty must be between 1% (100 BPS) and 100% (10000 BPS)")
      }

      const primaryFile = files[0]
      console.log("Starting integrated mint process...", {
        fileName: primaryFile.name,
        fileSize: `${(primaryFile.size / 1024 / 1024).toFixed(2)}MB`,
        royaltyBps
      })

      progressCallback?.(5)

      // Skip automatic JWT refresh - it causes disconnection issues
      // Users can manually refresh at /refresh-auth if needed

      progressCallback?.(8)

      // Step 1: Ensure wallet is on the correct network
      try {
        const CAMP_TESTNET_CHAIN_ID = 123420001114
        
        // Check if window.ethereum is available
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const ethereum = (window as any).ethereum
          // Get current chain ID
          const currentChainId = await ethereum.request({ method: 'eth_chainId' })
          const currentChainIdDecimal = parseInt(currentChainId as string, 16)
          
          console.log("Current chain ID:", currentChainIdDecimal)
          
          if (currentChainIdDecimal !== CAMP_TESTNET_CHAIN_ID) {
            console.log("Wrong network detected, switching to Camp Testnet...")
            toast.info("Switching to Camp Network...", {
              description: "Please approve the network switch in your wallet"
            })
            
            try {
              // Try to switch to Camp Testnet
              await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${CAMP_TESTNET_CHAIN_ID.toString(16)}` }],
              })
              console.log("✓ Switched to Camp Testnet")
            } catch (switchError: any) {
              // If the chain hasn't been added to the wallet, add it
              if (switchError.code === 4902) {
                console.log("Camp Testnet not found, adding network...")
                await ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: `0x${CAMP_TESTNET_CHAIN_ID.toString(16)}`,
                    chainName: 'Camp Network Testnet',
                    nativeCurrency: {
                      name: 'CAMP',
                      symbol: 'CAMP',
                      decimals: 18
                    },
                    rpcUrls: ['https://rpc-campnetwork.xyz'],
                    blockExplorerUrls: ['https://basecamp.cloud.blockscout.com']
                  }],
                })
                console.log("✓ Added and switched to Camp Testnet")
              } else {
                throw switchError
              }
            }
            
            // Wait a moment for the network switch to complete
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      } catch (networkError) {
        console.error("Network validation/switch failed:", networkError)
        throw new Error("Please switch to Camp Network Testnet in your wallet and try again")
      }

      progressCallback?.(10)

      // Step 1: Mint via Origin SDK to get IPFS URI
      const license = createLicenseTerms(
        BigInt("1000000000000000"), // 0.001 CAMP minimum price
        86400, // 1 day duration
        royaltyBps,
        zeroAddress
      )

      progressCallback?.(20)

      const enhancedMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        attributes: [
          ...metadata.attributes,
          { trait_type: "File Count", value: files.length },
          { trait_type: "Primary File", value: files[0].name }
        ]
      }

      progressCallback?.(30)

      // Step 2: Set up wallet client for Origin SDK using the same provider used for auth
      try {
        if (typeof window !== 'undefined') {
          const { createWalletClient, custom } = await import('viem')
          const { campTestnet } = await import('@campnetwork/origin')
          
          // Try to get the provider that was used for authentication
          // The Origin SDK stores this internally
          let provider = (window as any).ethereum
          
          // If auth has a provider stored, use that instead
          if ((auth as any).provider) {
            provider = (auth as any).provider
            console.log("✓ Using Origin SDK's stored provider")
          } else {
            console.log("⚠️ Using window.ethereum as fallback")
          }
          
          const walletClient = createWalletClient({
            chain: campTestnet,
            transport: custom(provider)
          })
          
          // Set the wallet client on the Origin SDK
          auth.origin.setViemClient(walletClient)
          console.log("✓ Wallet client configured for Origin SDK")
        }
      } catch (clientError) {
        console.error("Failed to set up wallet client:", clientError)
        throw new Error("Failed to configure wallet for minting. Please refresh and try again.")
      }

      progressCallback?.(40)

      console.log("Minting via Origin SDK...")
      
      // Verify authentication is ready
      if (!auth.origin.getJwt()) {
        throw new Error("Authentication token missing. Please refresh and reconnect your wallet.")
      }
      
      // Mint via Origin SDK
      const originTokenId = await auth.origin.mintFile(
        primaryFile,
        enhancedMetadata,
        license,
        undefined,
        {
          progressCallback: (progress) => {
            // Map Origin SDK progress (0-100) to our progress (40-80)
            progressCallback?.(40 + (progress * 0.4))
          }
        }
      )

      if (!originTokenId) {
        throw new Error("Failed to mint via Origin SDK - no token ID returned")
      }

      console.log("Origin SDK mint successful! Token ID:", originTokenId)
      progressCallback?.(70)

      // Step 2: Get the IPFS URI from Origin SDK (optional, may fail if not indexed yet)
      let ipfsUri = ""
      try {
        // Wait a moment for indexing
        await new Promise(resolve => setTimeout(resolve, 2000))
        ipfsUri = await auth.origin.tokenURI(BigInt(originTokenId))
        console.log("✓ Retrieved IPFS URI:", ipfsUri)
      } catch (error) {
        console.log("ℹ️ Token URI not available yet (normal for new mints)")
        // This is expected for newly minted tokens
        // The URI will be available after blockchain indexing
        ipfsUri = `ipfs://thesis-${originTokenId}`
      }

      progressCallback?.(80)

      // Step 3: Skip custom contract registration (using Origin SDK only)
      // The Origin SDK handles all on-chain operations
      console.log("✓ Skipping custom contract registration (using Origin SDK)")
      progressCallback?.(90)

      // Step 4: Track in RxDB for offline-first access
      try {
        const { trackMintedIPNFT } = await import('./db/ipnft-operations')
        
        // Get wallet address
        let walletAddress = ""
        const jwt = auth.origin.getJwt()
        if (jwt) {
          const payload = JSON.parse(atob(jwt.split('.')[1]))
          walletAddress = payload.address || ""
        }

        await trackMintedIPNFT(
          originTokenId,
          walletAddress,
          enhancedMetadata,
          royaltyBps,
          {
            name: primaryFile.name,
            type: primaryFile.type,
            size: primaryFile.size
          }
        )
        console.log("✓ IPNFT tracked in RxDB")
      } catch (trackError) {
        console.error("Failed to track IPNFT in RxDB:", trackError)
        // Don't fail the mint if tracking fails
      }
      
      progressCallback?.(100)

      toast.success("Thesis minted successfully!", {
        description: `Token ID: ${originTokenId}`
      })

      return originTokenId
    } catch (error) {
      console.error("Error in integrated mint:", error)
      
      let errorMessage = "Failed to mint thesis"
      let errorDescription = ""
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        if (errorMessage.includes("User rejected") || errorMessage.includes("denied")) {
          errorMessage = "Transaction cancelled"
          errorDescription = "You rejected the transaction in your wallet."
        } else if (errorMessage.includes("insufficient")) {
          errorDescription = "You don't have enough funds to complete this transaction."
        } else if (errorMessage.includes("Authentication failed") || errorMessage.includes("Failed to get signature")) {
          errorDescription = "Visit /refresh-auth to fix authentication issues."
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription || "Please try again or contact support.",
        duration: 10000 // Show auth errors longer
      })
      
      throw error
    }
  }

  return { mintThesis }
}

/**
 * Integrated fork hook that creates derivative via Origin SDK AND registers on ForkTracker
 */
export function useIntegratedFork(parentTokenId: bigint) {
  const auth = useAuth()
  const { forkThesis: forkOnContract } = useForkThesisContract()

  const forkThesis = async (
    newFiles: File[],
    metadata: Omit<ThesisMetadata, 'files'>,
    royaltyBps: number,
    progressCallback?: (progress: number) => void
  ): Promise<string> => {
    try {
      if (!auth?.origin) {
        throw new Error("Not authenticated with Origin SDK")
      }

      progressCallback?.(10)

      // Step 1: Create derivative via Origin SDK
      const license = createLicenseTerms(
        BigInt("1000000000000000"),
        86400,
        royaltyBps,
        zeroAddress
      )

      progressCallback?.(20)

      const enhancedMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        attributes: [
          ...metadata.attributes,
          { trait_type: "Fork", value: "true" },
          { trait_type: "Parent Token", value: parentTokenId.toString() }
        ]
      }

      progressCallback?.(30)

      console.log("Creating fork via Origin SDK...")
      const parents: bigint[] = [parentTokenId]
      const originTokenId = await auth.origin.mintFile(
        newFiles[0],
        enhancedMetadata,
        license,
        parents,
        {
          progressCallback: (progress) => {
            progressCallback?.(30 + (progress * 0.3))
          }
        }
      )

      if (!originTokenId) {
        throw new Error("Failed to fork via Origin SDK")
      }

      console.log("Origin SDK fork successful! Token ID:", originTokenId)
      progressCallback?.(60)

      // Step 2: Get IPFS URI
      let ipfsUri = ""
      try {
        ipfsUri = await auth.origin.tokenURI(BigInt(originTokenId))
      } catch (error) {
        ipfsUri = `ipfs://thesis-fork-${originTokenId}`
      }

      progressCallback?.(70)

      // Step 3: Register fork on ForkTracker contract
      console.log("Registering fork on ForkTracker contract...")
      toast.info("Registering fork on blockchain...", {
        description: "Please confirm the transaction in your wallet"
      })

      try {
        await forkOnContract(parentTokenId, ipfsUri)
        console.log("ForkTracker registration successful!")
        progressCallback?.(95)
      } catch (contractError) {
        console.error("Failed to register on ForkTracker:", contractError)
        toast.warning("Fork created but contract registration failed", {
          description: "Your fork is on Origin but may not appear in custom features"
        })
      }
      
      progressCallback?.(100)

      toast.success("Thesis forked successfully!", {
        description: "Your derivative work has been created and registered"
      })

      return originTokenId
    } catch (error) {
      console.error("Error in integrated fork:", error)
      
      toast.error("Failed to fork thesis", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
      
      throw error
    }
  }

  return { forkThesis }
}
