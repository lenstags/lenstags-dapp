/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        protocol: 'https',
        hostname: '**'
      }
    ]
  }
};

module.exports = nextConfig;
