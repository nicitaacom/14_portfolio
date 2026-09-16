/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  logging: {
    incomingRequests: false, // or { ignore: [/\/api\/emails/, /\/api\/ai-decisions/] }
    serverFunctions: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    webpackBuildWorker: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
