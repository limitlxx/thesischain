/**
 * Property-Based Tests for Fork Parent Relationship
 * 
 * Feature: thesischain-integration, Property 10: Fork creates parent-child relationship
 * Validates: Requirements 3.8
 * 
 * This test verifies that when a fork operation is performed, the new IPNFT
 * has the original thesis ID in its parents array and that the parent-child
 * link is recorded correctly in both directions.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

/**
 * Simulated fork tree structure matching the ForkTracker contract
 */
interface ForkTree {
  parents: number[];
  children: number[];
  depth: number;
  exists: boolean;
}

/**
 * Simulated ForkTracker that manages parent-child relationships
 */
class SimulatedForkTracker {
  private forkTrees: Map<number, ForkTree> = new Map();
  private nextTokenId: number = 1000000;

  reset() {
    this.forkTrees.clear();
    this.nextTokenId = 1000000;
  }

  /**
   * Registers an existing thesis (original, not a fork)
   */
  registerThesis(tokenId: number): void {
    if (this.forkTrees.has(tokenId)) {
      throw new Error('Thesis already registered');
    }

    this.forkTrees.set(tokenId, {
      parents: [],
      children: [],
      depth: 0,
      exists: true
    });
  }

  /**
   * Creates a fork of an existing thesis
   */
  forkThesis(parentId: number, author: string, newUri: string): number {
    // Validate parent exists
    const parentTree = this.forkTrees.get(parentId);
    if (!parentTree) {
      throw new Error('Parent thesis must exist');
    }

    if (!newUri || newUri.length === 0) {
      throw new Error('URI cannot be empty');
    }

    // Generate new token ID
    const newTokenId = this.nextTokenId++;

    // Add this token as a child of parent
    parentTree.children.push(newTokenId);

    // Create fork tree for new token with parent relationship
    this.forkTrees.set(newTokenId, {
      parents: [parentId],
      children: [],
      depth: parentTree.depth + 1,
      exists: true
    });

    return newTokenId;
  }

  /**
   * Gets the parents of a thesis
   */
  getParents(tokenId: number): number[] {
    const tree = this.forkTrees.get(tokenId);
    if (!tree) {
      throw new Error('Thesis does not exist');
    }
    return [...tree.parents];
  }

  /**
   * Gets the children of a thesis
   */
  getChildren(tokenId: number): number[] {
    const tree = this.forkTrees.get(tokenId);
    if (!tree) {
      throw new Error('Thesis does not exist');
    }
    return [...tree.children];
  }

  /**
   * Gets the complete fork tree
   */
  getForkTree(tokenId: number): ForkTree {
    const tree = this.forkTrees.get(tokenId);
    if (!tree) {
      throw new Error('Thesis does not exist');
    }
    return { ...tree };
  }

  /**
   * Checks if a thesis is a fork (has parents)
   */
  isFork(tokenId: number): boolean {
    const tree = this.forkTrees.get(tokenId);
    if (!tree) return false;
    return tree.parents.length > 0;
  }

  /**
   * Gets the fork depth
   */
  getForkDepth(tokenId: number): number {
    const tree = this.forkTrees.get(tokenId);
    if (!tree) {
      throw new Error('Thesis does not exist');
    }
    return tree.depth;
  }
}

