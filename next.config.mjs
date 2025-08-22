/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para resolver problemas de favicon
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'image/x-icon',
          },
        ],
      },
    ]
  },
  
  // Configurações adicionais
  // experimental: {
  //   appDir: true, // Removido - não é mais necessário no Next.js 15
  // },
  
  // Configuração de imagens
  images: {
    domains: ['oolqodaehouaidxuowtw.supabase.co'],
  },
}

export default nextConfig
