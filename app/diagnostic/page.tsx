"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ContractDiagnostic } from "@/components/contract-diagnostic"

export default function DiagnosticPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Contract Diagnostic</h1>
            <p className="text-muted-foreground">
              Test your wallet connection and smart contract integration
            </p>
          </div>
          
          <ContractDiagnostic />

          <div className="bg-muted/50 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold">How to Use</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Make sure you're connected with your wallet (click "Connect" in the navbar)</li>
              <li>Ensure you're on the Basecamp testnet (Chain ID: 123420001114)</li>
              <li>Click "Test Connection" to verify your setup</li>
              <li>Click "Test Mint" to try a real contract interaction (requires testnet ETH)</li>
            </ol>

            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <p className="text-sm font-medium">⚠️ Note</p>
              <p className="text-sm text-muted-foreground mt-1">
                The "Test Mint" button creates a real transaction on the testnet. 
                Make sure you have testnet ETH for gas fees.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
