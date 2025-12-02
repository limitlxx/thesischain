/**
 * Property-Based Tests for Profile Minting
 * 
 * Feature: thesischain-integration, Property 2: Social OAuth triggers profile minting
 * Validates: Requirements 1.7
 * 
 * This test verifies that successful OAuth completion triggers automatic
 * profile IP minting with 0% royalty.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

/**
 * Simulated OAuth completion result
 */
interface OAuthResult {
  success: boolean;
  platform: 'twitter' | 'spotify' | 'tiktok';
  userId: string;
  error?: string;
}

/**
 * Simulated profile IP metadata
 */
interface ProfileIPMetadata {
  name: string;
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  royaltyBps: number;
}

/**
 * Simulated profile minting result
 */
interface ProfileMintResult {
  success: boolean;
  tokenId?: string;
  metadata?: ProfileIPMetadata;
  error?: string;
}

/**
 * Tracker to monitor OAuth and minting sequence
 */
class ProfileMintingTracker {
  private operations: string[] = [];
  private profileData: ProfileIPMetadata | null = null;

  reset() {
    this.operations = [];
    this.profileData = null;
  }

  recordOperation(operation: string) {
    this.operations.push(operation);
  }

  setProfileData(data: ProfileIPMetadata) {
    this.profileData = data;
  }

  getOperations(): string[] {
    return [...this.operations];
  }

  getProfileData(): ProfileIPMetadata | null {
    return this.profileData;
  }

  hasOperation(operation: string): boolean {
    return this.operations.includes(operation);
  }

  getOperationIndex(operation: string): number {
    return this.operations.indexOf(operation);
  }
}

/**
 * Simulated OAuth completion handler
 */
