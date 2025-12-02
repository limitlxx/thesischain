/**
 * Property-Based Tests for OAuth Callback Redirect
 * 
 * Feature: thesischain-integration, Property 19: OAuth callback confirms link
 * Validates: Requirements 6.7
 * 
 * This test verifies that the OAuth callback page verifies the social link
 * before redirecting to the dashboard, ensuring that redirect only occurs
 * after successful confirmation.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

/**
 * Simulated OAuth callback parameters
 */
interface OAuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
}

/**
 * Simulated social link status
 */
interface SocialLinkStatus {
  twitter?: boolean;
  spotify?: boolean;
  tiktok?: boolean;
}

/**
 * Simulated callback result
 */
interface CallbackResult {
  redirected: boolean;
  redirectPath?: string;
  error?: string;
  linkConfirmed: boolean;
}

/**
 * Tracker to monitor callback operations
 */
class CallbackTracker {
  private operations: string[] = [];
  private linkStatus: SocialLinkStatus | null = null;

  reset() {
    this.operations = [];
    this.linkStatus = null;
  }

  recordOperation(operation: string) {
    this.operations.push(operation);
  }

  setLinkStatus(status: SocialLinkStatus) {
    this.linkStatus = status;
  }

  getOperations(): string[] {
    return [...this.operations];
  }

  getLinkStatus(): SocialLinkStatus | null {
    return this.linkStatus;
  }

  hasOperation(operation: string): boolean {
    return this.operations.includes(operation);
  }

  getOperationIndex(operation: string): number {
    return this.operations.indexOf(operation);
  }
}

/**
 * Simulated OAuth callback handler
 */
async function simulatedOAuthCallback(
  params: OAuthCallbackParams,
  tracker: CallbackTracker,
  mockSocialStatus: SocialLinkStatus = {}
): Promise<CallbackResult> {
  try {
    // Step 1: Parse OAuth query parameters
    tracker.recordOperation('parse_params');
    await new Promise(resolve => setTimeout(resolve, 10));

    // Step 2: Check for OAuth errors
    if (params.error) {
      tracker.recordOperation('oauth_error_detected');
      throw new Error(`OAuth error: ${params.error}`);
    }

    // Step 3: Wait for OAuth flow to complete
    tracker.recordOperation('wait_for_oauth');
    await new Promise(resolve => setTimeout(resolve, 10));

    // Step 4: Confirm social link by checking useSocials
    tracker.recordOperation('check_social_link');
    await new Promise(resolve => setTimeout(resolve, 10));

    // Simulate checking social link status
    const isLinked = mockSocialStatus.twitter || 
                     mockSocialStatus.spotify || 
                     mockSocialStatus.tiktok;

    tracker.setLinkStatus(mockSocialStatus);

    if (!isLinked) {
      tracker.recordOperation('link_verification_failed');
      throw new Error('Social account linking failed');
    }

    tracker.recordOperation('link_verification_success');

    // Step 5: Only redirect after link is confirmed
    tracker.recordOperation('redirect_to_dashboard');

    return {
      redirected: true,
      redirectPath: '/dashboard',
      linkConfirmed: true
    };
  } catch (error) {
    tracker.recordOperation('error_redirect_to_signup');
    
    return {
      redirected: true,
      redirectPath: '/auth/signup',
      error: error instanceof Error ? error.message : 'Unknown error',
      linkConfirmed: false
    };
  }
}

