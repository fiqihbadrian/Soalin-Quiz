import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ada package-lock.json di direktori induk, jadi root diarahkan ke proyek ini
  turbopack: { root: process.cwd() },
  // pdf-parse membaca berkas dari disk, jadi jangan ikut di-bundle
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
