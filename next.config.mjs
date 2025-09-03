/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'vercel.app'],
    },
  },
  // Removido output: 'standalone' que pode causar problemas no Vercel
  // output: 'standalone',
}

export default nextConfig
