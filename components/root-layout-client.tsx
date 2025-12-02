"use client"

import { ThemeProvider } from "next-themes"
import React, { type ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import { CampProvider } from "@campnetwork/origin/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthRedirect } from "@/components/auth-redirect"
import { FixOriginProvider } from "@/lib/camp"

const queryClient = new QueryClient()

function WalletProviderFix({ children }: { children: ReactNode }) {
  // Fix window.ethereum to use MetaMask when multiple providers exist
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    
    const ethereum = (window as any).ethereum;
    if (ethereum?.providers && Array.isArray(ethereum.providers) && ethereum.providers.length > 1) {
      console.log("🔧 Fixing multiple wallet providers...");
      
      // Find MetaMask (exclude Brave and Coinbase)
      const metaMask = ethereum.providers.find((p: any) => 
        p.isMetaMask && !p.isBraveWallet && !p.isCoinbaseWallet
      );
      
      if (metaMask) {
        console.log("✓ Setting window.ethereum to MetaMask");
        (window as any).ethereum = metaMask;
      }
    }
  }, []);
  
  return <>{children}</>;
}

export function RootLayoutClient({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_CAMP_CLIENT_ID || ""
  
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <CampProvider
          clientId={clientId}
          environment="DEVELOPMENT"
          redirectUri={typeof window !== "undefined" ? window.location.origin : ""}
        >
          <FixOriginProvider />
          <WalletProviderFix>
            <AuthRedirect />
            {children}
            <Toaster />
          </WalletProviderFix>
        </CampProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
