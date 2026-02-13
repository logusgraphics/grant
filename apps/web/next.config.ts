import { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typedRoutes: true,
  transpilePackages: ['@grantjs/core', '@grantjs/schema'],
  webpack: (config, { isServer }) => {
    // @grantjs/core uses Node crypto (JWKS); not used in client. Stub for browser bundle.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
      };
    }
    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return [
      {
        source: '/storage/:path*',
        destination: `${apiUrl}/storage/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
export default withNextIntl(nextConfig);
