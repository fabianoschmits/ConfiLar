/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuração da porta padrão
  env: {
    PORT: '3000',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'vercel.app'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Desabilitar prerendering para evitar erros de AuthContext
  // output: 'export',
  // trailingSlash: true,
  // Removido output: 'standalone' que pode causar problemas no Vercel
  // output: 'standalone',
}

export default nextConfig