describe('Fork Parent Relationship Property Tests', () => {
  let tracker: SimulatedForkTracker;

  beforeEach(() => {
    tracker = new SimulatedForkTracker();
  });

  /**
   * Feature: thesischain-integration, Property 10: Fork creates parent-child relationship
   * Validates: Requirements 3.8
   * 
   * Property: For any successful fork operation, the new IPNFT should have
   * the original thesis ID in its parents array.
   */
  test('fork creates parent-child relationship with parent in parents array', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random parent token ID
        fc.integer({ min: 1, max: 999999 }),
        // Generate random author address
        fc.string({ minLength: 40, maxLength: 40 }),
        // Generate random IPFS URI
        fc.string({ minLength: 10, maxLength: 100 }).map(s => `ipfs://Qm${s}`),
        async (parentId, author, newUri) => {
          tracker.reset();

          // Register the parent thesis first
          tracker.registerThesis(parentId);

          // Fork the thesis
          const newTokenId = tracker.forkThesis(parentId, author, newUri);

          // Verify the new token has the parent in its parents array
          const parents = tracker.getParents(newTokenId);
          expect(parents).toHaveLength(1);
          expect(parents[0]).toBe(parentId);

          // Verify the parent has the new token in its children array
          const children = tracker.getChildren(parentId);
          expect(children).toContain(newTokenId);

          // Verify the new token is marked as a fork
          expect(tracker.isFork(newTokenId)).toBe(true);

          // Verify the parent is not marked as a fork (it's original)
          expect(tracker.isFork(parentId)).toBe(false);
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design doc
    );
  });

  /**
   * Property: For any fork operation, the parent-child link should be
   * recorded correctly in both directions (bidirectional relationship).
   */
  test('parent-child link is bidirectional', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 999999 }),
        fc.string({ minLength: 40, maxLength: 40 }),
        fc.string({ minLength: 10, maxLength: 100 }).map(s => `ipfs://Qm${s}`),
        async (parentId, author, newUri) => {
          tracker.reset();

          // Register parent
          tracker.registerThesis(parentId);

          // Fork the thesis
          const childId = tracker.forkThesis(parentId, author, newUri);

          // Verify bidirectional relationship
          const childParents = tracker.getParents(childId);
          const parentChildren = tracker.getChildren(parentId);

          // Child should have parent in its parents array
          expect(childParents).toContain(parentId);

          // Parent should have child in its children array
          expect(parentChildren).toContain(childId);

          // Verify consistency: if child lists parent, parent must list child
          for (const p of childParents) {
            const parentsChildren = tracker.getChildren(p);
            expect(parentsChildren).toContain(childId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any fork of a fork (multi-level), each level should
   * correctly record its immediate parent.
   */
  test('multi-level forks maintain correct parent relationships', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 999999 }),
        fc.string({ minLength: 40, maxLength: 40 }),
        fc.array(
          fc.string({ minLength: 10, maxLength: 100 }).map(s => `ipfs://Qm${s}`),
          { minLength: 2, maxLength: 5 }
        ),
        async (originalId, author, uris) => {
          tracker.reset();

          // Register original thesis
          tracker.registerThesis(originalId);

          let currentParentId = originalId;
          const tokenIds = [originalId];

          // Create a chain of forks
          for (const uri of uris) {
            const newTokenId = tracker.forkThesis(currentParentId, author, uri);
            tokenIds.push(newTokenId);

            // Verify this fork has correct parent
            const parents = tracker.getParents(newTokenId);
            expect(parents).toHaveLength(1);
            expect(parents[0]).toBe(currentParentId);

            // Verify depth increases by 1
            const depth = tracker.getForkDepth(newTokenId);
            const parentDepth = tracker.getForkDepth(currentParentId);
            expect(depth).toBe(parentDepth + 1);

            currentParentId = newTokenId;
          }

          // Verify the chain: each token (except original) should have exactly one parent
          for (let i = 1; i < tokenIds.length; i++) {
            const parents = tracker.getParents(tokenIds[i]);
            expect(parents).toHaveLength(1);
            expect(parents[0]).toBe(tokenIds[i - 1]);
          }

          // Verify the original has no parents
          const originalParents = tracker.getParents(originalId);
          expect(originalParents).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any thesis with multiple forks, each fork should
   * independently record the same parent.
   */
  test('multiple forks of same parent all record correct parent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 999999 }),
        fc.string({ minLength: 40, maxLength: 40 }),
        fc.array(
          fc.string({ minLength: 10, maxLength: 100 }).map(s => `ipfs://Qm${s}`),
          { minLength: 2, maxLength: 10 }
        ),
        async (parentId, author, uris) => {
          tracker.reset();

          // Register parent
          tracker.registerThesis(parentId);

          const forkIds: number[] = [];

          // Create multiple forks of the same parent
          for (const uri of uris) {
            const forkId = tracker.forkThesis(parentId, author, uri);
            forkIds.push(forkId);
          }

          // Verify each fork has the same parent
          for (const forkId of forkIds) {
            const parents = tracker.getParents(forkId);
            expect(parents).toHaveLength(1);
            expect(parents[0]).toBe(parentId);

            // Verify each fork has depth 1 (one level from original)
            expect(tracker.getForkDepth(forkId)).toBe(1);
          }

          // Verify parent has all forks in its children array
          const children = tracker.getChildren(parentId);
          expect(children).toHaveLength(forkIds.length);
          for (const forkId of forkIds) {
            expect(children).toContain(forkId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any fork operation, the fork depth should be
   * parent depth + 1.
   */
  test('fork depth is correctly calculated as parent depth plus one', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 999999 }),
        fc.string({ minLength: 40, maxLength: 40 }),
        fc.string({ minLength: 10, maxLength: 100 }).map(s => `ipfs://Qm${s}`),
        async (parentId, author, newUri) => {
          tracker.reset();

          // Register parent
          tracker.registerThesis(parentId);

          // Get parent depth (should be 0 for original)
          const parentDepth = tracker.getForkDepth(parentId);
          expect(parentDepth).toBe(0);

          // Fork the thesis
          const forkId = tracker.forkThesis(parentId, author, newUri);

          // Verify fork depth is parent depth + 1
          const forkDepth = tracker.getForkDepth(forkId);
          expect(forkDepth).toBe(parentDepth + 1);
          expect(forkDepth).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any original thesis (not a fork), it should have
   * zero parents and depth 0.
   */
  test('original thesis has no parents and depth zero', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 999999 }),
        async (tokenId) => {
          tracker.reset();

          // Register as original thesis
          tracker.registerThesis(tokenId);

          // Verify no parents
          const parents = tracker.getParents(tokenId);
          expect(parents).toHaveLength(0);

          // Verify depth is 0
          const depth = tracker.getForkDepth(tokenId);
          expect(depth).toBe(0);

          // Verify it's not marked as a fork
          expect(tracker.isFork(tokenId)).toBe(false);

          // Verify no children initially
          const children = tracker.getChildren(tokenId);
          expect(children).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any fork operation with invalid parent (non-existent),
   * the operation should fail and no relationship should be created.
   */
  test('fork fails when parent does not exist', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 999999 }),
        fc.string({ minLength: 40, maxLength: 40 }),
        fc.string({ minLength: 10, maxLength: 100 }).map(s => `ipfs://Qm${s}`),
        async (nonExistentParentId, author, newUri) => {
          tracker.reset();

          // Do NOT register the parent

          // Attempt to fork should fail
          expect(() => {
            tracker.forkThesis(nonExistentParentId, author, newUri);
          }).toThrow('Parent thesis must exist');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any fork operation with empty URI,
   * the operation should fail and no relationship should be created.
   */
  test('fork fails when URI is empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 999999 }),
        fc.string({ minLength: 40, maxLength: 40 }),
        async (parentId, author) => {
          tracker.reset();

          // Register parent
          tracker.registerThesis(parentId);

          // Attempt to fork with empty URI should fail
          expect(() => {
            tracker.forkThesis(parentId, author, '');
          }).toThrow('URI cannot be empty');

          // Verify parent still has no children
          const children = tracker.getChildren(parentId);
          expect(children).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any fork tree, the getForkTree method should return
   * complete and accurate information about parents, children, and depth.
   */
  test('getForkTree returns complete and accurate information', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 999999 }),
        fc.string({ minLength: 40, maxLength: 40 }),
        fc.string({ minLength: 10, maxLength: 100 }).map(s => `ipfs://Qm${s}`),
        async (parentId, author, newUri) => {
          tracker.reset();

          // Register parent
          tracker.registerThesis(parentId);

          // Fork the thesis
          const forkId = tracker.forkThesis(parentId, author, newUri);

          // Get fork tree for the fork
          const forkTree = tracker.getForkTree(forkId);

          // Verify all fields are correct
          expect(forkTree.exists).toBe(true);
          expect(forkTree.parents).toHaveLength(1);
          expect(forkTree.parents[0]).toBe(parentId);
          expect(forkTree.children).toHaveLength(0);
          expect(forkTree.depth).toBe(1);

          // Get fork tree for the parent
          const parentTree = tracker.getForkTree(parentId);

          // Verify parent tree
          expect(parentTree.exists).toBe(true);
          expect(parentTree.parents).toHaveLength(0);
          expect(parentTree.children).toHaveLength(1);
          expect(parentTree.children[0]).toBe(forkId);
          expect(parentTree.depth).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any complex fork tree (multiple levels and branches),
   * all parent-child relationships should be correctly maintained.
   */
  test('complex fork tree maintains all relationships correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 999999 }),
        fc.string({ minLength: 40, maxLength: 40 }),
        async (originalId, author) => {
          tracker.reset();

          // Register original
          tracker.registerThesis(originalId);

          // Create a complex tree:
          // Original -> Fork1, Fork2
          // Fork1 -> Fork1_1, Fork1_2
          // Fork2 -> Fork2_1

          const fork1 = tracker.forkThesis(originalId, author, 'ipfs://fork1');
          const fork2 = tracker.forkThesis(originalId, author, 'ipfs://fork2');
          const fork1_1 = tracker.forkThesis(fork1, author, 'ipfs://fork1_1');
          const fork1_2 = tracker.forkThesis(fork1, author, 'ipfs://fork1_2');
          const fork2_1 = tracker.forkThesis(fork2, author, 'ipfs://fork2_1');

          // Verify original has 2 direct children
          const originalChildren = tracker.getChildren(originalId);
          expect(originalChildren).toHaveLength(2);
          expect(originalChildren).toContain(fork1);
          expect(originalChildren).toContain(fork2);

          // Verify fork1 has 2 children
          const fork1Children = tracker.getChildren(fork1);
          expect(fork1Children).toHaveLength(2);
          expect(fork1Children).toContain(fork1_1);
          expect(fork1Children).toContain(fork1_2);

          // Verify fork2 has 1 child
          const fork2Children = tracker.getChildren(fork2);
          expect(fork2Children).toHaveLength(1);
          expect(fork2Children).toContain(fork2_1);

          // Verify depths
          expect(tracker.getForkDepth(originalId)).toBe(0);
          expect(tracker.getForkDepth(fork1)).toBe(1);
          expect(tracker.getForkDepth(fork2)).toBe(1);
          expect(tracker.getForkDepth(fork1_1)).toBe(2);
          expect(tracker.getForkDepth(fork1_2)).toBe(2);
          expect(tracker.getForkDepth(fork2_1)).toBe(2);

          // Verify all second-level forks have correct parents
          expect(tracker.getParents(fork1_1)[0]).toBe(fork1);
          expect(tracker.getParents(fork1_2)[0]).toBe(fork1);
          expect(tracker.getParents(fork2_1)[0]).toBe(fork2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
