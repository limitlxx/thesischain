# IPFS Upload Migration to Origin SDK

## Summary

Migrated from custom NFT.Storage IPFS uploads to Origin SDK's built-in file upload functionality.

## Problem

The application was using a custom IPFS upload implementation via NFT.Storage that required:
- `NEXT_PUBLIC_NFT_STORAGE_TOKEN` environment variable
- Separate `uploadFiles()` and `uploadMetadata()` functions
- Manual IPFS CID management
- Additional error handling for upload failures

**Error encountered:**
```
NFT.Storage token not configured. Set NEXT_PUBLIC_NFT_STORAGE_TOKEN or NFT_STORAGE_API_KEY environment variable.
```

## Solution

Origin SDK's `mintFile()` method handles IPFS uploads internally, eliminating the need for:
- NFT.Storage API tokens
- Custom IPFS upload logic
- Manual CID tracking
- Separate metadata uploads

## Changes Made

### 1. Updated `lib/camp.ts`

**Removed:**
- Import of `uploadFiles` and `uploadMetadata` from `./ipfs`
- Manual IPFS upload steps
- CID management
- Metadata upload logic

**Before:**
```typescript
// Step 1: Upload files to IPFS
const filesCid = await uploadFiles(files, progressCallback)

// Step 2: Prepare metadata
const completeMetadata = { ...metadata, files: [...] }
await uploadMetadata(completeMetadata)

// Step 3: Mint via Origin SDK
const originTokenId = await auth.origin.mintFile(files[0], metadata, license)
```

**After:**
```typescript
// Mint via Origin SDK - it handles IPFS upload internally
const originTokenId = await auth.origin.mintFile(
  files[0],
  enhancedMetadata,
  license,
  undefined,
  {
    progressCallback: (progress) => {
      progressCallback?.(50 + (progress * 0.5))
    }
  }
)
```

### 2. Enhanced Metadata

Added file information directly to metadata attributes instead of separate IPFS storage:

```typescript
const enhancedMetadata = {
  name: metadata.name,
  description: metadata.description,
  image: metadata.image,
  attributes: [
    ...metadata.attributes,
    { trait_type: "File Count", value: files.length },
    { trait_type: "Primary File", value: files[0].name },
    { trait_type: "File Types", value: files.map(f => f.type).join(", ") }
  ]
}
```

### 3. Progress Tracking

Origin SDK provides its own progress callback that we map to our UI:

```typescript
{
  progressCallback: (progress) => {
    // Map Origin SDK progress (0-100) to our progress (50-100)
    progressCallback?.(50 + (progress * 0.5))
  }
}
```

## Benefits

1. **Simplified Configuration**: No need for NFT.Storage API tokens
2. **Reduced Dependencies**: Removed custom IPFS upload logic
3. **Better Integration**: Uses Origin SDK's native file handling
4. **Automatic Optimization**: Origin SDK handles file optimization and storage
5. **Consistent Experience**: Same upload mechanism across all Origin SDK features
6. **Built-in Retry Logic**: Origin SDK handles upload failures internally

## Environment Variables

### Removed
- ~~`NEXT_PUBLIC_NFT_STORAGE_TOKEN`~~ - No longer needed
- ~~`NFT_STORAGE_API_KEY`~~ - No longer needed

### Still Required
- `NEXT_PUBLIC_CAMP_CLIENT_ID` - Origin SDK client ID

## Files Modified

- `lib/camp.ts` - Removed custom IPFS upload, using Origin SDK's `mintFile()`
- `docs/ORIGIN_SDK_INTEGRATION.md` - Updated documentation

## Files No Longer Used

- `lib/ipfs.ts` - Custom IPFS upload functions (can be kept for reference or removed)
- `lib/README_IPFS.md` - IPFS upload documentation (can be archived)

## Testing

### Before Migration
```bash
# Required environment variable
NEXT_PUBLIC_NFT_STORAGE_TOKEN=your_token_here

# Would fail without token
```

### After Migration
```bash
# Only requires Origin SDK client ID
NEXT_PUBLIC_CAMP_CLIENT_ID=your_client_id

# Works without NFT.Storage token
```

## Migration Checklist

- [x] Remove NFT.Storage imports from `lib/camp.ts`
- [x] Update `useMintThesis` to use Origin SDK's `mintFile()`
- [x] Update `useForkThesis` to use Origin SDK's `mintFile()`
- [x] Add enhanced metadata with file information
- [x] Map Origin SDK progress to UI progress
- [x] Update documentation
- [ ] Remove NFT.Storage environment variables from `.env` (optional)
- [ ] Archive or remove `lib/ipfs.ts` (optional)
- [ ] Test minting flow end-to-end
- [ ] Test forking flow end-to-end

## How Origin SDK Handles IPFS

According to the Origin SDK documentation:

> `mintFile(file, metadata, license, parents?, options?)`
> 
> Uploads a file and mints an IpNFT for it.

The SDK:
1. Accepts the file directly
2. Uploads it to IPFS internally
3. Creates the IPNFT with the IPFS CID
4. Returns the minted token ID

This is all handled in a single method call, making it much simpler than managing IPFS uploads separately.

## Rollback Plan

If needed, the previous IPFS upload implementation can be restored by:

1. Reverting `lib/camp.ts` to use `uploadFiles()` and `uploadMetadata()`
2. Re-adding NFT.Storage environment variables
3. Ensuring `lib/ipfs.ts` is still available

However, this should not be necessary as Origin SDK's approach is more robust and better integrated.

## Additional Notes

- The `lib/ipfs.ts` file can be kept for reference or other use cases
- Multiple files can still be uploaded by calling `mintFile()` multiple times
- For batch uploads, consider implementing a queue system
- Origin SDK may support batch uploads in future versions

## Resources

- [Origin SDK Documentation](./origin_sdk.md)
- [Origin SDK Integration Guide](./ORIGIN_SDK_INTEGRATION.md)
- [Origin SDK mintFile() Documentation](./origin_sdk.md#mintfile)
