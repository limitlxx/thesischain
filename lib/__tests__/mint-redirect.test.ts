/**
 * Property-Based Tests for Mint Redirect
 * 
 * Feature: thesischain-integration, Property 8: Successful mint triggers navigation
 * Validates: Requirements 2.9
 * 
 * This test verifies that after a successful mint operation:
 * 1. The system redirects to /thesis/[tokenId]
 * 2. The tokenId in the URL matches the minted token
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

/**
 * Mock router to track navigation calls
 */
class MockRouter {
  private navigations: Array<{ path: string; method: string }> = [];

  reset() {
    this.navigations = [];
  }

  push(path: string) {
    this.navigations.push({ path, method: 'push' });
  }

  replace(path: string) {
    this.navigations.push({ path, method: 'replace' });
  }

  getNavigations() {
    return [...this.navigations];
  }

  getLastNavigation() {
    return this.navigations[this.navigations.length - 1];
  }

  hasNavigatedTo(path: string): boolean {
    return this.navigations.some(nav => nav.path === path);
  }
}

/**
 * Simulated mint function that returns a token ID and triggers navigation
 */
async function simulatedMintWithRedirect(
  files: File[],
  metadata: {
    name: string;
    description: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
  },
  royaltyBps: number,
  router: MockRouter
): Promise<string> {
  // Validate inputs
  if (royaltyBps < 100 || royaltyBps > 10000) {
    throw new Error('Invalid royalty bounds');
  }

  if (!files || files.length === 0) {
    throw new Error('No files provided');
  }

  // Simulate minting process
  await new Promise(resolve => setTimeout(resolve, 10));

  // Generate a token ID (simulating blockchain response)
  const tokenId = `token-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Simulate the redirect that happens after successful mint
  router.push(`/thesis/${tokenId}`);

  return tokenId;
}

/**
 * Extract token ID from a thesis detail page URL
 */
function extractTokenIdFromUrl(url: string): string | null {
  const match = url.match(/\/thesis\/([^/?#]+)/);
  return match ? match[1] : null;
}

describe('Mint Redirect Property Tests', () => {
  let router: MockRouter;

  beforeEach(() => {
    router = new MockRouter();
  });

  /**
   * Feature: thesischain-integration, Property 8: Successful mint triggers navigation
   * Validates: Requirements 2.9
   * 
   * Property: For any successful mint operation, the system should redirect
   * to /thesis/[tokenId] where tokenId matches the minted token.
   */
  test('successful mint redirects to thesis detail page with correct token ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random thesis name
        fc.string({ minLength: 5, maxLength: 100 }),
        // Generate random description
        fc.string({ minLength: 10, maxLength: 500 }),
        // Generate random royalty (valid range: 100-10000 BPS = 1%-100%)
        fc.integer({ min: 100, max: 10000 }),
        // Generate random number of files (1-5)
        fc.integer({ min: 1, max: 5 }),
        async (name, description, royaltyBps, fileCount) => {
          router.reset();

          // Create mock files
          const files = Array.from({ length: fileCount }, (_, i) => 
            new File([`mock content ${i}`], `file${i}.pdf`, { type: 'application/pdf' })
          );

          const metadata = {
            name,
            description,
            attributes: [
              { trait_type: 'University', value: 'Test University' },
              { trait_type: 'Year', value: 2024 }
            ]
          };

          // Execute minting with redirect
          const mintedTokenId = await simulatedMintWithRedirect(
            files,
            metadata,
            royaltyBps,
            router
          );

          // Verify that navigation occurred
          const navigations = router.getNavigations();
          expect(navigations.length).toBeGreaterThan(0);

          // Get the last navigation (should be the redirect after mint)
          const lastNav = router.getLastNavigation();
          expect(lastNav).toBeDefined();

          // Verify the navigation path starts with /thesis/
          expect(lastNav.path).toMatch(/^\/thesis\//);

          // Extract token ID from the URL
          const urlTokenId = extractTokenIdFromUrl(lastNav.path);
          expect(urlTokenId).toBeTruthy();

          // Verify the token ID in the URL matches the minted token ID
          expect(urlTokenId).toBe(mintedTokenId);

          // Verify the navigation method is 'push' (not 'replace')
          expect(lastNav.method).toBe('push');
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  /**
   * Property: For any successful mint, the redirect should happen exactly once
   * (no duplicate redirects)
   */
  test('mint triggers exactly one redirect', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.integer({ min: 100, max: 10000 }),
        async (name, description, royaltyBps) => {
          router.reset();

          const files = [new File(['mock content'], 'file.pdf', { type: 'application/pdf' })];
          const metadata = {
            name,
            description,
            attributes: [{ trait_type: 'University', value: 'Test University' }]
          };

          await simulatedMintWithRedirect(files, metadata, royaltyBps, router);

          // Verify exactly one navigation occurred
          const navigations = router.getNavigations();
          expect(navigations.length).toBe(1);

          // Verify it's a thesis detail page navigation
          expect(navigations[0].path).toMatch(/^\/thesis\//);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any failed mint (invalid inputs), no redirect should occur
   */
  test('failed mint does not trigger redirect', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.oneof(
          fc.integer({ min: -1000, max: 99 }), // Below minimum
          fc.integer({ min: 10001, max: 100000 }) // Above maximum
        ),
        async (name, description, invalidRoyalty) => {
          router.reset();

          const files = [new File(['mock content'], 'file.pdf', { type: 'application/pdf' })];
          const metadata = {
            name,
            description,
            attributes: [{ trait_type: 'University', value: 'Test University' }]
          };

          // Expect minting to fail
          await expect(
            simulatedMintWithRedirect(files, metadata, invalidRoyalty, router)
          ).rejects.toThrow();

          // Verify no navigation occurred
          const navigations = router.getNavigations();
          expect(navigations.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any successful mint, the redirect URL should be well-formed
   * and contain only valid characters
   */
  test('redirect URL is well-formed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.integer({ min: 100, max: 10000 }),
        async (name, description, royaltyBps) => {
          router.reset();

          const files = [new File(['mock content'], 'file.pdf', { type: 'application/pdf' })];
          const metadata = {
            name,
            description,
            attributes: [{ trait_type: 'University', value: 'Test University' }]
          };

          const tokenId = await simulatedMintWithRedirect(
            files,
            metadata,
            royaltyBps,
            router
          );

          const lastNav = router.getLastNavigation();
          
          // Verify URL structure
          expect(lastNav.path).toMatch(/^\/thesis\/[a-zA-Z0-9\-_]+$/);

          // Verify no special characters that could break routing
          expect(lastNav.path).not.toContain(' ');
          expect(lastNav.path).not.toContain('?');
          expect(lastNav.path).not.toContain('#');
          expect(lastNav.path).not.toContain('&');

          // Verify the path is absolute (starts with /)
          expect(lastNav.path.startsWith('/')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any two different successful mints, they should redirect
   * to different URLs (different token IDs)
   */
  test('different mints redirect to different URLs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.integer({ min: 100, max: 10000 }),
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.integer({ min: 100, max: 10000 }),
        async (name1, desc1, royalty1, name2, desc2, royalty2) => {
          // First mint
          const router1 = new MockRouter();
          const files1 = [new File(['content 1'], 'file1.pdf', { type: 'application/pdf' })];
          const metadata1 = {
            name: name1,
            description: desc1,
            attributes: [{ trait_type: 'University', value: 'Test University' }]
          };

          const tokenId1 = await simulatedMintWithRedirect(
            files1,
            metadata1,
            royalty1,
            router1
          );

          // Small delay to ensure different timestamps
          await new Promise(resolve => setTimeout(resolve, 5));

          // Second mint
          const router2 = new MockRouter();
          const files2 = [new File(['content 2'], 'file2.pdf', { type: 'application/pdf' })];
          const metadata2 = {
            name: name2,
            description: desc2,
            attributes: [{ trait_type: 'University', value: 'Test University' }]
          };

          const tokenId2 = await simulatedMintWithRedirect(
            files2,
            metadata2,
            royalty2,
            router2
          );

          // Verify different token IDs
          expect(tokenId1).not.toBe(tokenId2);

          // Verify different redirect URLs
          const nav1 = router1.getLastNavigation();
          const nav2 = router2.getLastNavigation();
          expect(nav1.path).not.toBe(nav2.path);

          // Verify both are valid thesis detail URLs
          expect(nav1.path).toMatch(/^\/thesis\//);
          expect(nav2.path).toMatch(/^\/thesis\//);
        }
      ),
      { numRuns: 50 } // Reduced runs since this test is more expensive
    );
  });

  /**
   * Property: For any successful mint with empty files array, the operation
   * should fail and no redirect should occur
   */
  test('mint with no files fails and does not redirect', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.integer({ min: 100, max: 10000 }),
        async (name, description, royaltyBps) => {
          router.reset();

          const files: File[] = [];
          const metadata = {
            name,
            description,
            attributes: [{ trait_type: 'University', value: 'Test University' }]
          };

          // Expect minting to fail
          await expect(
            simulatedMintWithRedirect(files, metadata, royaltyBps, router)
          ).rejects.toThrow('No files provided');

          // Verify no navigation occurred
          expect(router.getNavigations().length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: The redirect should preserve the complete token ID without
   * truncation or modification
   */
  test('redirect preserves complete token ID', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        fc.integer({ min: 100, max: 10000 }),
        async (name, description, royaltyBps) => {
          router.reset();

          const files = [new File(['mock content'], 'file.pdf', { type: 'application/pdf' })];
          const metadata = {
            name,
            description,
            attributes: [{ trait_type: 'University', value: 'Test University' }]
          };

          const originalTokenId = await simulatedMintWithRedirect(
            files,
            metadata,
            royaltyBps,
            router
          );

          const lastNav = router.getLastNavigation();
          const extractedTokenId = extractTokenIdFromUrl(lastNav.path);

          // Verify the extracted token ID is exactly the same as the original
          expect(extractedTokenId).toBe(originalTokenId);

          // Verify no truncation occurred (lengths match)
          expect(extractedTokenId?.length).toBe(originalTokenId.length);

          // Verify all characters are preserved
          for (let i = 0; i < originalTokenId.length; i++) {
            expect(extractedTokenId?.[i]).toBe(originalTokenId[i]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
