import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow images from external sources if needed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://blockchain-based-cyber-evidence-locker.onrender.com',
  },
}

export default nextConfig
