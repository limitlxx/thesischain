"use client"

import { useState } from "react"
import { useAuth, useAuthState } from "@campnetwork/origin/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMintThesisContract } from "@/lib/thesis-contract"
import { toast } from "sonner"

/**
 * Diagnostic component to test contract interactions
 * This helps verify that the wallet connection and contract calls work properly
 */
export function ContractDiagnostic() {
  const auth = useAuth()
  const { authenticated } = useAuthState()
  const { mintThesis, isPending } = useMintThesisContract()
  const [testResult, setTestResult] = useState<string>("")

  const testContractConnection = async () => {
    setTestResult("Testing...")
    
    try {
      // Check authentication
      if (!authenticated || !auth?.origin) {
        setTestResult("❌ Not authenticated with Origin SDK")
        return
      }

      // Check wallet provider
      if (typeof window === "undefined" || !window.ethereum) {
        setTestResult("❌ No wallet provider found (window.ethereum)")
        return
      }

      // Try to get wallet address
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (!accounts || accounts.length === 0) {
        setTestResult("❌ No wallet accounts found")
        return
      }

      setTestResult(`✅ Connected! Wallet: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
      toast.success("Contract connection test passed!")
    } catch (error) {
      console.error("Contract test error:", error)
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      toast.error("Contract connection test failed")
    }
  }

  const testMintCall = async () => {
    try {
      toast.info("Testing mint call...", {
        description: "This will prompt you to sign a transaction"
      })

      // Test with dummy data
      const testUri = "ipfs://QmTest123"
      const testRoyalty = 1000 // 10%

      await mintThesis(testUri, testRoyalty)
      
      toast.success("Mint test successful!")
      setTestResult("✅ Mint transaction completed successfully")
    } catch (error) {
      console.error("Mint test error:", error)
      setTestResult(`❌ Mint failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Contract Integration Diagnostic</CardTitle>
        <CardDescription>
          Test the connection between your wallet and the smart contracts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Authentication Status:</strong> {authenticated ? "✅ Authenticated" : "❌ Not authenticated"}
          </div>
          <div className="text-sm">
            <strong>Origin SDK:</strong> {auth?.origin ? "✅ Available" : "❌ Not available"}
          </div>
          <div className="text-sm">
            <strong>Wallet Provider:</strong> {typeof window !== "undefined" && window.ethereum ? "✅ Detected" : "❌ Not detected"}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={testContractConnection}
            disabled={!authenticated}
            variant="outline"
          >
            Test Connection
          </Button>
          <Button 
            onClick={testMintCall}
            disabled={!authenticated || isPending}
            variant="default"
          >
            {isPending ? "Testing..." : "Test Mint (Testnet)"}
          </Button>
        </div>

        {testResult && (
          <div className="p-4 bg-muted rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>Note: The "Test Mint" button will create a real transaction on the testnet.</p>
          <p>Make sure you have testnet ETH in your wallet.</p>
        </div>
      </CardContent>
    </Card>
  )
}
