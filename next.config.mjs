/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração de imagens
  images: {
    domains: ['oolqodaehouaidxuowtw.supabase.co'],
  },
  
  // Configuração para Render
  output: 'standalone',
  
  // Otimizações
  swcMinify: true,
}

export default nextConfig
