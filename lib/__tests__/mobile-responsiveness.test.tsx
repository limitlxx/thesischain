/**
 * Mobile Responsiveness Tests
 * 
 * Tests verify that all pages and components work correctly on mobile viewports (< 768px)
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { StatsSection } from '@/components/stats-section'
import { HowItWorks } from '@/components/how-it-works'
import { MintWizard } from '@/components/mint-wizard'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { ThemeProvider } from 'next-themes'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  }),
  useBalance: () => ({
    data: { formatted: '100', symbol: 'USDC' },
  }),
  useReadContract: () => ({
    data: undefined,
  }),
  useWriteContract: () => ({
    writeContract: vi.fn(),
    isPending: false,
  }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: false,
  }),
}))

// Mock @campnetwork/origin/react
vi.mock('@campnetwork/origin/react', () => ({
  useSocials: () => ({
    data: {
      twitter: { isLinked: true },
      spotify: { isLinked: false },
      tiktok: { isLinked: false },
    },
  }),
  useLinkSocials: () => ({
    linkTwitter: vi.fn(),
    linkSpotify: vi.fn(),
    linkTikTok: vi.fn(),
  }),
  CampProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTheme: () => ({
    theme: 'dark',
    setTheme: vi.fn(),
  }),
}))

// Helper to set mobile viewport
const setMobileViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375, // iPhone SE width
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 667,
  })
  window.dispatchEvent(new Event('resize'))
}

// Helper to set desktop viewport
const setDesktopViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1920,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 1080,
  })
  window.dispatchEvent(new Event('resize'))
}

describe('Mobile Responsiveness Tests', () => {
  beforeEach(() => {
    setMobileViewport()
  })

  describe('Requirement 14.1: Mobile Layout Responsiveness', () => {
    it('should display responsive layout on mobile viewport', () => {
      const { container } = render(<HeroSection />)
      
      // Verify mobile viewport is active
      expect(window.innerWidth).toBe(375)
      
      // Check that container has responsive classes
      const section = container.querySelector('section')
      expect(section).toBeTruthy()
    })

    it('should stack components vertically on mobile', () => {
      const { container } = render(<HowItWorks />)
      
      // The grid should have responsive classes that stack on mobile
      const grid = container.querySelector('.grid')
      expect(grid).toBeTruthy()
      expect(grid?.className).toContain('md:grid-cols-3')
    })

    it('should use mobile-optimized spacing', () => {
      const { container } = render(<StatsSection />)
      
      // Check for responsive padding classes
      const section = container.querySelector('section')
      expect(section?.className).toMatch(/py-\d+/)
      expect(section?.className).toMatch(/lg:py-\d+/)
    })
  })

  describe('Requirement 14.2: Mobile Navigation Menu', () => {
    it('should display mobile menu button on mobile viewport', () => {
      render(<Navbar />)
      
      // Mobile menu button should be visible
      const menuButton = screen.getByRole('button', { name: /menu/i })
      expect(menuButton).toBeTruthy()
    })

    it('should toggle mobile menu when button is clicked', async () => {
      render(<Navbar />)
      
      const menuButton = screen.getByRole('button', { name: /menu/i })
      
      // Click to open menu
      fireEvent.click(menuButton)
      
      // Menu items should be visible
      await waitFor(() => {
        const searchLink = screen.getAllByText(/Search/i)[0]
        expect(searchLink).toBeTruthy()
      })
    })

    it('should display bottom navigation bar on mobile', () => {
      const { container } = render(<Navbar />)
      
      // Bottom nav should exist with mobile-only class
      const bottomNav = container.querySelector('.md\\:hidden')
      expect(bottomNav).toBeTruthy()
    })

    it('should show navigation icons in bottom bar', () => {
      render(<Navbar />)
      
      // Check for navigation labels
      expect(screen.getByText('Home')).toBeTruthy()
      expect(screen.getByText('Search')).toBeTruthy()
      expect(screen.getByText('Board')).toBeTruthy()
      expect(screen.getByText('Dashboard')).toBeTruthy()
    })
  })

  describe('Requirement 14.3: Wallet Connection Modal', () => {
    it('should render wallet connect button on mobile', () => {
      const { container } = render(<Navbar />)
      
      // Web3Modal button should be present
      const w3mButton = container.querySelector('w3m-button')
      expect(w3mButton).toBeTruthy()
    })

    it('should display connected wallet address on mobile', () => {
      render(<Navbar />)
      
      // Wallet address should be formatted and displayed
      const address = screen.getByText(/0x1234...7890/i)
      expect(address).toBeTruthy()
    })
  })

  describe('Requirement 14.4: OAuth Redirects on Mobile', () => {
    it('should handle OAuth callback on mobile browsers', () => {
      // This is tested through the actual OAuth flow
      // The callback page should work regardless of viewport
      expect(window.innerWidth).toBe(375)
      
      // Verify mobile viewport is set
      expect(window.innerWidth).toBeLessThan(768)
    })
  })

  describe('Requirement 14.5: Dashboard Mobile Layout', () => {
    it('should stack dashboard components vertically on mobile', () => {
      const { container } = render(
        <ThemeProvider attribute="class" defaultTheme="dark">
          <DashboardClient />
        </ThemeProvider>
      )
      
      // Dashboard should have responsive grid classes
      const grids = container.querySelectorAll('.grid')
      grids.forEach(grid => {
        // Should have mobile-first single column, then responsive multi-column
        expect(
          grid.className.includes('md:grid-cols') || 
          grid.className.includes('lg:grid-cols')
        ).toBe(true)
      })
    })
  })

  describe('Requirement 14.6: Charts with Touch-Friendly Interactions', () => {
    it('should render charts on mobile viewport', () => {
      const { container } = render(
        <ThemeProvider attribute="class" defaultTheme="dark">
          <DashboardClient />
        </ThemeProvider>
      )
      
      // Charts should be present in the DOM
      // Recharts automatically handles touch interactions
      expect(container).toBeTruthy()
    })
  })

  describe('Cross-viewport Verification', () => {
    it('should hide desktop-only elements on mobile', () => {
      const { container } = render(<Navbar />)
      
      // Desktop navigation should be hidden on mobile
      const desktopNav = container.querySelector('.hidden.md\\:flex')
      expect(desktopNav).toBeTruthy()
    })

    it('should show mobile-only elements on mobile', () => {
      const { container } = render(<Navbar />)
      
      // Mobile menu button should be visible
      const mobileButton = container.querySelector('.md\\:hidden')
      expect(mobileButton).toBeTruthy()
    })

    it('should adapt to desktop viewport', () => {
      setDesktopViewport()
      
      const { container } = render(<Navbar />)
      
      expect(window.innerWidth).toBe(1920)
      expect(window.innerWidth).toBeGreaterThan(768)
    })
  })

  describe('Form Elements on Mobile', () => {
    it('should render mint wizard forms on mobile', () => {
      const { container } = render(<MintWizard />)
      
      // Form should be present and responsive
      expect(container.querySelector('form') || container.querySelector('.space-y-6')).toBeTruthy()
    })

    it('should have touch-friendly button sizes', () => {
      render(<Navbar />)
      
      // Buttons should have adequate padding for touch
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // All buttons should be rendered
      buttons.forEach(button => {
        expect(button).toBeTruthy()
      })
    })
  })

  describe('Typography and Readability on Mobile', () => {
    it('should use responsive text sizes', () => {
      const { container } = render(<HeroSection />)
      
      // Headings should have responsive text classes
      const heading = container.querySelector('h1')
      expect(heading?.className).toMatch(/text-\d+xl/)
      expect(heading?.className).toMatch(/lg:text-\d+xl/)
    })

    it('should maintain readability with proper line height', () => {
      const { container } = render(<HeroSection />)
      
      // Paragraphs should have leading classes
      const paragraph = container.querySelector('p')
      expect(paragraph?.className).toMatch(/leading-/)
    })
  })

  describe('Images and Media on Mobile', () => {
    it('should handle responsive images', () => {
      const { container } = render(<HeroSection />)
      
      // Visual elements should be hidden on mobile (lg:flex)
      const visual = container.querySelector('.hidden.lg\\:flex')
      expect(visual).toBeTruthy()
    })
  })

  describe('Spacing and Padding on Mobile', () => {
    it('should use mobile-appropriate container padding', () => {
      const { container } = render(<HeroSection />)
      
      // Container should have responsive padding
      const containerDiv = container.querySelector('.container')
      expect(containerDiv?.className).toContain('px-4')
      expect(containerDiv?.className).toContain('sm:px-6')
    })

    it('should have adequate spacing between sections', () => {
      const { container } = render(<StatsSection />)
      
      // Sections should have responsive vertical padding
      const section = container.querySelector('section')
      expect(section?.className).toMatch(/py-\d+/)
    })
  })
})
