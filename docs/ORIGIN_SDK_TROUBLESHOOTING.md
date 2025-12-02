# Origin SDK Troubleshooting Guide

## Common Errors and Solutions

### HTTP 400: Failed to generate upload URL

**Error Message:**
```
POST https://wv2h4to5qa.execute-api.us-east-2.amazonaws.com/dev/auth-testnet/origin/upload-url 400 (Bad Request)
Failed to generate upload URL: HTTP 400
```

**Possible Causes:**

1. **Invalid or Expired JWT Token**
   - The authentication token has expired
   - The token was not properly generated during wallet connection
   
2. **Incorrect Client ID**
   - The `NEXT_PUBLIC_CAMP_CLIENT_ID` environment variable is missing or incorrect
   
3. **Environment Mismatch**
   - Using DEVELOPMENT environment but need PRODUCTION (or vice versa)
   - The endpoint URL shows `/dev/auth-testnet/` which indicates testnet

4. **Wallet Not Properly Connected**
   - User clicked connect but didn't complete the signing process
   - Provider was not properly set before connection

**Solutions:**

#### 1. Reconnect Wallet

The most common fix:

1. Click "Disconnect" in the navbar or Camp Modal
2. Refresh the page
3. Click "Connect" and complete the full wallet connection flow
4. Sign the message when prompted
5. Try minting again

#### 2. Verify Environment Configuration

Check your `.env` file:

```bash
# Required
NEXT_PUBLIC_CAMP_CLIENT_ID=your_actual_client_id_here

# Make sure it's set correctly
```

Verify in `components/root-layout-client.tsx`:

```typescript
<CampProvider
  clientId={process.env.NEXT_PUBLIC_CAMP_CLIENT_ID || ""}
  environment="DEVELOPMENT"  // or "PRODUCTION"
  redirectUri={typeof window !== "undefined" ? window.location.origin : ""}
>
```

#### 3. Check Authentication State

Add this diagnostic component to your mint page:

```typescript
import { useAuthState, useAuth } from "@campnetwork/origin/react"

function AuthDiagnostic() {
  const { authenticated, loading } = useAuthState()
  const auth = useAuth()
  
  const checkAuth = () => {
    console.log("Auth State:", { authenticated, loading })
    console.log("Auth Instance:", auth)
    console.log("Origin Instance:", auth?.origin)
    
    try {
      const jwt = auth?.origin?.getJwt()
      console.log("JWT exists:", !!jwt)
      if (jwt) {
        const payload = JSON.parse(atob(jwt.split('.')[1]))
        console.log("JWT Payload:", payload)
      }
    } catch (e) {
      console.error("JWT Error:", e)
    }
  }
  
  return (
    <button onClick={checkAuth}>
      Check Auth Status
    </button>
  )
}
```

#### 4. Clear Browser Storage

Sometimes cached authentication data can cause issues:

1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear:
   - Local Storage
   - Session Storage
   - Cookies for your domain
4. Refresh the page
5. Reconnect wallet

#### 5. Verify Client ID

Make sure your Client ID is valid:

1. Check with Camp Network team that your client ID is active
2. Verify it's for the correct environment (testnet vs mainnet)
3. Ensure there are no extra spaces or quotes in the `.env` file

### Authentication Token Invalid

**Error Message:**
```
Authentication token is invalid. Please reconnect your wallet.
```

**Solution:**

This means the JWT token check failed. Follow these steps:

1. **Disconnect Wallet:**
   - Use the Camp Modal or navbar disconnect button
   
2. **Clear Session:**
   - Refresh the page after disconnecting
   
3. **Reconnect:**
   - Click connect
   - Select your wallet provider
   - Sign the message when prompted
   - Wait for "Connected" confirmation

4. **Verify Connection:**
   - Check that your wallet address appears in the navbar
   - Try a simple operation first (like viewing your profile)

### File Upload Failed

**Error Message:**
```
File upload failed: Failed to generate upload URL
```

