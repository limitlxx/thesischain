// .pnpmfile.cjs
// This file modifies dependencies during pnpm install to exclude test files

function readPackage(pkg, context) {
  // Remove test files from thread-stream package
  if (pkg.name === 'thread-stream') {
    pkg.files = pkg.files || [];
    // Exclude test directory
    if (!pkg.files.includes('!test')) {
      pkg.files.push('!test');
      pkg.files.push('!test/**');
      pkg.files.push('!*.test.js');
      pkg.files.push('!*.test.ts');
      pkg.files.push('!*.test.mjs');
    }
  }
  
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};
