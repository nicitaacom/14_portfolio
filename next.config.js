/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    webpackBuildWorker: false,
  },
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
