/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Ative apenas o necessário
    serverActions: {
      allowedOrigins: ['localhost:3000', 'vercel.app'],
    },
  },

  // Garante que a Vercel entenda o output
  output: 'standalone',

  // Evita problemas com pastas ( ) no app router
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Garante que parênteses não virem problema
      '(public)': '_public',
    }
    return config
  },
}

export default nextConfig
