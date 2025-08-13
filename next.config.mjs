/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep builds smooth on Vercel
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
