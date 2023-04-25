const nextConfig = {
  reactStrictMode: false,
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