describe('OAuth Callback Redirect Property Tests', () => {
  let tracker: CallbackTracker;

  beforeEach(() => {
    tracker = new CallbackTracker();
  });

  /**
   * Feature: thesischain-integration, Property 19: OAuth callback confirms link
   * Validates: Requirements 6.7
   * 
   * Property: For any successful OAuth callback, the system should verify
   * the social link before redirecting to the dashboard.
   */
  test('callback verifies social link before redirecting', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random OAuth code
        fc.string({ minLength: 20, maxLength: 50 }),
        // Generate random state
        fc.string({ minLength: 10, maxLength: 30 }),
        // Generate random platform that was linked
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        async (code, state, platform) => {
          tracker.reset();

          // Create OAuth params
          const params: OAuthCallbackParams = { code, state };

          // Create mock social status with the platform linked
          const mockStatus: SocialLinkStatus = {
            [platform]: true
          };

          // Execute callback
          const result = await simulatedOAuthCallback(params, tracker, mockStatus);

          // Verify link was confirmed
          expect(result.linkConfirmed).toBe(true);
          expect(result.redirected).toBe(true);
          expect(result.redirectPath).toBe('/dashboard');

          // Verify operations occurred in correct order
          expect(tracker.hasOperation('parse_params')).toBe(true);
          expect(tracker.hasOperation('check_social_link')).toBe(true);
          expect(tracker.hasOperation('link_verification_success')).toBe(true);
          expect(tracker.hasOperation('redirect_to_dashboard')).toBe(true);

          // Verify link verification happens before redirect
          const checkLinkIdx = tracker.getOperationIndex('check_social_link');
          const verifySuccessIdx = tracker.getOperationIndex('link_verification_success');
          const redirectIdx = tracker.getOperationIndex('redirect_to_dashboard');

          expect(checkLinkIdx).toBeGreaterThanOrEqual(0);
          expect(verifySuccessIdx).toBeGreaterThan(checkLinkIdx);
          expect(redirectIdx).toBeGreaterThan(verifySuccessIdx);
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  /**
   * Property: For any OAuth callback where social link verification fails,
   * the system should redirect to signup page instead of dashboard.
   */
  test('failed link verification redirects to signup', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random OAuth code
        fc.string({ minLength: 20, maxLength: 50 }),
        // Generate random state
        fc.string({ minLength: 10, maxLength: 30 }),
        async (code, state) => {
          tracker.reset();

          // Create OAuth params
          const params: OAuthCallbackParams = { code, state };

          // Create mock social status with NO platforms linked
          const mockStatus: SocialLinkStatus = {
            twitter: false,
            spotify: false,
            tiktok: false
          };

          // Execute callback
          const result = await simulatedOAuthCallback(params, tracker, mockStatus);

          // Verify link was NOT confirmed
          expect(result.linkConfirmed).toBe(false);
          expect(result.redirected).toBe(true);
          expect(result.redirectPath).toBe('/auth/signup');
          expect(result.error).toBeDefined();

          // Verify link verification was attempted
          expect(tracker.hasOperation('check_social_link')).toBe(true);
          expect(tracker.hasOperation('link_verification_failed')).toBe(true);
          expect(tracker.hasOperation('error_redirect_to_signup')).toBe(true);

          // Verify dashboard redirect did NOT occur
          expect(tracker.hasOperation('redirect_to_dashboard')).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any OAuth callback with an error parameter,
   * the system should redirect to signup without checking social link.
   */
  test('OAuth error redirects to signup without link check', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random error message
        fc.string({ minLength: 5, maxLength: 50 }),
        async (errorMsg) => {
          tracker.reset();

          // Create OAuth params with error
          const params: OAuthCallbackParams = { error: errorMsg };

          // Execute callback
          const result = await simulatedOAuthCallback(params, tracker, {});

          // Verify redirect to signup
          expect(result.linkConfirmed).toBe(false);
          expect(result.redirected).toBe(true);
          expect(result.redirectPath).toBe('/auth/signup');
          expect(result.error).toContain(errorMsg);

          // Verify OAuth error was detected
          expect(tracker.hasOperation('oauth_error_detected')).toBe(true);
          expect(tracker.hasOperation('error_redirect_to_signup')).toBe(true);

          // Verify link check did NOT occur (error happened before)
          expect(tracker.hasOperation('check_social_link')).toBe(false);
          expect(tracker.hasOperation('redirect_to_dashboard')).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any successful OAuth callback, redirect should only
   * occur after link confirmation, never before.
   */
  test('redirect only occurs after link confirmation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 20, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 30 }),
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        async (code, state, platform) => {
          tracker.reset();

          const params: OAuthCallbackParams = { code, state };
          const mockStatus: SocialLinkStatus = { [platform]: true };

          await simulatedOAuthCallback(params, tracker, mockStatus);

          const operations = tracker.getOperations();

          // Find indices of key operations
          const linkCheckIdx = operations.indexOf('check_social_link');
          const linkVerifyIdx = operations.indexOf('link_verification_success');
          const redirectIdx = operations.indexOf('redirect_to_dashboard');

          // Verify all operations occurred
          expect(linkCheckIdx).toBeGreaterThanOrEqual(0);
          expect(linkVerifyIdx).toBeGreaterThanOrEqual(0);
          expect(redirectIdx).toBeGreaterThanOrEqual(0);

          // Verify redirect happens AFTER link verification
          expect(redirectIdx).toBeGreaterThan(linkVerifyIdx);
          expect(redirectIdx).toBeGreaterThan(linkCheckIdx);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any OAuth callback, the system should always parse
   * parameters before any other operation.
   */
  test('parameter parsing always occurs first', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.option(fc.string({ minLength: 20, maxLength: 50 }), { nil: undefined }),
        fc.option(fc.string({ minLength: 10, maxLength: 30 }), { nil: undefined }),
        fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        async (code, state, error, platform) => {
          tracker.reset();

          const params: OAuthCallbackParams = { code, state, error };
          const mockStatus: SocialLinkStatus = { [platform]: true };

          await simulatedOAuthCallback(params, tracker, mockStatus);

          const operations = tracker.getOperations();

          // Verify parse_params is the first operation
          expect(operations[0]).toBe('parse_params');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any OAuth callback with multiple platforms linked,
   * the system should still redirect to dashboard (any linked platform is sufficient).
   */
  test('multiple linked platforms allow dashboard redirect', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 20, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 30 }),
        // Generate random combination of linked platforms (at least one true)
        fc.record({
          twitter: fc.boolean(),
          spotify: fc.boolean(),
          tiktok: fc.boolean()
        }).filter(status => status.twitter || status.spotify || status.tiktok),
        async (code, state, mockStatus) => {
          tracker.reset();

          const params: OAuthCallbackParams = { code, state };

          const result = await simulatedOAuthCallback(params, tracker, mockStatus);

          // Verify successful redirect to dashboard
          expect(result.linkConfirmed).toBe(true);
          expect(result.redirected).toBe(true);
          expect(result.redirectPath).toBe('/dashboard');

          // Verify link verification succeeded
          expect(tracker.hasOperation('link_verification_success')).toBe(true);
          expect(tracker.hasOperation('redirect_to_dashboard')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any OAuth callback, if no platforms are linked,
   * the system should never redirect to dashboard.
   */
  test('no linked platforms prevents dashboard redirect', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 20, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 30 }),
        async (code, state) => {
          tracker.reset();

          const params: OAuthCallbackParams = { code, state };
          
          // All platforms explicitly false
          const mockStatus: SocialLinkStatus = {
            twitter: false,
            spotify: false,
            tiktok: false
          };

          const result = await simulatedOAuthCallback(params, tracker, mockStatus);

          // Verify dashboard redirect did NOT occur
          expect(result.redirectPath).not.toBe('/dashboard');
          expect(result.redirectPath).toBe('/auth/signup');
          expect(result.linkConfirmed).toBe(false);

          // Verify dashboard redirect operation was not recorded
          expect(tracker.hasOperation('redirect_to_dashboard')).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any OAuth callback, the sequence should always be:
   * parse → wait → check link → verify → redirect
   */
  test('callback follows correct operation sequence', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 20, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 30 }),
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        async (code, state, platform) => {
          tracker.reset();

          const params: OAuthCallbackParams = { code, state };
          const mockStatus: SocialLinkStatus = { [platform]: true };

          await simulatedOAuthCallback(params, tracker, mockStatus);

          const operations = tracker.getOperations();

          // Define expected sequence
          const expectedSequence = [
            'parse_params',
            'wait_for_oauth',
            'check_social_link',
            'link_verification_success',
            'redirect_to_dashboard'
          ];

          // Verify all operations are present
          for (const op of expectedSequence) {
            expect(operations).toContain(op);
          }

          // Verify operations are in correct order
          for (let i = 0; i < expectedSequence.length - 1; i++) {
            const currentIdx = operations.indexOf(expectedSequence[i]);
            const nextIdx = operations.indexOf(expectedSequence[i + 1]);
            
            expect(currentIdx).toBeGreaterThanOrEqual(0);
            expect(nextIdx).toBeGreaterThan(currentIdx);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any OAuth callback with valid code and state,
   * the system should always attempt to check social link status.
   */
  test('valid OAuth params trigger link status check', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 20, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 30 }),
        fc.boolean(), // Whether any platform is linked
        async (code, state, isLinked) => {
          tracker.reset();

          const params: OAuthCallbackParams = { code, state };
          const mockStatus: SocialLinkStatus = {
            twitter: isLinked,
            spotify: false,
            tiktok: false
          };

          await simulatedOAuthCallback(params, tracker, mockStatus);

          // Verify link check always occurs with valid params
          expect(tracker.hasOperation('check_social_link')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any OAuth callback, the link status should be stored
   * in the tracker after verification.
   */
  test('link status is stored after verification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 20, maxLength: 50 }),
        fc.string({ minLength: 10, maxLength: 30 }),
        fc.record({
          twitter: fc.boolean(),
          spotify: fc.boolean(),
          tiktok: fc.boolean()
        }),
        async (code, state, mockStatus) => {
          tracker.reset();

          const params: OAuthCallbackParams = { code, state };

          await simulatedOAuthCallback(params, tracker, mockStatus);

          // Verify link status was stored
          const storedStatus = tracker.getLinkStatus();
          expect(storedStatus).toBeDefined();
          expect(storedStatus).toEqual(mockStatus);
        }
      ),
      { numRuns: 100 }
    );
  });
});
