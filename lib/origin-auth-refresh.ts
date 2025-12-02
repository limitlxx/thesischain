// Stub file for origin-auth-refresh
// This provides placeholder functions for the refresh-auth diagnostic page

export function isJwtLikelyStale(auth: any): boolean {
  if (!auth?.origin) return false;
  
  try {
    const jwt = auth.origin.getJwt();
    if (!jwt) return false;
    
    const parts = jwt.split('.');
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    const createdAt = payload.createdAt || payload.iat || 0;
    const ageSeconds = now - createdAt;
    
    // Consider stale if over 1 hour old
    return ageSeconds > 3600;
  } catch {
    return false;
  }
}

export async function forceOriginReauth(auth: any): Promise<boolean> {
  if (!auth?.origin) return false;
  
  try {
    // Disconnect and clear storage
    await auth.disconnect();
    
    // Clear any cached tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('camp-origin-jwt');
      localStorage.removeItem('camp-origin-refresh-token');
    }
    
    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reconnect
    await auth.connect();
    
    return true;
  } catch (error) {
    console.error('Failed to force reauth:', error);
    return false;
  }
}
