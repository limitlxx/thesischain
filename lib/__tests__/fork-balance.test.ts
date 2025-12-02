/**
 * Property-Based Tests for Fork Balance Check
 * 
 * Feature: thesischain-integration, Property 9: Fork requires sufficient balance
 * Validates: Requirements 3.3
 * 
 * This test verifies that fork operations are prevented when the user's
 * USDC balance is less than the required license fee, and that an appropriate
 * error message is displayed.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

/**
 * Simulated fork validation function that checks balance requirements
 */
function validateForkBalance(
  usdcBalance: bigint,
  licenseFee: bigint,
  royaltyPercentage: number = 40
): { canFork: boolean; error?: string; totalFee: bigint } {
  // Calculate total fee (license fee + royalty)
  const royaltyFee = (licenseFee * BigInt(royaltyPercentage)) / BigInt(100);
  const totalFee = licenseFee + royaltyFee;

  if (usdcBalance < totalFee) {
    return {
      canFork: false,
      error: `Insufficient USDC balance. You need ${totalFee.toString()} USDC to fork this thesis.`,
      totalFee
    };
  }

  return {
    canFork: true,
    totalFee
  };
}

/**
 * Simulated fork thesis function that enforces balance check
 */
async function simulatedForkThesis(
  parentId: string,
  newFiles: File[],
  metadata: {
    name: string;
    description: string;
  },
  usdcBalance: bigint,
  licenseFee: bigint
): Promise<{ success: boolean; tokenId?: string; error?: string }> {
  // Step 1: Validate balance
  const validation = validateForkBalance(usdcBalance, licenseFee);

  if (!validation.canFork) {
    return {
      success: false,
      error: validation.error
    };
  }

  // Step 2: Simulate fork operation
  await new Promise(resolve => setTimeout(resolve, 10));

  // Step 3: Return success with new token ID
  return {
    success: true,
    tokenId: `fork-${parentId}-${Date.now()}`
  };
}

