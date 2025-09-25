/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'vercel.app'],
    },
  },
  // Desabilitar prerendering para evitar erros de AuthContext
  // output: 'export',
  // trailingSlash: true,
  // Removido output: 'standalone' que pode causar problemas no Vercel
  // output: 'standalone',
}

export default nextConfig
