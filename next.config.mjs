/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração de imagens
  images: {
    domains: ['oolqodaehouaidxuowtw.supabase.co'],
  },
  
  // Configuração para Render
  output: 'standalone',
  
  // Suprimir avisos durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Suprimir avisos de tipos durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Otimizações de build
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Configurações de webpack para otimização
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Otimizações para produção
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
}

export default nextConfig