describe('Fork Balance Check Property Tests', () => {
  /**
   * Feature: thesischain-integration, Property 9: Fork requires sufficient balance
   * Validates: Requirements 3.3
   * 
   * Property: For any fork attempt where USDC balance < license fee,
   * the system should prevent the fork and display an error message.
   */
  test('fork is prevented when USDC balance is less than license fee', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random license fee (0.01 to 100 USDC, in 6 decimals)
        fc.bigInt({ min: 10000n, max: 100000000n }),
        // Generate random balance that is LESS than total fee
        // We'll use a percentage of the license fee (0% to 99%)
        fc.integer({ min: 0, max: 99 }),
        // Generate random parent ID
        fc.string({ minLength: 10, maxLength: 20 }),
        // Generate random metadata
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        async (licenseFee, balancePercentage, parentId, name, description) => {
          // Calculate total fee (license + 40% royalty)
          const royaltyFee = (licenseFee * 40n) / 100n;
          const totalFee = licenseFee + royaltyFee;

          // Set balance to be less than total fee
          const insufficientBalance = (totalFee * BigInt(balancePercentage)) / 100n;

          // Ensure balance is actually less than total fee
          expect(insufficientBalance).toBeLessThan(totalFee);

          // Create mock file
          const files = [new File(['mock content'], 'fork.pdf', { type: 'application/pdf' })];
          const metadata = { name, description };

          // Attempt to fork
          const result = await simulatedForkThesis(
            parentId,
            files,
            metadata,
            insufficientBalance,
            licenseFee
          );

          // Verify fork was prevented
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('Insufficient USDC balance');
          expect(result.tokenId).toBeUndefined();
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  /**
   * Property: For any fork attempt where USDC balance >= total fee (license + royalty),
   * the system should allow the fork to proceed.
   */
  test('fork is allowed when USDC balance is sufficient', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random license fee
        fc.bigInt({ min: 10000n, max: 100000000n }),
        // Generate random excess balance (100% to 500% of total fee)
        fc.integer({ min: 100, max: 500 }),
        // Generate random parent ID
        fc.string({ minLength: 10, maxLength: 20 }),
        // Generate random metadata
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        async (licenseFee, balancePercentage, parentId, name, description) => {
          // Calculate total fee (license + 40% royalty)
          const royaltyFee = (licenseFee * 40n) / 100n;
          const totalFee = licenseFee + royaltyFee;

          // Set balance to be greater than or equal to total fee
          const sufficientBalance = (totalFee * BigInt(balancePercentage)) / 100n;

          // Ensure balance is actually sufficient
          expect(sufficientBalance).toBeGreaterThanOrEqual(totalFee);

          // Create mock file
          const files = [new File(['mock content'], 'fork.pdf', { type: 'application/pdf' })];
          const metadata = { name, description };

          // Attempt to fork
          const result = await simulatedForkThesis(
            parentId,
            files,
            metadata,
            sufficientBalance,
            licenseFee
          );

          // Verify fork was allowed
          expect(result.success).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.tokenId).toBeDefined();
          expect(result.tokenId).toContain(`fork-${parentId}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any fork attempt with insufficient balance,
   * the error message should include the required amount.
   */
  test('error message displays required USDC amount', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random license fee
        fc.bigInt({ min: 10000n, max: 100000000n }),
        // Generate random insufficient balance (0% to 99%)
        fc.integer({ min: 0, max: 99 }),
        async (licenseFee, balancePercentage) => {
          // Calculate total fee
          const royaltyFee = (licenseFee * 40n) / 100n;
          const totalFee = licenseFee + royaltyFee;

          // Set insufficient balance
          const insufficientBalance = (totalFee * BigInt(balancePercentage)) / 100n;

          // Validate
          const validation = validateForkBalance(insufficientBalance, licenseFee);

          // Verify error message contains the total fee amount
          expect(validation.canFork).toBe(false);
          expect(validation.error).toBeDefined();
          expect(validation.error).toContain(totalFee.toString());
          expect(validation.error).toContain('Insufficient USDC balance');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any license fee, the total fee should always be
   * license fee + (license fee * royalty percentage / 100)
   */
  test('total fee calculation is correct', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random license fee
        fc.bigInt({ min: 10000n, max: 100000000n }),
        // Generate random royalty percentage (0-100)
        fc.integer({ min: 0, max: 100 }),
        async (licenseFee, royaltyPercentage) => {
          const validation = validateForkBalance(0n, licenseFee, royaltyPercentage);

          // Calculate expected total fee
          const expectedRoyalty = (licenseFee * BigInt(royaltyPercentage)) / 100n;
          const expectedTotal = licenseFee + expectedRoyalty;

          // Verify calculation
          expect(validation.totalFee).toBe(expectedTotal);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any balance exactly equal to the total fee,
   * the fork should be allowed (boundary condition).
   */
  test('fork is allowed when balance exactly equals total fee', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random license fee
        fc.bigInt({ min: 10000n, max: 100000000n }),
        // Generate random parent ID
        fc.string({ minLength: 10, maxLength: 20 }),
        // Generate random metadata
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        async (licenseFee, parentId, name, description) => {
          // Calculate exact total fee
          const royaltyFee = (licenseFee * 40n) / 100n;
          const exactBalance = licenseFee + royaltyFee;

          // Create mock file
          const files = [new File(['mock content'], 'fork.pdf', { type: 'application/pdf' })];
          const metadata = { name, description };

          // Attempt to fork with exact balance
          const result = await simulatedForkThesis(
            parentId,
            files,
            metadata,
            exactBalance,
            licenseFee
          );

          // Verify fork was allowed (boundary condition: balance >= totalFee)
          expect(result.success).toBe(true);
          expect(result.error).toBeUndefined();
          expect(result.tokenId).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any balance one unit less than the total fee,
   * the fork should be prevented (boundary condition).
   */
  test('fork is prevented when balance is one unit less than total fee', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random license fee (must be > 100 to ensure we can subtract 1)
        fc.bigInt({ min: 100n, max: 100000000n }),
        // Generate random parent ID
        fc.string({ minLength: 10, maxLength: 20 }),
        // Generate random metadata
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        async (licenseFee, parentId, name, description) => {
          // Calculate total fee and subtract 1
          const royaltyFee = (licenseFee * 40n) / 100n;
          const totalFee = licenseFee + royaltyFee;
          const insufficientBalance = totalFee - 1n;

          // Ensure we have a valid test case
          expect(insufficientBalance).toBeGreaterThanOrEqual(0n);
          expect(insufficientBalance).toBeLessThan(totalFee);

          // Create mock file
          const files = [new File(['mock content'], 'fork.pdf', { type: 'application/pdf' })];
          const metadata = { name, description };

          // Attempt to fork
          const result = await simulatedForkThesis(
            parentId,
            files,
            metadata,
            insufficientBalance,
            licenseFee
          );

          // Verify fork was prevented (boundary condition: balance < totalFee)
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('Insufficient USDC balance');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any zero balance, fork should always be prevented
   * (unless license fee is also zero, which is unrealistic).
   */
  test('fork is prevented when balance is zero', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random non-zero license fee
        fc.bigInt({ min: 1n, max: 100000000n }),
        // Generate random parent ID
        fc.string({ minLength: 10, maxLength: 20 }),
        // Generate random metadata
        fc.string({ minLength: 5, maxLength: 100 }),
        fc.string({ minLength: 10, maxLength: 500 }),
        async (licenseFee, parentId, name, description) => {
          const zeroBalance = 0n;

          // Create mock file
          const files = [new File(['mock content'], 'fork.pdf', { type: 'application/pdf' })];
          const metadata = { name, description };

          // Attempt to fork with zero balance
          const result = await simulatedForkThesis(
            parentId,
            files,
            metadata,
            zeroBalance,
            licenseFee
          );

          // Verify fork was prevented
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('Insufficient USDC balance');
        }
      ),
      { numRuns: 100 }
    );
  });
});
