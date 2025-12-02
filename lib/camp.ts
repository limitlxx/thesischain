"use client";

import { useAuth, useProvider } from "@campnetwork/origin/react";
import { createLicenseTerms } from "@campnetwork/origin";
import { toast } from "sonner";
import { zeroAddress } from "viem";
import { useEffect } from "react";

/**
 * Thesis metadata structure for IPFS
 */
export interface ThesisMetadata {
  name: string;
  description: string;
  image?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  files: Array<{
    type: "pdf" | "code" | "video";
    cid: string;
    name: string;
    size: number;
  }>;
}

/**
 * Hook for minting thesis IPNFTs
 * Uses Origin SDK's built-in IPFS upload via mintFile
 * 
 * IMPORTANT: This is a minimal implementation that doesn't interfere with Origin SDK's
 * internal wallet management. Let Origin SDK handle wallet connections on its own.
 */
export function useMintThesis() {
  const auth = useAuth();

  const mintThesis = async (
    files: File[],
    metadata: Omit<ThesisMetadata, "files">,
    royaltyBps: number,
    licensePriceCamp?: number,
    licenseDurationDays?: number,
    progressCallback?: (progress: number) => void
  ): Promise<string> => {
    try {
      if (!auth?.origin) {
        throw new Error(
          "Not authenticated with Origin SDK. Please connect your wallet first."
        );
      }

      // Verify JWT token exists and is valid
      try {
        const jwt = auth.origin.getJwt();
        if (!jwt) {
          throw new Error(
            "No authentication token found. Please reconnect your wallet."
          );
        }

        // Parse and check JWT expiration
        try {
          const parts = jwt.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const expiryDate = new Date(payload.exp * 1000);
            const isExpired = Date.now() > payload.exp * 1000;

            console.log("JWT token info:", {
              hasToken: true,
              expiresAt: expiryDate.toISOString(),
              isExpired,
              address: payload.address,
            });

            if (isExpired) {
              throw new Error(
                "Authentication token has expired. Please reconnect your wallet."
              );
            }
          }
        } catch (parseError) {
          console.warn("Could not parse JWT:", parseError);
        }

        console.log("✓ JWT token verified and valid");
      } catch (jwtError) {
        console.error("JWT verification failed:", jwtError);
        throw new Error(
          "Authentication token is invalid. Please disconnect and reconnect your wallet."
        );
      }

      // Get wallet address for tracking
      let walletAddress = "";
      try {
        const jwt = auth.origin.getJwt();
        if (jwt) {
          const payload = JSON.parse(atob(jwt.split(".")[1]));
          walletAddress = payload.address || "";
        }
      } catch {
        console.warn("Could not extract wallet address from JWT");
      }

      // Validate files
      if (!files || files.length === 0) {
        throw new Error("No files provided for minting");
      }

      const primaryFile = files[0];

      // Origin SDK supported file types and sizes
      const supportedTypes = {
        // Images
        "image/jpeg": { maxSize: 10 * 1024 * 1024, label: "JPEG" },
        "image/jpg": { maxSize: 10 * 1024 * 1024, label: "JPG" },
        "image/png": { maxSize: 10 * 1024 * 1024, label: "PNG" },
        "image/gif": { maxSize: 10 * 1024 * 1024, label: "GIF" },
        "image/webp": { maxSize: 10 * 1024 * 1024, label: "WebP" },
        // Audio
        "audio/mpeg": { maxSize: 15 * 1024 * 1024, label: "MP3" },
        "audio/wav": { maxSize: 15 * 1024 * 1024, label: "WAV" },
        "audio/ogg": { maxSize: 15 * 1024 * 1024, label: "OGG" },
        // Video
        "video/mp4": { maxSize: 20 * 1024 * 1024, label: "MP4" },
        "video/webm": { maxSize: 20 * 1024 * 1024, label: "WebM" },
        // Text
        "text/plain": { maxSize: 10 * 1024 * 1024, label: "TXT" },
      };

      // Check if file type is supported
      const fileTypeInfo =
        supportedTypes[primaryFile.type as keyof typeof supportedTypes];
      if (!fileTypeInfo) {
        const supportedList = Object.values(supportedTypes)
          .map((t) => t.label)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(", ");

        throw new Error(
          `Unsupported file type: ${primaryFile.type || "unknown"}. ` +
            `Origin SDK only supports: ${supportedList}. ` +
            `For PDFs and other documents, please convert to TXT or use images of pages.`
        );
      }

      // Check file size against type-specific limit
      if (primaryFile.size > fileTypeInfo.maxSize) {
        const maxSizeMB = (fileTypeInfo.maxSize / 1024 / 1024).toFixed(0);
        const actualSizeMB = (primaryFile.size / 1024 / 1024).toFixed(2);
        throw new Error(
          `File too large: ${actualSizeMB}MB. ` +
            `Maximum size for ${fileTypeInfo.label} files is ${maxSizeMB}MB.`
        );
      }

      // Validate royalty bounds (1% - 100%)
      if (royaltyBps < 100 || royaltyBps > 10000) {
        throw new Error(
          "Royalty must be between 1% (100 BPS) and 100% (10000 BPS)"
        );
      }

      console.log("Starting mint process...", {
        fileName: primaryFile.name,
        fileSize: `${(primaryFile.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: primaryFile.type,
        royaltyBps,
      });

      progressCallback?.(10);

      // Convert license price from CAMP to wei (1 CAMP = 10^18 wei)
      const priceInCamp = licensePriceCamp || 0.001;
      const priceInWei = BigInt(Math.floor(priceInCamp * 1e18));

      // Convert duration from days to seconds
      const durationInDays = licenseDurationDays || 1;
      const durationInSeconds = durationInDays * 86400; // 86400 seconds in a day

      console.log("License terms:", {
        priceInCamp,
        priceInWei: priceInWei.toString(),
        durationInDays,
        durationInSeconds,
        royaltyBps,
      });

      // Create license terms for Origin SDK
      const license = createLicenseTerms(
        priceInWei, // Price in wei
        durationInSeconds, // Duration in seconds
        royaltyBps, // Royalty in basis points
        zeroAddress // Native currency (CAMP)
      );

      progressCallback?.(30);

      // Prepare enhanced metadata with file information
      // Origin SDK requires specific metadata structure
      const enhancedMetadata = {
        name: metadata.name,
        description: metadata.description,
        ...(metadata.image && { image: metadata.image }), // Only include if provided
        attributes: [
          ...metadata.attributes,
          { trait_type: "File Count", value: files.length },
          { trait_type: "Primary File", value: files[0].name },
          { trait_type: "File Type", value: primaryFile.type },
        ],
      };

      

      progressCallback?.(50);

      // Comprehensive wallet verification before minting
      if (typeof window !== "undefined") {
        const ethereum = (window as any).ethereum;
        if (ethereum) {
          try {
            // Check current wallet accounts
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) {
              throw new Error(
                "Wallet disconnected. Please reconnect your wallet and try again."
              );
            }
            
            const currentAccount = accounts[0].toLowerCase();
            console.log("✓ Current wallet account:", currentAccount);
            
            // Verify it matches the authenticated account
            if (walletAddress && walletAddress.toLowerCase() !== currentAccount) {
              console.error("❌ Account mismatch!", {
                authenticated: walletAddress.toLowerCase(),
                current: currentAccount
              });
              throw new Error(
                `Wallet account mismatch. You authenticated with ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} but your wallet is now using ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}. Please switch back to the correct account or reconnect.`
              );
            }
            
            // Check if multiple providers exist
            if (ethereum.providers && ethereum.providers.length > 1) {
              console.warn("⚠️ Multiple wallet providers detected. This may cause signature issues.");
              console.warn("Providers:", ethereum.providers.map((p: any) => 
                p.isMetaMask ? "MetaMask" : p.isTrust ? "Trust" : "Other"
              ));
            }
            
            console.log("✓ Wallet verification passed");
          } catch (walletError) {
            console.error("Wallet verification failed:", walletError);
            if (walletError instanceof Error && walletError.message.includes("mismatch")) {
              throw walletError; // Re-throw our custom error
            }
            throw new Error(
              "Could not verify wallet connection. Please reconnect your wallet."
            );
          }
        }
      }

      console.log("Calling Origin SDK mintFile with:", {
        file: {
          name: primaryFile.name,
          type: primaryFile.type,
          size: primaryFile.size,
        },
        metadata: enhancedMetadata,
        license: {
          price: license.price.toString(),
          duration: license.duration,
          royaltyBps: license.royaltyBps,
          paymentToken: license.paymentToken,
        },
        parents: undefined,
      });

      // Mint via Origin SDK - it handles IPFS upload internally
      // Use the first file as the primary file
      let originTokenId: any;
      try {
        originTokenId = await auth.origin.mintFile(
          primaryFile,
          enhancedMetadata,
          license,
          undefined, // No parents (unless using baseParentId in CampProvider)
          {
            progressCallback: (progress) => {
              console.log(`Upload progress: ${progress}%`);
              // Map Origin SDK progress (0-100) to our progress (50-100)
              progressCallback?.(50 + progress * 0.5);
            },
          }
        );
      } catch (mintError: any) {
        console.error("❌ mintFile failed:", mintError);
        console.error("Error details:", {
          message: mintError.message,
          stack: mintError.stack,
          response: mintError.response,
        });
        throw mintError;
      }

      if (!originTokenId) {
        throw new Error("Failed to mint thesis - no token ID returned");
      }

      console.log("Mint successful! Token ID:", originTokenId);

      // Track the minted IPNFT in MongoDB
      console.log("📝 Tracking IPNFT in MongoDB...", {
        tokenId: originTokenId,
        owner: walletAddress,
        metadata: enhancedMetadata,
      });

      try {
        // Extract metadata for MongoDB
        const university = enhancedMetadata.attributes.find(a => a.trait_type === 'University')?.value || 'Unknown'
        const department = enhancedMetadata.attributes.find(a => a.trait_type === 'Department')?.value || ''
        const year = parseInt(String(enhancedMetadata.attributes.find(a => a.trait_type === 'Year')?.value || new Date().getFullYear()))
        const author = enhancedMetadata.attributes.find(a => a.trait_type === 'Author')?.value || ''
        
        const mintedAt = Date.now()
        const mintedTimestamp = new Date(mintedAt).toISOString()

        // Save to MongoDB via API
        const response = await fetch('/api/theses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenId: originTokenId,
            owner: walletAddress.toLowerCase(),
            author: String(author),
            authorWallet: walletAddress.toLowerCase(),
            name: enhancedMetadata.name,
            description: enhancedMetadata.description,
            university: String(university),
            department: String(department),
            year,
            royaltyBps,
            imageUrl: metadata.image || '',
            ipfsHash: metadata.image?.replace('ipfs://', '') || '',
            fileName: primaryFile.name,
            fileType: primaryFile.type,
            fileSize: primaryFile.size,
            forks: 0,
            parentTokenId: '',
            mintedAt,
            mintedTimestamp,
            updatedAt: Date.now(),
            isDeleted: false
          })
        })

        if (!response.ok) {
          throw new Error('Failed to save thesis to database')
        }

        console.log("✅ IPNFT successfully tracked in MongoDB");
        toast.success("Thesis saved to database!", {
          description: "Your thesis is now available in your dashboard",
        });
      } catch (trackError) {
        console.error("❌ Failed to track IPNFT in MongoDB:", trackError);
        toast.error("Failed to save to database", {
          description: "Your thesis was minted but not saved to the database",
        });
      }

      progressCallback?.(100);

      toast.success("Thesis minted successfully!", {
        description: `Token ID: ${originTokenId}`,
      });

      return originTokenId;
    } catch (error) {
      console.error("Error minting thesis:", error);

      // Log detailed error information
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }

      // Provide more specific error messages
      let errorMessage = "Unknown error occurred";
      let errorDescription = "";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Check for common error patterns
        if (
          errorMessage.includes("Failed to get signature") ||
          errorMessage.includes("Failed to register")
        ) {
          errorMessage = "Origin SDK Authentication Error";
          errorDescription =
            "This is a known issue with the Origin SDK. Please try: 1) Refresh the page, 2) Disconnect and reconnect your wallet, 3) If issue persists, use https://origin.camp.network to mint directly.";
        } else if (
          errorMessage.includes("HTTP 400") ||
          errorMessage.includes("Failed to generate upload URL")
        ) {
          errorMessage = "Authentication error";
          errorDescription =
            "Your session may have expired. Please disconnect and reconnect your wallet.";
        } else if (errorMessage.includes("Not authenticated")) {
          errorDescription = "Please connect your wallet to mint a thesis.";
        } else if (errorMessage.includes("authentication token")) {
          errorDescription = "Please disconnect and reconnect your wallet.";
        } else if (errorMessage.includes("insufficient")) {
          errorDescription =
            "You don't have enough funds to complete this transaction.";
        } else if (
          errorMessage.includes("rejected") ||
          errorMessage.includes("denied")
        ) {
          errorMessage = "Transaction cancelled";
          errorDescription = "You rejected the transaction in your wallet.";
        } else if (errorMessage.includes("Wallet not connected")) {
          errorMessage = "Wallet Connection Error";
          errorDescription =
            "Please refresh the page and reconnect your wallet.";
        }
      }

      toast.error(errorMessage, {
        description:
          errorDescription ||
          "Please try again or contact support if the issue persists.",
        duration: 10000,
      });

      throw error;
    }
  };

  return { mintThesis };
}

/**
 * Hook for forking existing theses
 * Uses Origin SDK's built-in IPFS upload and derivative minting
 */
export function useForkThesis(parentTokenId: bigint) {
  const auth = useAuth();

  const forkThesis = async (
    newFiles: File[],
    metadata: Omit<ThesisMetadata, "files">,
    royaltyBps: number,
    progressCallback?: (progress: number) => void
  ): Promise<string> => {
    try {
      if (!auth?.origin) {
        throw new Error("Not authenticated with Origin SDK");
      }

      progressCallback?.(10);

      // Create license terms
      const license = createLicenseTerms(
        BigInt("1000000000000000"),
        86400,
        royaltyBps,
        zeroAddress
      );

      progressCallback?.(30);

      // Prepare enhanced metadata
      const enhancedMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        attributes: [
          ...metadata.attributes,
          { trait_type: "Fork", value: "true" },
          { trait_type: "Parent Token", value: parentTokenId.toString() },
          { trait_type: "File Count", value: newFiles.length },
        ],
      };

      progressCallback?.(50);

      // Mint as derivative via Origin SDK
      const parents: bigint[] = [parentTokenId];
      const originTokenId = await auth.origin.mintFile(
        newFiles[0],
        enhancedMetadata,
        license,
        parents, // Set parent for derivative relationship
        {
          progressCallback: (progress) => {
            // Map Origin SDK progress (0-100) to our progress (50-100)
            progressCallback?.(50 + progress * 0.5);
          },
        }
      );

      if (!originTokenId) {
        throw new Error("Failed to fork thesis - no token ID returned");
      }

      // Track the fork event in MongoDB
      try {
        // Get wallet address
        let forkerAddress = "";
        const jwt = auth.origin.getJwt();
        if (jwt) {
          const payload = JSON.parse(atob(jwt.split(".")[1]));
          forkerAddress = payload.address || "";
        }

        // Extract metadata for MongoDB
        const university = enhancedMetadata.attributes.find(a => a.trait_type === 'University')?.value || 'Unknown'
        const department = enhancedMetadata.attributes.find(a => a.trait_type === 'Department')?.value || ''
        const year = parseInt(String(enhancedMetadata.attributes.find(a => a.trait_type === 'Year')?.value || new Date().getFullYear()))
        const author = enhancedMetadata.attributes.find(a => a.trait_type === 'Author')?.value || ''
        
        const mintedAt = Date.now()
        const mintedTimestamp = new Date(mintedAt).toISOString()

        // Save forked thesis to MongoDB
        await fetch('/api/theses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenId: originTokenId,
            owner: forkerAddress.toLowerCase(),
            author: String(author),
            authorWallet: forkerAddress.toLowerCase(),
            name: enhancedMetadata.name,
            description: enhancedMetadata.description,
            university: String(university),
            department: String(department),
            year,
            royaltyBps,
            imageUrl: enhancedMetadata.image || '',
            ipfsHash: enhancedMetadata.image?.replace('ipfs://', '') || '',
            fileName: newFiles[0].name,
            fileType: newFiles[0].type,
            fileSize: newFiles[0].size,
            forks: 0,
            parentTokenId: parentTokenId.toString(),
            mintedAt,
            mintedTimestamp,
            updatedAt: Date.now(),
            isDeleted: false
          })
        })

        // Increment parent's fork count
        await fetch('/api/theses', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenId: parentTokenId.toString(),
            updates: { $inc: { forks: 1 } }
          })
        })

        console.log("✓ Fork tracked in MongoDB");
      } catch (trackError) {
        console.error("Failed to track fork in MongoDB:", trackError);
      }

      progressCallback?.(100);

      toast.success("Thesis forked successfully!", {
        description: "Your derivative work has been created",
      });

      return originTokenId;
    } catch (error) {
      console.error("Error forking thesis:", error);

      if (error instanceof Error && error.message.includes("insufficient")) {
        toast.error("Insufficient balance", {
          description: "You need more funds to fork this thesis",
        });
      } else {
        toast.error("Failed to fork thesis", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }

      throw error;
    }
  };

  return {
    forkThesis,
    usdcBalance: BigInt(0), // Placeholder - would need to implement balance checking
    parentTerms: null, // Placeholder - would need to fetch parent terms
  };
}

/**
 * Hook for fetching thesis data via Origin SDK
 */
export function useGetThesis(tokenId: bigint) {
  const auth = useAuth();

  const getThesis = async () => {
    if (!auth?.origin) {
      throw new Error("Not authenticated with Origin SDK");
    }

    try {
      // Fetch thesis data using Origin SDK methods
      const terms = await auth.origin.getTerms(tokenId);
      const tokenURI = await auth.origin.tokenURI(tokenId);
      const owner = await auth.origin.ownerOf(tokenId);

      return {
        terms,
        tokenURI,
        owner,
      };
    } catch (error) {
      console.error("Error fetching thesis:", error);
      throw error;
    }
  };

  return {
    getThesis,
  };
}

/**
 * Hook for fetching user earnings via Origin SDK
 * Note: getRoyalties requires at least a token parameter
 */
export function useGetEarnings(tokenId: bigint, walletAddress?: string) {
  const auth = useAuth();

  const getEarnings = async () => {
    if (!auth?.origin) {
      throw new Error("Not authenticated with Origin SDK");
    }

    try {
      // Fetch royalties using Origin SDK
      // getRoyalties expects (token: bigint, owner?: Address)
      const royalties = await auth.origin.getRoyalties(
        tokenId,
        walletAddress as `0x${string}` | undefined
      );

      return {
        pendingRoyalties: royalties?.balance || BigInt(0),
        vaultAddress:
          (royalties as any)?.royaltyVault || (royalties as any)?.vault,
      };
    } catch (error) {
      console.error("Error fetching earnings:", error);
      return {
        pendingRoyalties: BigInt(0),
        vaultAddress: undefined,
      };
    }
  };

  return {
    getEarnings,
  };
}

/**
 * Hook for claiming royalties via Origin SDK
 * Note: claimRoyalties requires at least a token parameter
 */
export function useClaimRoyalties(tokenId: bigint, walletAddress?: string) {
  const auth = useAuth();

  const claimRoyalties = async () => {
    if (!auth?.origin) {
      throw new Error("Not authenticated with Origin SDK");
    }

    try {
      // claimRoyalties expects (token: bigint, owner?: Address, recipient?: Address)
      await auth.origin.claimRoyalties(
        tokenId,
        walletAddress as `0x${string}` | undefined
      );
      toast.success("Royalties claimed successfully!");
    } catch (error) {
      console.error("Error claiming royalties:", error);
      toast.error("Failed to claim royalties", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  };

  return {
    claimRoyalties,
  };
}

/**
 * Component to fix Origin SDK provider detection issues
 * Works without wagmi - uses window.ethereum directly
 * 
 * Usage: Render this component inside CampProvider
 */
export function FixOriginProvider() {
  const { setProvider } = useProvider();
  const auth = useAuth();

  // Set the provider on mount
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const ethereum = (window as any).ethereum;
    
    // Handle multiple providers (MetaMask, Coinbase, etc.)
    let selectedProvider = ethereum;
    
    if (ethereum.providers && Array.isArray(ethereum.providers)) {
      console.log("🔍 Multiple wallet providers detected:", ethereum.providers.length);
      
      // Prefer MetaMask if available (exclude Brave and Coinbase)
      const metaMask = ethereum.providers.find((p: any) => 
        p.isMetaMask && !p.isBraveWallet && !p.isCoinbaseWallet
      );
      
      if (metaMask) {
        selectedProvider = metaMask;
        console.log("✓ Selected MetaMask as provider");
      } else {
        selectedProvider = ethereum.providers[0];
        console.log("✓ Selected first available provider");
      }
    }

    // Set the provider for Origin SDK
    const providerName = selectedProvider.isMetaMask ? "MetaMask" 
      : selectedProvider.isCoinbaseWallet ? "Coinbase Wallet"
      : selectedProvider.isTrust ? "Trust Wallet"
      : "Wallet";

    console.log("✓ Setting Origin provider to:", providerName);
    
    setProvider({
      provider: selectedProvider,
      info: { 
        name: providerName,
        icon: '',
        uuid: providerName.toLowerCase().replace(/\s+/g, '-'),
        rdns: providerName.toLowerCase().replace(/\s+/g, '-')
      },
    });
  }, [setProvider]);

  // Auto-reconnect Origin when wallet account changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log("👛 Wallet accounts changed:", accounts);
      
      if (accounts.length === 0) {
        console.log("❌ No accounts, disconnecting Origin...");
        auth?.disconnect();
      } else {
        // Get current authenticated address from JWT
        try {
          const jwt = auth?.origin?.getJwt();
          if (jwt) {
            const payload = JSON.parse(atob(jwt.split(".")[1]));
            const authenticatedAddress = payload.address?.toLowerCase();
            const currentAddress = accounts[0].toLowerCase();
            
            if (authenticatedAddress && authenticatedAddress !== currentAddress) {
              console.log("⚠️ Account mismatch detected!");
              console.log("  Authenticated:", authenticatedAddress);
              console.log("  Current:", currentAddress);
              console.log("🔄 Reconnecting Origin...");
              
              auth?.disconnect();
              setTimeout(() => {
                console.log("🔌 Attempting to reconnect with new account...");
                auth?.connect();
              }, 500);
            }
          }
        } catch (err) {
          console.warn("Could not verify account match:", err);
        }
      }
    };

    const ethereum = (window as any).ethereum;
    ethereum?.on?.("accountsChanged", handleAccountsChanged);

    return () => {
      ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [auth]);

  return null;
}