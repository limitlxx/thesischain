import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { RootLayoutClient } from "@/components/root-layout-client"
// import { useLockWalletProvider } from "@/hooks/useCorrectProvider"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ThesisChain Africa - Decentralized Research Network",
  description:
    "Empowering African researchers and developers through blockchain-based thesis collaboration on Camp Network",
  keywords: ["blockchain", "research", "Africa", "Web3", "Camp Network"],
  generator: "elgravicodesh@gmail.com",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/thesischain_logo.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
    ],
    apple: "/thesischain_logo.jpg",
    other: [
      {
        rel: "manifest",
        url: "/site.webmanifest",
      },
    ],
  },
  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // useLockWalletProvider();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${geistMono.className} font-sans antialiased`}>
        <RootLayoutClient>{children}</RootLayoutClient>
        <Analytics />
      </body>
    </html>
  )
}
