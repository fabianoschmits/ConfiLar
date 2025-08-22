/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração mínima para Render
  images: {
    domains: ['oolqodaehouaidxuowtw.supabase.co'],
  },
  
  // Suprimir avisos durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Suprimir avisos de tipos durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configurações de resolução de módulos
  experimental: {
    esmExternals: true,
  },
  
  // Configurações de webpack para resolução
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': new URL('./src', import.meta.url).pathname,
    }
    return config
  },
}

export default nextConfig
