/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração de imagens
  images: {
    domains: ['oolqodaehouaidxuowtw.supabase.co'],
    unoptimized: true, // Necessário para Netlify
  },
  
  // Configuração para Netlify
  output: 'export',
  trailingSlash: true,
  
  // Desabilitar funcionalidades que não funcionam no Netlify
  experimental: {
    appDir: false,
  },
}

export default nextConfig