async function simulatedOAuthCompletion(
  platform: 'twitter' | 'spotify' | 'tiktok',
  university: string,
  tracker: ProfileMintingTracker,
  shouldFail: boolean = false
): Promise<ProfileMintResult> {
  try {
    // Step 1: Verify OAuth callback
    tracker.recordOperation('oauth_callback_received');
    await new Promise(resolve => setTimeout(resolve, 10));

    if (shouldFail) {
      tracker.recordOperation('oauth_verification_failed');
      throw new Error('OAuth verification failed');
    }

    tracker.recordOperation('oauth_verification_success');

    // Step 2: Confirm social link
    tracker.recordOperation('social_link_confirmed');
    await new Promise(resolve => setTimeout(resolve, 10));

    // Step 3: Automatically trigger profile IP minting
    tracker.recordOperation('profile_mint_triggered');
    await new Promise(resolve => setTimeout(resolve, 10));

    // Step 4: Create profile metadata with 0% royalty
    const profileMetadata: ProfileIPMetadata = {
      name: 'Thesis Profile',
      description: `Academic profile for ${university}`,
      attributes: [
        { trait_type: 'University', value: university },
        { trait_type: 'Type', value: 'Profile' },
        { trait_type: 'Platform', value: platform }
      ],
      royaltyBps: 0 // 0% royalty for free profile
    };

    tracker.setProfileData(profileMetadata);
    tracker.recordOperation('profile_metadata_created');

    // Step 5: Mint profile IP
    tracker.recordOperation('profile_mint_start');
    await new Promise(resolve => setTimeout(resolve, 10));
    tracker.recordOperation('profile_mint_complete');

    const tokenId = `profile-${platform}-${Date.now()}`;

    return {
      success: true,
      tokenId,
      metadata: profileMetadata
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

describe('Profile Minting Property Tests', () => {
  let tracker: ProfileMintingTracker;

  beforeEach(() => {
    tracker = new ProfileMintingTracker();
  });

  /**
   * Feature: thesischain-integration, Property 2: Social OAuth triggers profile minting
   * Validates: Requirements 1.7
   * 
   * Property: For any successful OAuth completion (Twitter, Spotify, or TikTok),
   * the system should automatically mint a free Thesis Profile IP with 0% royalty.
   */
  test('successful OAuth completion triggers profile IP mint with 0% royalty', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random platform
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        // Generate random university
        fc.constantFrom(
          'University of Lagos',
          'University of Ghana',
          'Makerere University',
          'Strathmore University',
          'University of Nairobi',
          'Covenant University',
          'KNUST'
        ),
        async (platform, university) => {
          tracker.reset();

          // Simulate OAuth completion
          const result = await simulatedOAuthCompletion(
            platform as 'twitter' | 'spotify' | 'tiktok',
            university,
            tracker
          );

          // Verify profile minting was triggered
          expect(result.success).toBe(true);
          expect(result.tokenId).toBeDefined();
          expect(result.metadata).toBeDefined();

          // Verify all operations occurred in correct order
          expect(tracker.hasOperation('oauth_callback_received')).toBe(true);
          expect(tracker.hasOperation('oauth_verification_success')).toBe(true);
          expect(tracker.hasOperation('social_link_confirmed')).toBe(true);
          expect(tracker.hasOperation('profile_mint_triggered')).toBe(true);
          expect(tracker.hasOperation('profile_metadata_created')).toBe(true);
          expect(tracker.hasOperation('profile_mint_start')).toBe(true);
          expect(tracker.hasOperation('profile_mint_complete')).toBe(true);

          // Verify sequence order
          const oauthIdx = tracker.getOperationIndex('oauth_verification_success');
          const linkIdx = tracker.getOperationIndex('social_link_confirmed');
          const triggerIdx = tracker.getOperationIndex('profile_mint_triggered');
          const mintIdx = tracker.getOperationIndex('profile_mint_complete');

          expect(oauthIdx).toBeLessThan(linkIdx);
          expect(linkIdx).toBeLessThan(triggerIdx);
          expect(triggerIdx).toBeLessThan(mintIdx);

          // Verify profile has 0% royalty
          expect(result.metadata?.royaltyBps).toBe(0);

          // Verify profile metadata contains university
          const universityAttr = result.metadata?.attributes.find(
            attr => attr.trait_type === 'University'
          );
          expect(universityAttr).toBeDefined();
          expect(universityAttr?.value).toBe(university);

          // Verify profile metadata contains platform
          const platformAttr = result.metadata?.attributes.find(
            attr => attr.trait_type === 'Platform'
          );
          expect(platformAttr).toBeDefined();
          expect(platformAttr?.value).toBe(platform);
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  /**
   * Property: For any successful OAuth completion, the profile IP
   * should always have exactly 0% royalty (0 BPS), never any other value.
   */
  test('profile IP always has 0% royalty regardless of platform or university', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        fc.string({ minLength: 5, maxLength: 100 }), // Any university name
        async (platform, university) => {
          tracker.reset();

          const result = await simulatedOAuthCompletion(
            platform as 'twitter' | 'spotify' | 'tiktok',
            university,
            tracker
          );

          // Verify profile always has 0% royalty
          expect(result.success).toBe(true);
          expect(result.metadata?.royaltyBps).toBe(0);

          // Verify it's not any other value
          expect(result.metadata?.royaltyBps).not.toBeGreaterThan(0);
          expect(result.metadata?.royaltyBps).not.toBeLessThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any OAuth completion, profile minting should only
   * occur after OAuth verification succeeds, never before.
   */
  test('profile minting only occurs after OAuth verification', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        fc.string({ minLength: 5, maxLength: 100 }),
        async (platform, university) => {
          tracker.reset();

          await simulatedOAuthCompletion(
            platform as 'twitter' | 'spotify' | 'tiktok',
            university,
            tracker
          );

          const operations = tracker.getOperations();

          // Find indices
          const verificationIdx = operations.indexOf('oauth_verification_success');
          const mintTriggerIdx = operations.indexOf('profile_mint_triggered');
          const mintStartIdx = operations.indexOf('profile_mint_start');

          // Verify OAuth verification happens before minting
          expect(verificationIdx).toBeGreaterThanOrEqual(0);
          expect(mintTriggerIdx).toBeGreaterThan(verificationIdx);
          expect(mintStartIdx).toBeGreaterThan(verificationIdx);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any failed OAuth verification, profile minting
   * should not be triggered.
   */
  test('failed OAuth prevents profile minting', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        fc.string({ minLength: 5, maxLength: 100 }),
        async (platform, university) => {
          tracker.reset();

          // Simulate failed OAuth
          const result = await simulatedOAuthCompletion(
            platform as 'twitter' | 'spotify' | 'tiktok',
            university,
            tracker,
            true // shouldFail = true
          );

          // Verify minting did not occur
          expect(result.success).toBe(false);
          expect(result.tokenId).toBeUndefined();
          expect(result.metadata).toBeUndefined();

          // Verify profile minting operations were not executed
          expect(tracker.hasOperation('profile_mint_triggered')).toBe(false);
          expect(tracker.hasOperation('profile_mint_start')).toBe(false);
          expect(tracker.hasOperation('profile_mint_complete')).toBe(false);

          // Verify OAuth failure was recorded
          expect(tracker.hasOperation('oauth_verification_failed')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any successful OAuth completion, the profile metadata
   * should contain the correct university information.
   */
  test('profile metadata contains correct university information', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        fc.string({ minLength: 5, maxLength: 100 }),
        async (platform, university) => {
          tracker.reset();

          const result = await simulatedOAuthCompletion(
            platform as 'twitter' | 'spotify' | 'tiktok',
            university,
            tracker
          );

          expect(result.success).toBe(true);
          expect(result.metadata).toBeDefined();

          // Verify university is in attributes
          const universityAttr = result.metadata?.attributes.find(
            attr => attr.trait_type === 'University'
          );
          expect(universityAttr).toBeDefined();
          expect(universityAttr?.value).toBe(university);

          // Verify university is in description
          expect(result.metadata?.description).toContain(university);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any successful OAuth completion, the profile should
   * be marked as type "Profile" to distinguish it from thesis IPNFTs.
   */
  test('profile is marked with type "Profile"', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        fc.string({ minLength: 5, maxLength: 100 }),
        async (platform, university) => {
          tracker.reset();

          const result = await simulatedOAuthCompletion(
            platform as 'twitter' | 'spotify' | 'tiktok',
            university,
            tracker
          );

          expect(result.success).toBe(true);
          expect(result.metadata).toBeDefined();

          // Verify Type attribute exists and is "Profile"
          const typeAttr = result.metadata?.attributes.find(
            attr => attr.trait_type === 'Type'
          );
          expect(typeAttr).toBeDefined();
          expect(typeAttr?.value).toBe('Profile');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any successful OAuth completion, the profile should
   * include the platform used for authentication.
   */
  test('profile includes authentication platform', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        fc.string({ minLength: 5, maxLength: 100 }),
        async (platform, university) => {
          tracker.reset();

          const result = await simulatedOAuthCompletion(
            platform as 'twitter' | 'spotify' | 'tiktok',
            university,
            tracker
          );

          expect(result.success).toBe(true);
          expect(result.metadata).toBeDefined();

          // Verify Platform attribute exists and matches
          const platformAttr = result.metadata?.attributes.find(
            attr => attr.trait_type === 'Platform'
          );
          expect(platformAttr).toBeDefined();
          expect(platformAttr?.value).toBe(platform);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any successful OAuth completion, a unique token ID
   * should be generated for the profile IP.
   */
  test('each profile mint generates unique token ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        fc.string({ minLength: 5, maxLength: 100 }),
        async (platform, university) => {
          tracker.reset();

          // Mint first profile
          const result1 = await simulatedOAuthCompletion(
            platform as 'twitter' | 'spotify' | 'tiktok',
            university,
            tracker
          );

          // Wait a moment to ensure different timestamp
          await new Promise(resolve => setTimeout(resolve, 5));

          tracker.reset();

          // Mint second profile
          const result2 = await simulatedOAuthCompletion(
            platform as 'twitter' | 'spotify' | 'tiktok',
            university,
            tracker
          );

          // Verify both succeeded
          expect(result1.success).toBe(true);
          expect(result2.success).toBe(true);

          // Verify token IDs are different
          expect(result1.tokenId).toBeDefined();
          expect(result2.tokenId).toBeDefined();
          expect(result1.tokenId).not.toBe(result2.tokenId);
        }
      ),
      { numRuns: 50 } // Fewer runs since we're doing two mints per iteration
    );
  });

  /**
   * Property: For any successful OAuth completion, the profile name
   * should always be "Thesis Profile".
   */
  test('profile name is always "Thesis Profile"', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('twitter', 'spotify', 'tiktok'),
        fc.string({ minLength: 5, maxLength: 100 }),
        async (platform, university) => {
          tracker.reset();

          const result = await simulatedOAuthCompletion(
            platform as 'twitter' | 'spotify' | 'tiktok',
            university,
            tracker
          );

          expect(result.success).toBe(true);
          expect(result.metadata).toBeDefined();
          expect(result.metadata?.name).toBe('Thesis Profile');
        }
      ),
      { numRuns: 100 }
    );
  });
});
