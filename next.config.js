/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['media.lenster.xyz', 'lens.infura-ipfs.io', 'images.unsplash.com'],
  },
}

module.exports = nextConfig