**Checklist:**

- [ ] Wallet is connected (check navbar for address)
- [ ] JWT token is valid (use diagnostic component)
- [ ] File size is under 100MB
- [ ] File type is supported
- [ ] Network connection is stable
- [ ] Client ID is correct in environment variables

### Not Authenticated with Origin SDK

**Error Message:**
```
Not authenticated with Origin SDK. Please connect your wallet first.
```

**Solution:**

1. You're not connected at all
2. Click the "Connect" button in the navbar or on the signup page
3. Complete the wallet connection flow
4. Make sure you see your wallet address in the navbar

## Debugging Steps

### 1. Check Console Logs

Open browser DevTools (F12) and look for:

```javascript
// Good signs:
"JWT token verified"
"Starting mint process..."
"Calling Origin SDK mintFile..."
"Upload progress: X%"
"Mint successful! Token ID: XXX"

// Bad signs:
"JWT verification failed"
"Failed to generate upload URL"
"HTTP 400"
"Authentication token is invalid"
```

### 2. Verify Network Requests

In DevTools Network tab, look for:

- `POST /auth-testnet/origin/upload-url` - Should return 200, not 400
- Check the request headers for `Authorization: Bearer <token>`
- Check the response body for error details

### 3. Test Authentication Flow

```typescript
// Add this to your component
const testAuth = async () => {
  const auth = useAuth()
  
  console.log("1. Auth instance:", !!auth)
  console.log("2. Origin instance:", !!auth?.origin)
  
  try {
    const jwt = auth?.origin?.getJwt()
    console.log("3. JWT exists:", !!jwt)
    
    if (jwt) {
      const parts = jwt.split('.')
      const payload = JSON.parse(atob(parts[1]))
      console.log("4. JWT payload:", payload)
      console.log("5. JWT expiry:", new Date(payload.exp * 1000))
      console.log("6. Is expired:", Date.now() > payload.exp * 1000)
    }
  } catch (e) {
    console.error("JWT test failed:", e)
  }
}
```

### 4. Check Environment Variables

```bash
# In your terminal
echo $NEXT_PUBLIC_CAMP_CLIENT_ID

# Or in your code
console.log("Client ID:", process.env.NEXT_PUBLIC_CAMP_CLIENT_ID)
```

## Prevention

### Best Practices

1. **Always Check Authentication Before Minting:**
   ```typescript
   const { authenticated } = useAuthState()
   
   if (!authenticated) {
     toast.error("Please connect your wallet first")
     router.push("/auth/signup")
     return
   }
   ```

2. **Handle Token Expiration:**
   ```typescript
   // Tokens typically expire after 24 hours
   // Implement auto-refresh or prompt user to reconnect
   ```

3. **Provide Clear Error Messages:**
   ```typescript
   catch (error) {
     if (error.message.includes("HTTP 400")) {
       toast.error("Session expired", {
         description: "Please reconnect your wallet"
       })
     }
   }
   ```

4. **Test Connection Before Heavy Operations:**
   ```typescript
   // Before minting, verify auth is working
   const jwt = auth?.origin?.getJwt()
   if (!jwt) {
     // Prompt reconnection
   }
   ```

## Getting Help

If none of these solutions work:

1. **Check Origin SDK Version:**
   ```bash
   npm list @campnetwork/origin
   ```

2. **Update to Latest:**
   ```bash
   npm update @campnetwork/origin
   ```

3. **Contact Support:**
   - Include error messages from console
   - Include network request/response details
   - Mention your client ID (don't share JWT tokens!)
   - Specify environment (DEVELOPMENT/PRODUCTION)

## Related Documentation

- [Origin SDK Integration Guide](./ORIGIN_SDK_INTEGRATION.md)
- [Wagmi to Origin Migration](./WAGMI_TO_ORIGIN_MIGRATION.md)
- [IPFS Upload Migration](./IPFS_UPLOAD_MIGRATION.md)
