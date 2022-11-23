/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['media.lenster.xyz', 'lens.infura-ipfs.io'],
  },
}

module.exports = nextConfig
