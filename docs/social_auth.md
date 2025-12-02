### Integrating Social Signup/Signin and Activity Sharing into ThesisChain Africa

Based on the [Origin SDK repo](https://github.com/campaign-layer/origin-sdk), which provides built-in support for social authentication (e.g., Twitter/X, Spotify, TikTok) and user management via wallet/social linking, we can seamlessly add this to ThesisChain. This enhances accessibility for African students/researchers who may prefer social logins over wallets initially, while tying activities (e.g., minting a thesis, forking one) to shareable profiles for virality and community building.

The SDK's `Auth` class and React hooks (`useAuth`, `useSocials`, `useLinkSocials`) handle OAuth flows for social linking, storing linked accounts as part of the user's on-chain profile. For sharing, we'll use Origin's `mintSocial` for auto-minting social-derived IP (e.g., a tweet about your thesis) and integrate with X's API for one-click shares. This keeps everything on Camp Network testnet, with royalties flowing back to users for shared activities.

#### Why This Fits ThesisChain (and Wins the Buildathon)
- **Social Signup/Signin**: Lowers barriers—students link Twitter (common in Africa) to auto-mint a "Thesis Profile IP" on signup, proving ownership without a full wallet setup.
- **Manage User Activities**: Track mints/forks/downloads in a user dashboard, with social proofs (e.g., linked tweets) for credibility.
- **Sharing**: Auto-generate shareable links/tweets with embedded IP previews, earning micro-royalties on viral shares (e.g., 5% on derivative forks from shares).
- **Impact**: Boosts discoverability—e.g., a UNILAG student's thesis shared on X gets indexed, cited, and earns passively.

#### Updated Architecture (With Social Auth & Sharing)
We'll add a `/auth` layer and sharing hooks. No major changes to contracts—social links are stored off-chain in Origin's auth state, synced to metadata on mint.

| Layer | Addition | Tech |
|-------|----------|------|
| **Auth** | Social signup (OAuth redirect) + wallet fallback | Origin SDK `Auth` + React hooks |
| **User Management** | Dashboard shows linked socials, activity feed (mints/forks/shares) | `useSocials` + TheGraph queries |
| **Sharing** | One-click X share with IP embed; auto-mint share as derivative IP | X API + `mintSocial` |
| **Frontend** | New `/auth/signup` page + share buttons on thesis cards | Next.js + Origin React components |

#### Step-by-Step Implementation (Shippable in 2-3 Days with v0.dev/Kiro)
1. **Install Dependencies** (In your Next.js project):
   ```bash
   npm install @campnetwork/origin viem wagmi @tanstack/react-query
   # For X sharing (optional, via API)
   npm install axios
   ```

2. **Wrap App with CampProvider** (In `/app/layout.tsx` – from SDK examples):
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
               clientId={process.env.NEXT_PUBLIC_CAMP_CLIENT_ID!} // Get from Camp Discord/app setup
               environment="DEVELOPMENT" // Basecamp testnet
               baseParentId="0xYourBaseThesisIP" // Optional: All user mints as derivatives
             >
               {children}
             </CampProvider>
           </QueryClientProvider>
         </body>
       </html>
     );
   }
   ```

3. **Social Signup/Signin Page** (`/app/auth/signup/page.tsx` – Prompt for v0.dev: "Create a social signup page for ThesisChain with Twitter/Spotify buttons, wallet fallback, and OAuth redirect flow using Origin SDK hooks. African-themed UI with university selector."):
   ```tsx
   // app/auth/signup/page.tsx
   "use client";
   import { useAuth, useConnect, useLinkSocials } from "@campnetwork/origin/react";
   import { CampButton } from "@campnetwork/origin/react"; // SDK UI component
   import { useState } from "react";

   export default function SignupPage() {
     const { isConnected, connect } = useConnect();
     const { linkSocials } = useLinkSocials();
     const [university, setUniversity] = useState("");

     const handleSocialSignup = async (platform: "twitter" | "spotify") => {
       if (!isConnected) await connect(); // Wallet first for signing
       await linkSocials({ [platform]: { redirectUri: `${window.location.origin}/auth/callback` } });
       // On success: Auto-mint profile IP
       const profileMetadata = { name: "Thesis Profile", attributes: [{ trait_type: "University", value: university }] };
       await useAuth.getState().origin?.mintSocial(platform, profileMetadata, createLicenseTerms(0n, 0, 0, "CAMP")); // Free mint
       // Redirect to dashboard
       window.location.href = "/dashboard";
     };

     return (
       <div className="flex flex-col items-center p-8 bg-gradient-to-br from-blue-400 to-green-500 min-h-screen">
         <h1 className="text-4xl font-bold mb-8">Join ThesisChain Africa</h1>
         <select value={university} onChange={(e) => setUniversity(e.target.value)} className="mb-4 p-2">
           <option>University of Lagos (UNILAG)</option>
           <option>University of Ghana</option>
           <option>Strathmore University</option>
           {/* Add more */}
         </select>
         <CampButton onClick={() => handleSocialSignup("twitter")} variant="twitter">Signup with Twitter/X</CampButton>
         <CampButton onClick={() => handleSocialSignup("spotify")} variant="spotify">Signup with Spotify</CampButton>
         <button onClick={connect} className="mt-4 p-2 bg-black text-white rounded">Or Connect Wallet</button>
       </div>
     );
   }

   // Helper for free license (from SDK)
   function createLicenseTerms(price: bigint, duration: number, royaltyBps: number, token: string) {
     return { price, duration, royaltyBps, token }; // Full impl in lib/camp.ts
   }
   ```

   - **Callback Handler** (`/app/auth/callback/page.tsx`): Simple redirect after OAuth: `window.location.href = "/dashboard";`.

4. **User Activity Management in Dashboard** (`/app/dashboard/page.tsx` – Update v0.dev prompt: "Add social links section and activity feed to dashboard, querying Origin for mints/forks."):
   ```tsx
   // app/dashboard/page.tsx (add to existing)
   "use client";
   import { useSocials, useAuthState } from "@campnetwork/origin/react";

   export default function Dashboard() {
     const { socials } = useSocials(); // { twitter: { handle: "@user" }, ... }
     const { user } = useAuthState(); // User profile with linked socials

     // Activity feed: Query Camp indexer for user's IPNFTs (mints/forks)
     const activities = [ /* Fetch via GraphQL: user's mints, forks, shares */ ];

     return (
       <div className="p-8">
         <h2>Your Profile</h2>
         <div className="grid grid-cols-2 gap-4">
           {Object.entries(socials).map(([platform, data]) => (
             <div key={platform} className="border p-4">
               <strong>{platform.toUpperCase()}:</strong> {data.handle}
               <button onClick={() => unlinkSocial(platform)}>Unlink</button> {/* From useLinkSocials */}
             </div>
           ))}
         </div>
         <h3>Recent Activities</h3>
         <ul>
           {activities.map((act: any) => (
             <li key={act.id}>{act.type} - {act.metadata.name} (Earned: {act.royalties} USDC)</li>
           ))}
         </ul>
       </div>
     );
   }
   ```

5. **Sharing Activities** (Add to `/components/ThesisCard.tsx` and `/app/thesis/[id]/page.tsx` – Prompt for v0.dev: "Add share button to thesis card that tweets with IP preview and mints a share IP."):
   - Use X API for posting (get API keys from dev.twitter.com; store in .env).
   ```tsx
   // components/ShareButton.tsx
   "use client";
   import { useAuth } from "@campnetwork/origin/react";
   import axios from "axios";

   interface ShareButtonProps { thesisId: string; title: string; }

   export default function ShareButton({ thesisId, title }: ShareButtonProps) {
     const { origin } = useAuth();

     const handleShare = async () => {
       const tweetText = `Just minted my thesis "${title}" on ThesisChain! Check it out: https://thesischain.africa/thesis/${thesisId} #ThesisChainAfrica #CampNetwork`;
       // Post to X (requires OAuth 1.0a or v2 API)
       await axios.post("https://api.twitter.com/2/tweets", { text: tweetText }, {
         headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_X_BEARER_TOKEN}` } // Setup in env
       });

       // Auto-mint share as derivative IP (earns royalty on virals)
       const shareMetadata = { name: `Share of ${title}`, attributes: [{ trait_type: "Action", value: "Shared on X" }] };
       await origin?.mintSocial("twitter", shareMetadata, createLicenseTerms(0n, 0, 500, "CAMP")); // 5% royalty
     };

     return <button onClick={handleShare} className="bg-blue-500 text-white px-4 py-2 rounded">Share on X</button>;
   }
   ```

#### Kiro IDE Spec Update (Add to `.kiro/specs/thesis-spec.md`)
```
## New: Social Auth & Sharing
- Add Auth wrapper: Use Origin SDK for Twitter/Spotify linking.
- Tasks:
  1. Generate /auth/signup/page.tsx with OAuth hooks.
  2. Update dashboard: Query socials + activities via useSocials/useAuthState.
  3. Add ShareButton: X API post + mintSocial derivative.
- Testing: Mock OAuth redirects; simulate share mint on testnet.
```

#### Deployment & Testing Notes
- **Env Vars**: Add `NEXT_PUBLIC_CAMP_CLIENT_ID` (from Camp Discord) and `NEXT_PUBLIC_X_BEARER_TOKEN`.
- **Test Flow**: Signup with Twitter → Mint thesis → Share → See activity in dashboard + royalty simulation.
- **Edge Cases**: Handle unlink (revoke social access), non-linked users (wallet-only), and testnet USDC for share royalties.
- **Buildathon Bonus**: Demo a full flow: Social signup → Mint → Share on X → Fork from share (triggers royalty).

This adds ~100 lines of code but massive UX lift—students can now "Tweet to Mint" and earn from shares. If you need refined v0 prompts, full Kiro-generated files, or X API setup help, drop details on your env setup! Let's get this submitted by Dec 6. 🚀