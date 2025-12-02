import Link from "next/link"
import { Mail, Twitter, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-deep to-accent-warm">
                <span className="text-white text-sm font-bold">TC</span>
              </div>
              <span className="bg-gradient-to-r from-accent-deep to-accent-warm bg-clip-text text-transparent">
                ThesisChain
              </span>
            </Link>
            <p className="text-sm text-foreground/60">
              Empowering African researchers through decentralized blockchain collaboration.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Product</h4>
            <div className="space-y-2 text-sm">
              <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                Docs
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Company</h4>
            <div className="space-y-2 text-sm">
              <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                Careers
              </Link>
            </div>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Community</h4>
            <div className="space-y-2 text-sm">
              <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                Discord
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                Forum
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                Research
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Connect</h4>
            <div className="flex gap-4">
              <Link
                href="https://twitter.com"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-border hover:bg-accent/10 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://github.com"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-border hover:bg-accent/10 transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:hello@thesischain.africa"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-border hover:bg-accent/10 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} ThesisChain Africa. All rights reserved.</p>

          <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-accent-warm/30 bg-accent-warm/5">
            <div className="w-2 h-2 rounded-full bg-accent-warm animate-pulse" />
            <span className="text-xs font-medium text-accent-warm">Built at TechyJaunt × Camp Network Buildathon</span>
          </div>

          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
