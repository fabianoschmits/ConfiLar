'use client'

interface PWAIconProps {
  size?: number
  className?: string
}

export function PWAIcon({ size = 192, className = "" }: PWAIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 192 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fundo cinza */}
      <rect width="192" height="192" rx="24" fill="#9CA3AF" />
      
      {/* Duas mãos dadas em preto */}
      <g transform="translate(32, 48)">
        {/* Mão esquerda */}
        <path
          d="M40 48c-2.5-8-8-12-14-12-8 0-14 6-14 14 0 4 2 8 4 10l12 16c2 2 4 4 8 4s6-2 8-4c2-2 2-4 0-6l-8-8c-1-1-1-3 0-4 1-1 3-1 4 0l8 8c2 2 4 2 6 0s2-4 0-6l-8-8c-1-1-1-3 0-4 1-1 3-1 4 0l8 8c2 2 4 2 6 0s2-4 0-6l-8-8c-1-1-1-3 0-4 1-1 3-1 4 0l4 4"
          fill="#000000"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Mão direita */}
        <path
          d="M88 48c2.5-8 8-12 14-12 8 0 14 6 14 14 0 4-2 8-4 10l-12 16c-2 2-4 4-8 4s-6-2-8-4c-2-2-2-4 0-6l8-8c1-1 1-3 0-4-1-1-3-1-4 0l-8 8c-2 2-4 2-6 0s-2-4 0-6l8-8c1-1 1-3 0-4-1-1-3-1-4 0l-8 8c-2 2-4 2-6 0s-2-4 0-6l8-8c1-1 1-3 0-4-1-1-3-1-4 0l-4 4"
          fill="#000000"
          stroke="#000000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Conexão das mãos (aperto) */}
        <ellipse
          cx="64"
          cy="56"
          rx="12"
          ry="8"
          fill="#000000"
          opacity="0.8"
        />
        
        {/* Dedos entrelaçados */}
        <path
          d="M52 52c2 2 4 4 6 4s4-2 6-4M58 58c2 2 4 4 6 4s4-2 6-4M70 52c2 2 4 4 6 4s4-2 6-4"
          stroke="#9CA3AF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      
      {/* Texto "C" estilizado (opcional) */}
      <text
        x="96"
        y="140"
        textAnchor="middle"
        fill="#000000"
        fontSize="24"
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        C
      </text>
    </svg>
  )
}

// Componente para gerar PNG dos ícones
export function generatePWAIcons() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  const sizes = [192, 512]
  
  sizes.forEach(size => {
    canvas.width = size
    canvas.height = size
    
    if (ctx) {
      // Fundo cinza
      ctx.fillStyle = '#9CA3AF'
      ctx.fillRect(0, 0, size, size)
      
      // Aqui você pode adicionar a lógica para desenhar as mãos
      // Por simplicidade, vou usar um círculo com "C"
      ctx.fillStyle = '#000000'
      ctx.font = `${size/4}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('C', size/2, size/2)
    }
    
    // Converter para blob e download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `icon-${size}x${size}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  })
}




