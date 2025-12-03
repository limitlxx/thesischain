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
  webpack: (config, { isServer, webpack }) => {
    // Ignore test files from node_modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/test$/,
        contextRegExp: /thread-stream/,
      })
    );

    // Externalize problematic packages for server-side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pino-pretty', 'thread-stream', 'pino');
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
