"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MintOriginPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Mint via Origin SDK</CardTitle>
          <CardDescription>
            Use Origin's built-in minting interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Known Issue:</strong> The Origin SDK's authentication system has a bug that prevents custom minting flows from working reliably. 
              The backend rejects valid JWT tokens with "Failed to get signature" errors.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Recommended Solution</h3>
            <p className="text-muted-foreground">
              Use Origin's official minting interface which handles authentication correctly:
            </p>
            
            <Button asChild className="w-full" size="lg">
              <a 
                href="https://origin.camp.network" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Mint on Origin.camp
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold text-lg">Alternative: Try Custom Mint</h3>
            <p className="text-muted-foreground text-sm">
              You can still try our custom minting flow, but you may encounter authentication errors. 
              If it fails, use the Origin.camp link above.
            </p>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/mint">
                Try Custom Mint (May Fail)
              </Link>
            </Button>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold">What We've Tried</h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>✅ Verified authentication (JWT token exists)</li>
              <li>✅ Verified correct network (Camp Testnet)</li>
              <li>✅ Configured wallet client properly</li>
              <li>✅ Followed all Origin SDK documentation</li>
              <li>❌ Origin backend still rejects the JWT token</li>
            </ul>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-semibold">Technical Details</h3>
            <p className="text-sm text-muted-foreground">
              The Origin SDK backend returns a 400 error: "Failed to register IpNFT: Failed to get signature". 
              This appears to be a bug in how the Origin SDK manages authentication state across page navigations 
              and custom minting flows.
            </p>
            <p className="text-sm text-muted-foreground">
              We've reported this issue to the Origin SDK team. Once fixed, our custom minting flow will work seamlessly.
            </p>
          </div>

          <div className="space-y-2 pt-6 border-t">
            <h3 className="font-semibold text-sm">For Developers</h3>
            <p className="text-xs text-muted-foreground">
              See <code className="bg-muted px-1 py-0.5 rounded">ORIGIN_SDK_AUTH_ISSUE.md</code> for full technical analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
