/**
 * Property-Based Tests for File Type Validation
 * 
 * Feature: thesischain-integration, Property 4: File type validation accepts valid formats
 * Validates: Requirements 2.2
 * 
 * This test verifies that the file type validation correctly accepts valid file formats
 * (.pdf, .zip, .tar.gz, .mp4, .mov) and rejects invalid file types.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

/**
 * File type validation function extracted from step-one.tsx
 * This validates whether a file has an acceptable extension for a given upload type
 */
function validateFileType(file: File, type: "thesisPdf" | "sourceCode" | "demoVideo"): boolean {
  const validExtensions: Record<string, string[]> = {
    thesisPdf: ['.pdf'],
    sourceCode: ['.zip', '.tar.gz'],
    demoVideo: ['.mp4', '.mov']
  };

  const fileName = file.name.toLowerCase();
  const extensions = validExtensions[type];
  
  return extensions.some(ext => fileName.endsWith(ext));
}

/**
 * Helper function to create a mock File object with a given name
 */
function createMockFile(fileName: string): File {
  return new File(['mock content'], fileName, { type: 'application/octet-stream' });
}

describe('File Type Validation Property Tests', () => {
  /**
   * Feature: thesischain-integration, Property 4: File type validation accepts valid formats
   * Validates: Requirements 2.2
   * 
   * Property: For any file with a valid extension (.pdf for thesis, .zip/.tar.gz for code,
   * .mp4/.mov for video), the validation function should accept the file.
   */
  test('validates that .pdf files are accepted for thesis upload', () => {
    fc.assert(
      fc.property(
        // Generate random file names with .pdf extension
        fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.pdf`),
        (fileName) => {
          const file = createMockFile(fileName);
          const result = validateFileType(file, 'thesisPdf');
          
          // PDF files should always be accepted for thesis upload
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('validates that .zip files are accepted for source code upload', () => {
    fc.assert(
      fc.property(
        // Generate random file names with .zip extension
        fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.zip`),
        (fileName) => {
          const file = createMockFile(fileName);
          const result = validateFileType(file, 'sourceCode');
          
          // ZIP files should always be accepted for source code upload
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('validates that .tar.gz files are accepted for source code upload', () => {
    fc.assert(
      fc.property(
        // Generate random file names with .tar.gz extension
        fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.tar.gz`),
        (fileName) => {
          const file = createMockFile(fileName);
          const result = validateFileType(file, 'sourceCode');
          
          // TAR.GZ files should always be accepted for source code upload
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('validates that .mp4 files are accepted for demo video upload', () => {
    fc.assert(
      fc.property(
        // Generate random file names with .mp4 extension
        fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.mp4`),
        (fileName) => {
          const file = createMockFile(fileName);
          const result = validateFileType(file, 'demoVideo');
          
          // MP4 files should always be accepted for demo video upload
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('validates that .mov files are accepted for demo video upload', () => {
    fc.assert(
      fc.property(
        // Generate random file names with .mov extension
        fc.string({ minLength: 1, maxLength: 50 }).map(name => `${name}.mov`),
        (fileName) => {
          const file = createMockFile(fileName);
          const result = validateFileType(file, 'demoVideo');
          
          // MOV files should always be accepted for demo video upload
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: For any file with an invalid extension (not in the accepted list),
   * the validation function should reject the file.
   */
  test('validates that invalid file types are rejected for thesis upload', () => {
    fc.assert(
      fc.property(
        // Generate random file names with invalid extensions
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('.doc', '.docx', '.txt', '.jpg', '.png', '.zip', '.mp4', '.mov', '.avi', '.mkv'),
        (baseName, invalidExt) => {
          const fileName = `${baseName}${invalidExt}`;
          const file = createMockFile(fileName);
          const result = validateFileType(file, 'thesisPdf');
          
          // Non-PDF files should be rejected for thesis upload
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('validates that invalid file types are rejected for source code upload', () => {
    fc.assert(
      fc.property(
        // Generate random file names with invalid extensions
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('.pdf', '.doc', '.txt', '.jpg', '.png', '.mp4', '.mov', '.avi', '.exe'),
        (baseName, invalidExt) => {
          const fileName = `${baseName}${invalidExt}`;
          const file = createMockFile(fileName);
          const result = validateFileType(file, 'sourceCode');
          
          // Non-ZIP/TAR.GZ files should be rejected for source code upload
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('validates that invalid file types are rejected for demo video upload', () => {
    fc.assert(
      fc.property(
        // Generate random file names with invalid extensions
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('.pdf', '.doc', '.txt', '.jpg', '.png', '.zip', '.tar.gz', '.exe', '.avi'),
        (baseName, invalidExt) => {
          const fileName = `${baseName}${invalidExt}`;
          const file = createMockFile(fileName);
          const result = validateFileType(file, 'demoVideo');
          
          // Non-MP4/MOV files should be rejected for demo video upload
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: File validation should be case-insensitive.
   * Files with uppercase extensions should be treated the same as lowercase.
   */
  test('validates that file type checking is case-insensitive', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom(
          { ext: 'PDF', type: 'thesisPdf' as const, expected: true },
          { ext: 'pdf', type: 'thesisPdf' as const, expected: true },
          { ext: 'Pdf', type: 'thesisPdf' as const, expected: true },
          { ext: 'ZIP', type: 'sourceCode' as const, expected: true },
          { ext: 'zip', type: 'sourceCode' as const, expected: true },
          { ext: 'MP4', type: 'demoVideo' as const, expected: true },
          { ext: 'mp4', type: 'demoVideo' as const, expected: true },
          { ext: 'MOV', type: 'demoVideo' as const, expected: true },
          { ext: 'mov', type: 'demoVideo' as const, expected: true }
        ),
        (baseName, { ext, type, expected }) => {
          const fileName = `${baseName}.${ext}`;
          const file = createMockFile(fileName);
          const result = validateFileType(file, type);
          
          // Validation should be case-insensitive
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Files with multiple dots in the name should still validate correctly
   * based on the final extension.
   */
  test('validates files with multiple dots in filename', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
        fc.constantFrom(
          { ext: '.pdf', type: 'thesisPdf' as const, expected: true },
          { ext: '.zip', type: 'sourceCode' as const, expected: true },
          { ext: '.tar.gz', type: 'sourceCode' as const, expected: true },
          { ext: '.mp4', type: 'demoVideo' as const, expected: true },
          { ext: '.mov', type: 'demoVideo' as const, expected: true }
        ),
        (nameParts, { ext, type, expected }) => {
          // Create filename with multiple dots: "part1.part2.part3.pdf"
          const fileName = nameParts.join('.') + ext;
          const file = createMockFile(fileName);
          const result = validateFileType(file, type);
          
          // Should validate based on final extension
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Special case for .tar.gz - should be recognized as a valid extension
   * even though it contains a dot.
   */
  test('validates that .tar.gz is correctly recognized as a single extension', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (baseName) => {
          const fileName = `${baseName}.tar.gz`;
          const file = createMockFile(fileName);
          const result = validateFileType(file, 'sourceCode');
          
          // .tar.gz should be accepted as a valid source code archive
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Files ending with .tar (without .gz) should be rejected for source code
   * since only .tar.gz is in the valid extensions list.
   */
  test('validates that .tar files without .gz are rejected', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (baseName) => {
          const fileName = `${baseName}.tar`;
          const file = createMockFile(fileName);
          const result = validateFileType(file, 'sourceCode');
          
          // .tar alone should be rejected (only .tar.gz is valid)
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty or very short filenames with valid extensions should still be accepted.
   */
  test('validates files with minimal names but valid extensions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          { name: 'a.pdf', type: 'thesisPdf' as const, expected: true },
          { name: 'x.zip', type: 'sourceCode' as const, expected: true },
          { name: 'y.tar.gz', type: 'sourceCode' as const, expected: true },
          { name: 'z.mp4', type: 'demoVideo' as const, expected: true },
          { name: 'w.mov', type: 'demoVideo' as const, expected: true }
        ),
        ({ name, type, expected }) => {
          const file = createMockFile(name);
          const result = validateFileType(file, type);
          
          // Even minimal filenames should validate correctly
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All valid file types should be accepted when tested comprehensively.
   * This is a comprehensive test that validates all valid combinations.
   */
  test('comprehensive validation of all valid file type combinations', () => {
    const validCombinations = [
      { type: 'thesisPdf' as const, extensions: ['.pdf'] },
      { type: 'sourceCode' as const, extensions: ['.zip', '.tar.gz'] },
      { type: 'demoVideo' as const, extensions: ['.mp4', '.mov'] }
    ];

    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom(...validCombinations),
        (baseName, { type, extensions }) => {
          // Test each valid extension for this type
          extensions.forEach(ext => {
            const fileName = `${baseName}${ext}`;
            const file = createMockFile(fileName);
            const result = validateFileType(file, type);
            
            // All valid extensions should be accepted
            expect(result).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
