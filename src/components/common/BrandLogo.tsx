import Image from 'next/image'
import Link from 'next/link'

interface BrandLogoProps {
  width?: number
  height?: number
  withText?: boolean
  href?: string
  className?: string
}

export function BrandLogo({ width = 120, height = 32, withText = false, href, className }: BrandLogoProps) {
  const lightSrc = "/imagens/logo/Logo azul - sem fundo - horizontal.png"
  const darkSrc = "/imagens/logo/Logo branco - sem fundo - horizontal.png"

  // Calcular dimensões 2x para retina/high DPI displays
  const retinaWidth = width * 2
  const retinaHeight = height * 2

  const content = (
    <div className={`flex items-center ${className || ''}`}>
      {/* Logo claro */}
      <Image
        src={lightSrc}
        alt="ConfiLar"
        width={retinaWidth}
        height={retinaHeight}
        quality={95}
        priority
        sizes={`(max-width: 768px) ${width * 1.5}px, ${retinaWidth}px`}
        style={{
          width: `${width}px`,
          height: 'auto',
          maxWidth: '100%'
        }}
        className="block dark:hidden object-contain"
      />
      {/* Logo escuro */}
      <Image
        src={darkSrc}
        alt="ConfiLar"
        width={retinaWidth}
        height={retinaHeight}
        quality={95}
        priority
        sizes={`(max-width: 768px) ${width * 1.5}px, ${retinaWidth}px`}
        style={{
          width: `${width}px`,
          height: 'auto',
          maxWidth: '100%'
        }}
        className="hidden dark:block object-contain"
      />
      {withText && (
        <span className="ml-2 font-semibold text-gray-900 dark:text-white">ConfiLar</span>
      )}
    </div>
  )

  if (!href) return content
  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  )
}
