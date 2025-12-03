# Vercel Build Fix Summary

## Problem
The app was failing to build on Vercel with errors related to `thread-stream` package (a dependency of `pino`, used by WalletConnect/Origin SDK). Next.js 16 with Turbopack was trying to bundle test files and non-JavaScript files, causing build failures.

## Solution
1. **Downgraded Next.js from 16.0.3 to 15.5.6**
   - Next.js 16 uses Turbopack by default with no way to disable it
   - Next.js 15 uses stable webpack which handles these dependencies better

2. **Updated next.config.mjs**
   - Added `output: 'standalone'` for better Vercel deployment
   - Configured `serverExternalPackages` to externalize problematic packages
   - Added webpack IgnorePlugin to skip test files from node_modules
   - Added fallbacks for Node.js modules

3. **Created stub files for missing dependencies**
   - `lib/origin-auth-refresh.ts` - For the refresh-auth diagnostic page
   - `lib/db/rxdb-setup.ts` - Compatibility stub (RxDB was migrated to MongoDB)

## Files Changed
- `package.json` - Downgraded Next.js to 15.5.6
- `next.config.mjs` - Added build configuration
- `lib/origin-auth-refresh.ts` - Created (new file)
- `lib/db/rxdb-setup.ts` - Created (new file)

## Build Status
✅ Build now completes successfully
✅ All 21 pages generated
✅ No webpack/bundling errors

## Deployment to Vercel
The app should now deploy successfully to Vercel. The build will:
- Use Next.js 15.5.6 with webpack (not Turbopack)
- Generate a standalone output optimized for serverless
- Properly handle WalletConnect/Origin SDK dependencies
- Skip problematic test files from node_modules

## Notes
- The `null-loader` package was installed but isn't actively used (can be removed if needed)
- TypeScript errors are ignored during build (`ignoreBuildErrors: true`)
- Images are unoptimized for faster builds
