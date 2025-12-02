"use client";

import { useAuth } from "@campnetwork/origin/react";
import { useEffect } from "react";

/**
 * Hook to prevent wallet provider switching
 * Locks the wallet provider to the one used during authentication
 * Prevents Trust Wallet from hijacking MetaMask transactions
 */
export function useWalletLock() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth?.origin) return;
    if (typeof window === "undefined") return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    // Only needed when multiple providers exist
    if (!ethereum.providers || ethereum.providers.length <= 1) {
      console.log("Single wallet provider - no locking needed");
      return;
    }

    console.log("🔒 Wallet lock active - monitoring for provider changes");

    // Determine the correct provider
    let correctProvider: any = null;

    // Try to get the authenticated provider from Origin SDK
    const authProvider = (auth as any)?.provider?.provider;
    if (authProvider) {
      correctProvider = authProvider;
    } else {
      // Fallback: prefer MetaMask
      correctProvider = ethereum.providers.find((p: any) => p.isMetaMask);
      if (!correctProvider) {
        correctProvider = ethereum.providers[0];
      }
    }

    // Monitor and re-lock if window.ethereum changes
    const checkInterval = setInterval(() => {
      const currentEthereum = (window as any).ethereum;
      
      // If window.ethereum has been replaced, restore it
      if (currentEthereum !== correctProvider) {
        console.warn("⚠️ Wallet provider override detected - restoring correct provider");
        
        // Restore the correct provider
        (window as any).ethereum = correctProvider;
        
        // Also update Origin SDK's client
        try {
          import("viem").then(({ createWalletClient, custom }) => {
            import("@campnetwork/origin").then(({ campTestnet }) => {
              correctProvider.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
                if (accounts && accounts.length > 0) {
                  const walletClient = createWalletClient({
                    chain: campTestnet,
                    transport: custom(correctProvider),
                    account: accounts[0] as `0x${string}`,
                  });
                  
                  if (auth.origin) {
                    auth.origin.setViemClient(walletClient);
                    console.log("✅ Wallet client restored");
                  }
                }
              });
            });
          });
        } catch (err) {
          console.error("Failed to restore wallet client:", err);
        }
      }
    }, 2000); // Check every 2 seconds

    return () => {
      clearInterval(checkInterval);
      console.log("🔓 Wallet lock deactivated");
    };
  }, [auth]);
}
