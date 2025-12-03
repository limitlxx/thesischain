"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuthState, CampModal } from "@campnetwork/origin/react"
import { Menu, X, Moon, Sun, Home, SearchIcon, Trophy, LayoutDashboard, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWalletAddress } from "@/lib/wallet"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { authenticated, loading: authLoading } = useAuthState()
  const address = useWalletAddress()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Handle connect button click
  const handleConnect = () => {
    if (!authenticated) {
      router.push("/auth/signup")
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-deep to-accent-warm">
                <span className="text-white text-sm font-bold">TC</span>
              </div> */}
              <span className="bg-gradient-to-r from-accent-deep to-accent-warm bg-clip-text text-transparent">
                ThesisChain.Africa
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                Home
              </Link>
              <Link
                href="/search"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Search
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Leaderboard
              </Link>
              {authenticated && (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Authentication Status */}
              {authenticated ? (
                <>
                  {/* Wallet Info Display */}
                  {address && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-deep/10 border border-accent-deep/20">
                      <div className="h-2 w-2 rounded-full bg-accent-deep animate-pulse" />
                      <span className="text-xs font-mono text-foreground/80">{formatAddress(address)}</span>
                    </div>
                  )}

                  {/* Camp Modal for profile management */}
                  <div className="hidden sm:block">
                    <CampModal />
                  </div>
                </>
              ) : (
                <>
                  {/* Connect Button - redirects to signup page */}
                  <Button
                    onClick={handleConnect}
                    disabled={authLoading}
                    className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-accent-deep to-accent-warm hover:opacity-90 transition-opacity"
                  >
                    <LogIn className="h-4 w-4" />
                    Connect
                  </Button>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden border-t border-border/40 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
              <Link href="/" className="block text-sm font-medium text-foreground/70 hover:text-foreground px-2 py-2">
                Home
              </Link>
              <Link
                href="/search"
                className="block text-sm font-medium text-foreground/70 hover:text-foreground px-2 py-2"
              >
                Search
              </Link>
              <Link
                href="/leaderboard"
                className="block text-sm font-medium text-foreground/70 hover:text-foreground px-2 py-2"
              >
                Leaderboard
              </Link>
              {authenticated && (
                <Link
                  href="/dashboard"
                  className="block text-sm font-medium text-foreground/70 hover:text-foreground px-2 py-2"
                >
                  Dashboard
                </Link>
              )}

              {/* Wallet info in mobile menu */}
              {authenticated && address && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-deep/10 border border-accent-deep/20 text-xs font-mono text-foreground/80">
                  <div className="h-2 w-2 rounded-full bg-accent-deep animate-pulse" />
                  {formatAddress(address)}
                </div>
              )}

              {/* Camp Modal in mobile menu when authenticated */}
              {authenticated && (
                <div className="px-2">
                  <CampModal />
                </div>
              )}

              {/* Connect button in mobile menu when not authenticated */}
              {!authenticated && (
                <Button
                  onClick={handleConnect}
                  disabled={authLoading}
                  className="w-full mx-2 bg-gradient-to-r from-accent-deep to-accent-warm hover:opacity-90 transition-opacity"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-around">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link
            href="/search"
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <SearchIcon className="h-5 w-5" />
            <span className="text-xs">Search</span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
          >
            <Trophy className="h-5 w-5" />
            <span className="text-xs">Board</span>
          </Link>
          {authenticated && (
            <Link
              href="/dashboard"
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-xs">Dashboard</span>
            </Link>
          )}
        </div>
      </div>

      <div className="md:hidden h-16" />
    </>
  )
}
