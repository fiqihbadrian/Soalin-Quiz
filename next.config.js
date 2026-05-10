/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdf-parse relies on Node's fs; ensure it runs server-side only
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
};

module.exports = nextConfig;
