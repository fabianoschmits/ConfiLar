/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração de imagens
  images: {
    domains: ['oolqodaehouaidxuowtw.supabase.co'],
  },
  
  // Configurações de build
  output: 'standalone',
  
  // Otimizações
  swcMinify: true,
}

export default nextConfig
