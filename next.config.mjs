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
}

export default nextConfig
