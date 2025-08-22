/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração de imagens
  images: {
    domains: ['oolqodaehouaidxuowtw.supabase.co'],
  },
  
  // Configuração para Render (suporta APIs)
  output: 'standalone',
  
  // Otimizações
  swcMinify: true,
}

export default nextConfig
