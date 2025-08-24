/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    WIFE_DASHBOARD_PASSCODE: process.env.WIFE_DASHBOARD_PASSCODE,
    LOCAL_MACHINE_WEBHOOK_URL: process.env.LOCAL_MACHINE_WEBHOOK_URL,
    LOCAL_MACHINE_API_KEY: process.env.LOCAL_MACHINE_API_KEY,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  
  // API route configuration
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health'
      }
    ];
  }
};

module.exports = nextConfig;