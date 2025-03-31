import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in development
  productionBrowserSourceMaps: false,
  
  // Webpack configuration to handle Prisma warnings
  webpack: (config, { isServer }) => {
    // Ignore specific Prisma client warnings
    config.ignoreWarnings = [
      { 
        module: /node_modules\/@prisma\/client\/runtime\/edge\.js/,
        message: /Invalid source map/
      }
    ];

    // Important: Return the modified config
    return config;
  },
  
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // ES Modules compatibility
  experimental: {
    esmExternals: 'loose',
    // Add Prisma client to server components external packages
    serverComponentsExternalPackages: ['@prisma/client']
  }
};

export default nextConfig;