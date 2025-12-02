/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Output standalone for better Vercel deployment
  output: 'standalone',
  // Externalize packages that cause bundling issues
  serverExternalPackages: [
    'pino',
    'pino-pretty',
    'thread-stream',
    '@walletconnect/logger',
  ],
  // Exclude diagnostic/test pages from production build
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
  // Ignore specific routes during build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].map(ext => {
    return ext;
  }),
  webpack: (config, { isServer, webpack }) => {
    // Ignore diagnostic and test pages
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/lib\/origin-auth-refresh$/,
      })
    );
    
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^rxdb/,
      })
    );

    // Ignore test files and non-JS files from node_modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test$/,
        contextRegExp: /thread-stream/,
      })
    );
    
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.(test|spec)\.(js|ts|mjs)$/,
      })
    );

    // Externalize problematic packages for server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pino-pretty', 'thread-stream', 'pino', 'rxdb');
    }

    // Fallback for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    return config;
  },
}

export default nextConfig
