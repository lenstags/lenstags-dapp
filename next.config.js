/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "lens.infura-ipfs.io",
      "images.lens.phaver.com",
      "i.ibb.co",
      "media0.giphy.com",
      "media1.giphy.com",
      "media2.giphy.com ",
      "media3.giphy.com",
      "media4.giphy.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        protocol: "http",
        protocol: "ipfs",
        hostname: "**",
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
