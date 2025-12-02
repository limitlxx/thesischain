"use client";

import { useAuth, useAuthState } from "@campnetwork/origin/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export function WalletDiagnostic() {
  const auth = useAuth();
  const { authenticated } = useAuthState();
  const [diagnostics, setDiagnostics] = useState({
    hasAuth: false,
    hasJWT: false,
    jwtExpired: false,
    jwtExpiresAt: "",
    walletAddress: "",
    hasWalletAccounts: false,
    multipleProviders: false,
    providerCount: 0,
    providerTypes: [] as string[],
  });

  const runDiagnostics = async () => {
    const results = {
      hasAuth: !!auth?.origin,
      hasJWT: false,
      jwtExpired: false,
      jwtExpiresAt: "",
      walletAddress: "",
      hasWalletAccounts: false,
      multipleProviders: false,
      providerCount: 0,
      providerTypes: [] as string[],
    };

    // Check JWT
    if (auth?.origin) {
      try {
        const jwt = auth.origin.getJwt();
        results.hasJWT = !!jwt;

        if (jwt) {
          const payload = JSON.parse(atob(jwt.split(".")[1]));
          results.jwtExpired = Date.now() > payload.exp * 1000;
          results.jwtExpiresAt = new Date(payload.exp * 1000).toLocaleString();
          results.walletAddress = payload.address || "";
        }
      } catch (error) {
        console.error("JWT check failed:", error);
      }
    }

    // Check wallet connection
    if (typeof window !== "undefined") {
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        try {
          const accounts = await ethereum.request({ method: "eth_accounts" });
          results.hasWalletAccounts = accounts && accounts.length > 0;

          // Check for multiple providers
          if (ethereum.providers && Array.isArray(ethereum.providers)) {
            results.multipleProviders = ethereum.providers.length > 1;
            results.providerCount = ethereum.providers.length;
            results.providerTypes = ethereum.providers.map((p: any) =>
              p.isMetaMask ? "MetaMask" : p.isTrust ? "Trust Wallet" : p.isCoinbaseWallet ? "Coinbase" : "Unknown"
            );
          } else {
            results.providerCount = 1;
            results.providerTypes = [
              ethereum.isMetaMask ? "MetaMask" : ethereum.isTrust ? "Trust Wallet" : "Unknown",
            ];
          }
        } catch (error) {
          console.error("Wallet check failed:", error);
        }
      }
    }

    setDiagnostics(results);
  };

  useEffect(() => {
    runDiagnostics();
  }, [auth, authenticated]);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Wallet Connection Diagnostics</CardTitle>
            <CardDescription>Check your wallet and authentication status</CardDescription>
          </div>
          <Button onClick={runDiagnostics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authentication Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Origin SDK Initialized</span>
          {getStatusIcon(diagnostics.hasAuth)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Authenticated</span>
          {getStatusIcon(authenticated)}
        </div>

        {/* JWT Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">JWT Token Present</span>
          {getStatusIcon(diagnostics.hasJWT)}
        </div>

        {diagnostics.hasJWT && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">JWT Token Valid</span>
              {getStatusIcon(!diagnostics.jwtExpired)}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Token Expires</span>
              <span className="text-xs text-muted-foreground">{diagnostics.jwtExpiresAt}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Wallet Address</span>
              <span className="text-xs font-mono text-muted-foreground">
                {diagnostics.walletAddress || "Not found"}
              </span>
            </div>
          </>
        )}

        {/* Wallet Connection */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Wallet Connected</span>
          {getStatusIcon(diagnostics.hasWalletAccounts)}
        </div>

        {/* Provider Info */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Wallet Providers</span>
          <div className="flex items-center gap-2">
            <Badge variant={diagnostics.multipleProviders ? "destructive" : "default"}>
              {diagnostics.providerCount} provider{diagnostics.providerCount !== 1 ? "s" : ""}
            </Badge>
            {diagnostics.multipleProviders && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>Multiple wallets may cause issues</span>
              </div>
            )}
          </div>
          {diagnostics.providerTypes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {diagnostics.providerTypes.map((type, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Overall Status */}
        <div className="pt-4 border-t">
          {authenticated && diagnostics.hasJWT && !diagnostics.jwtExpired && diagnostics.hasWalletAccounts ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Ready to mint!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                {!authenticated
                  ? "Please connect your wallet"
                  : diagnostics.jwtExpired
                  ? "Token expired - please reconnect"
                  : !diagnostics.hasWalletAccounts
                  ? "No wallet accounts found"
                  : "Authentication issue detected"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
