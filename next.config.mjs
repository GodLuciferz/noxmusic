/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pub-*.r2.dev', 'lh3.googleusercontent.com'],
    remotePatterns: [{ protocol: 'https', hostname: '**.r2.dev' }],
  },
};

export default nextConfig;
