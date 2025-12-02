### Kiro Spec for Integrations:

```
# ThesisChain Integrations Spec: Social Auth, User Management, and Activity Sharing

## Project Context
This spec extends the core ThesisChain spec (minting/forking theses as IPNFTs on Camp Basecamp testnet). Import existing Next.js frontend (from v0.dev) with pages: / (landing), /mint (wizard), /dashboard, /thesis/[id] (detail + fork), /search, /leaderboard.  
Goal: Add social authentication (Twitter/X, Spotify, TikTok) via Origin SDK for easy signup, user activity management (track mints/forks/shares), and one-click sharing to boost virality. Social links create "Thesis Profile IP" on signup, with royalties on shared activities. Deploy to Camp Basecamp testnet (Chain ID: 123420001114).  
Enhances UX for African students: Prefer Twitter signup → auto-mint profile → share thesis on X → earn from viral forks.

## Tech Additions
- Auth: Origin SDK Auth class + React hooks (useAuth, useSocials, useLinkSocials, useConnect).
- Components: CampProvider (testnet env), CampModal/LinkButton (UI for linking).
- Sharing: mintSocial (derivative IP from shares) + X API (axios for posting tweets).
- Libs: @campnetwork/origin (full), viem (RPC), wagmi (hooks), axios (X API), @tanstack/react-query (caching socials/activities).
- USDC: Reuse testnet addr 0x977fdEF62CE095Ae8750Fd3496730F24F60dea7a for share royalties.
- Indexer: Camp Data Indexer GraphQL for activity queries (user's IPNFTs: mints, forks, shares).

## Key Integrations (Generate These Files/Tasks)

### 1. Global Auth Wrapper (/app/layout.tsx)
- Wrap entire app with CampProvider for Origin Auth context.
- Use environment="DEVELOPMENT" (Basecamp testnet), clientId from env.
- Optional: baseParentId="0x0" (all user mints as derivatives for revenue sharing).
- Code Snippet to Generate:
  ```tsx
  // app/layout.tsx
  import { CampProvider } from "@campnetwork/origin/react";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

  const queryClient = new QueryClient();

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>
          <QueryClientProvider client={queryClient}>
            <CampProvider
              clientId={process.env.NEXT_PUBLIC_CAMP_CLIENT_ID!} // From Camp Discord/app setup
              environment="DEVELOPMENT" // Basecamp testnet (Chain ID: 123420001114)
              baseParentId={BigInt(0)} // Optional: Base for all user IPNFTs
            >
              {children}
            </CampProvider>
          </QueryClientProvider>
        </body>
      </html>
    );
  }
  ```
- Tasks: Update existing layout; add env validation (error toast if missing clientId).

### 2. Social Signup/Signin Page (/app/auth/signup/page.tsx)
- New page for low-barrier entry: Social buttons (Twitter/X first, Spotify, TikTok) + wallet fallback.
- Flow: Connect wallet → OAuth redirect for social link → Auto-mint "Thesis Profile IP" via mintSocial → Redirect to /dashboard.
- Include university selector (dropdown: UNILAG, Makerere, etc.) in metadata.
- Use useLinkSocials for linking, useConnect for wallet, createLicenseTerms(0n, 0, 0, "CAMP") for free profile mint.
- UI: African-themed (blues/greens, kente accents); v0.dev prompt integration: "Social signup page with OAuth buttons using Origin SDK hooks."
- Code Snippet to Generate:
  ```tsx
  // app/auth/signup/page.tsx
  "use client";
  import { useAuth, useConnect, useLinkSocials } from "@campnetwork/origin/react";
  import { CampButton, LinkButton } from "@campnetwork/origin/react";
  import { useState } from "react";
  import { createLicenseTerms } from "@campnetwork/origin";

  export default function SignupPage() {
    const { isConnected, connect } = useConnect();
    const { linkTwitter, linkSpotify, linkTikTok } = useLinkSocials();
    const [university, setUniversity] = useState("");

    const handleSocialSignup = async (platform: "twitter" | "spotify" | "tiktok", handle?: string) => {
      if (!isConnected) await connect(); // Wallet sign required first
      let linkFn;
      switch (platform) {
        case "twitter": linkFn = linkTwitter; break;
        case "spotify": linkFn = linkSpotify; break;
        case "tiktok": linkFn = () => linkTikTok(handle || ""); break;
      }
      await linkFn({ redirectUri: `${window.location.origin}/auth/callback` });
      // On success (post-redirect): Auto-mint profile IP
      const { origin } = useAuth();
      const profileMetadata = {
        name: "Thesis Profile",
        description: `Profile for ${university} researcher`,
        attributes: [{ trait_type: "University", value: university }]
      };
      await origin?.mintSocial(platform, profileMetadata, createLicenseTerms(0n, 0, 0, "CAMP")); // Free mint, 0% royalty
      window.location.href = "/dashboard";
    };

    return (
      <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-400 to-green-500 min-h-screen">
        <h1 className="text-4xl font-bold mb-8">Join ThesisChain Africa</h1>
        <select value={university} onChange={(e) => setUniversity(e.target.value)} className="mb-4 p-2 rounded">
          <option value="">Select University</option>
          <option value="UNILAG">University of Lagos (UNILAG)</option>
          <option value="UG">University of Ghana</option>
          <option value="Makerere">Makerere University</option>
          {/* Add 5-10 more African unis */}
        </select>
        <LinkButton social="twitter" onClick={() => handleSocialSignup("twitter")}>Signup with Twitter/X</LinkButton>
        <LinkButton social="spotify" onClick={() => handleSocialSignup("spotify")}>Signup with Spotify</LinkButton>
        <LinkButton social="tiktok" onClick={() => handleSocialSignup("tiktok", "@yourhandle")}>Signup with TikTok</LinkButton>
        <button onClick={connect} className="mt-4 p-2 bg-black text-white rounded">Or Connect Wallet Directly</button>
      </div>
    );
  }
  ```
- Tasks: Generate page; add loading states (useAuthState for { authenticated, loading }); mock OAuth redirects for testing.

### 3. Auth Callback Handler (/app/auth/callback/page.tsx)
- Simple redirect page post-OAuth: Check query params (e.g., ?code=...), confirm link via getLinkedSocials, then to /dashboard.
- Code Snippet to Generate:
  ```tsx
  // app/auth/callback/page.tsx
  "use client";
  import { useEffect } from "react";
  import { useSocials } from "@campnetwork/origin/react";

  export default function CallbackPage() {
    const { data: socials } = useSocials();

    useEffect(() => {
      if (socials && Object.values(socials).some(Boolean)) {
        window.location.href = "/dashboard";
      }
    }, [socials]);

    return <div>Linking your social account... Redirecting to dashboard.</div>;
  }
  ```
- Tasks: Handle errors (e.g., unlink on fail); toast "Social linked successfully!".

### 4. User Activity Management in Dashboard (/app/dashboard/page.tsx)
- Update existing dashboard: Add "Profile & Socials" section (linked accounts via useSocials) + "Activity Feed" (mints/forks/shares via GraphQL query on user's IPNFTs).
- Show earnings from activities (e.g., "Earned 0.50 USDC from share fork").
- Include unlink buttons (useLinkSocials).
- v0.dev prompt update: "Add social links grid and activity list to dashboard with Origin hooks."
- Code Snippet to Generate (Add to existing dashboard):
  ```tsx
  // app/dashboard/page.tsx (extension)
  "use client";
  import { useSocials, useLinkSocials, useAuthState } from "@campnetwork/origin/react";
  import { useQuery } from "@tanstack/react-query"; // For activity fetch

  // Inside Dashboard component:
  const { data: socials, isLoading: socialsLoading } = useSocials(); // { twitter: true/false, ... }
  const { unlinkTwitter, unlinkSpotify, unlinkTikTok } = useLinkSocials();
  const { user } = useAuthState(); // Includes wallet address

  // Query activities (mock GraphQL for now; hook to Camp indexer)
  const { data: activities } = useQuery({
    queryKey: ["userActivities", user?.address],
    queryFn: async () => [
      { id: "1", type: "Minted", metadata: { name: "AI Thesis" }, royalties: "0.20 USDC" },
      { id: "2", type: "Shared on X", metadata: { name: "Thesis Share" }, royalties: "0.10 USDC" },
      // Real: Fetch via origin.getTerms or subgraph
    ]
  });

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <section>
        <h2>Your Profile & Socials</h2>
        {socialsLoading ? <p>Loading...</p> : (
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(socials).map(([platform, linked]) => (
              <div key={platform} className="border p-4 rounded">
                <strong>{platform.toUpperCase()}:</strong> {linked ? "Linked" : "Not Linked"}
                {linked && <button onClick={() => platform === "twitter" ? unlinkTwitter() : /* etc */} className="ml-2 text-red-500">Unlink</button>}
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <h3>Recent Activities</h3>
        <ul className="space-y-2">
          {activities?.map((act) => (
            <li key={act.id} className="border p-2">{act.type}: {act.metadata.name} (Earned: {act.royalties})</li>
          ))}
        </ul>
      </section>
    </div>
  );
  ```
- Tasks: Integrate with existing earnings chart; add real GraphQL query for IPNFT activities; handle unlink events (toast + refresh).

### 5. Activity Sharing (/components/ShareButton.tsx & Updates to ThesisCard/Thesis Page)
- Add share buttons to thesis cards/detail page: Post to X with IP link → Auto-mint derivative "Share IP" via mintSocial (5% royalty on future virals).
- Use X API v2 (Bearer token from env); fallback to window.open for simple share.
- v0.dev prompt: "Add X share button to thesis card that posts tweet + mints derivative IP."
- Code Snippet to Generate:
  ```tsx
  // components/ShareButton.tsx
  "use client";
  import { useAuth } from "@campnetwork/origin/react";
  import { createLicenseTerms } from "@campnetwork/origin";
  import axios from "axios";

  interface Props { thesisId: string; title: string; }

  export default function ShareButton({ thesisId, title }: Props) {
    const { origin } = useAuth();

    const handleShare = async () => {
      const tweetText = `Just minted/forked "${title}" on ThesisChain Africa! Own your research IP: https://thesischain.africa/thesis/${thesisId} #ThesisChain #CampNetwork`;
      try {
        // Post to X (requires NEXT_PUBLIC_X_BEARER_TOKEN in .env)
        await axios.post("https://api.twitter.com/2/tweets", { text: tweetText }, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_X_BEARER_TOKEN}` }
        });
        // Auto-mint share as derivative IP
        const shareMetadata = {
          name: `Share of ${title}`,
          description: "Viral share on X",
          attributes: [{ trait_type: "Action", value: "Shared" }, { trait_type: "Platform", value: "twitter" }]
        };
        await origin?.mintSocial("twitter", shareMetadata, createLicenseTerms(0n, 0, 500, "CAMP")); // 5% royaltyBps
        // Toast: "Shared! Earn royalties if someone forks from this."
      } catch (error) {
        // Fallback: Open X composer
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, "_blank");
      }
    };

    return <button onClick={handleShare} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Share on X</button>;
  }
  ```
- Tasks: Add to /app/thesis/[id]/page.tsx and ThesisCard; test with mock tweet (no real API call in tests); simulate royalty via USDC transfer.

## Env Vars (Add to .env.local)
- NEXT_PUBLIC_CAMP_CLIENT_ID=fce77d7a-8085-47ca-adff-306a933e76aa
- NEXT_PUBLIC_ORIGIN_API_KEY=4f1a2c9c-008e-4a2e-8712-055fa04f9ffa 
- NEXT_PUBLIC_X_BEARER_TOKEN=your-twitter-bearer  # From dev.twitter.com (optional for fallback)
- NEXT_PUBLIC_RPC_URL=https://rpc-campnetwork.xyz 
 


## Testing & Deployment
- Unit: Auth hooks (e.g., jest.mock("@campnetwork/origin/react")); test link/unlink flows.
- E2E: Full flow – Signup with Twitter → Mint thesis → Share → Check dashboard activity + simulated 0.50 USDC royalty.
- Deploy: Update Vercel; sui client publish for any auth-related contract events (e.g., emit ProfileMinted).
- Edge Cases: Wallet-only users (no socials); unlink mid-flow; testnet free mints (0 price); mobile OAuth redirects.
- Hooks: Auto-test on save (e.g., "npm test auth"); deploy script includes "Get clientId reminder".

## Success Metrics
- End-to-End: Social signup → Profile IP mint (free) → Thesis mint → X share (posts tweet + mints derivative) → Dashboard shows activity + earnings.
- Seeded Data: Mock 5 profiles with linked Twitter (e.g., "@unilagstudent") + 3 shares triggering 0.10 USDC royalties.
- Buildathon Polish: Confetti on signup/share; Live demo: "Tweet to earn from your thesis."

## Steering Instructions
- Use TypeScript; integrate seamlessly with existing UI (e.g., add buttons without breaking layout).
- Security: Wallet sign before social link; validate metadata <1KB; no soulbound profiles (transferable=true).
- Prioritize Twitter (African viral king); fallback to simple share if API fails.
- Error Handling: Toasts for "OAuth failed – try wallet" or "Share minted, check royalties!".
```
