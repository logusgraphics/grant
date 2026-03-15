/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/example',
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
