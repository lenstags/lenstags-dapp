const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**'
      },
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: '*'
          },
          {
            key: 'Content-Security-Policy',
            value:
              'connect-src *; frame-ancestors https://*.nata.social https://nata.social http://127.0.0.1:3000 localhost:3000 https://localhost:3000 https://verify.walletconnect.com'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
