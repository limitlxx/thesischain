"use client";

import { useAuth } from "@campnetwork/origin/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function TestOriginSigning() {
  const auth = useAuth();

  const testSigning = async () => {
    try {
      if (!auth?.origin) {
        toast.error("Not authenticated");
        return;
      }

      console.log("Testing Origin SDK signing capability...");

      // Test 1: Check JWT
      const jwt = auth.origin.getJwt();
      console.log("✓ JWT exists:", !!jwt);

      if (jwt) {
        const payload = JSON.parse(atob(jwt.split(".")[1]));
        console.log("JWT payload:", payload);
      }

      // Test 2: Check if wallet can sign directly
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        console.log("Wallet accounts:", accounts);

        if (accounts && accounts.length > 0) {
          try {
            const signature = await window.ethereum.request({
              method: "personal_sign",
              params: ["Test message from Origin", accounts[0]],
            });
            console.log("✓ Wallet CAN sign:", signature);
            toast.success("Wallet can sign!", {
              description: "The wallet extension is working correctly",
            });
          } catch (signError) {
            console.error("✗ Wallet CANNOT sign:", signError);
            toast.error("Wallet cannot sign", {
              description: "Your wallet extension may have an issue",
            });
          }
        }
      }

      // Test 3: Try a simple Origin SDK operation
      try {
        // Try to get terms for a known token (this doesn't require signing)
        const terms = await auth.origin.getTerms(BigInt(1));
        console.log("✓ Origin SDK can read blockchain:", terms);
        toast.success("Origin SDK connected!", {
          description: "Can read from blockchain",
        });
      } catch (readError) {
        console.error("✗ Origin SDK read failed:", readError);
      }

    } catch (error) {
      console.error("Test failed:", error);
      toast.error("Test failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-2">
      <h3 className="font-semibold">Origin SDK Signing Test</h3>
      <p className="text-sm text-muted-foreground">
        Test if Origin SDK can sign transactions
      </p>
      <Button onClick={testSigning} variant="outline">
        Run Signing Test
      </Button>
    </div>
  );
}
