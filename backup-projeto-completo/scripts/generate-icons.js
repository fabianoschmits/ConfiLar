const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Fundo cinza (#9CA3AF)
  ctx.fillStyle = '#9CA3AF'
  ctx.fillRect(0, 0, size, size)

  // Configurações baseadas no tamanho
  const scale = size / 192
  const centerX = size / 2
  const centerY = size / 2
  
  // Desenhar as duas mãos dadas em preto
  ctx.fillStyle = '#000000'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2 * scale
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Mão esquerda
  ctx.beginPath()
  ctx.moveTo(centerX - 32 * scale, centerY - 16 * scale)
  ctx.bezierCurveTo(
    centerX - 40 * scale, centerY - 24 * scale,
    centerX - 24 * scale, centerY - 32 * scale,
    centerX - 16 * scale, centerY - 20 * scale
  )
  ctx.bezierCurveTo(
    centerX - 8 * scale, centerY - 12 * scale,
    centerX - 4 * scale, centerY - 8 * scale,
    centerX - 8 * scale, centerY
  )
  ctx.bezierCurveTo(
    centerX - 12 * scale, centerY + 8 * scale,
    centerX - 20 * scale, centerY + 12 * scale,
    centerX - 28 * scale, centerY + 4 * scale
  )
  ctx.closePath()
  ctx.fill()

  // Mão direita
  ctx.beginPath()
  ctx.moveTo(centerX + 32 * scale, centerY - 16 * scale)
  ctx.bezierCurveTo(
    centerX + 40 * scale, centerY - 24 * scale,
    centerX + 24 * scale, centerY - 32 * scale,
    centerX + 16 * scale, centerY - 20 * scale
  )
  ctx.bezierCurveTo(
    centerX + 8 * scale, centerY - 12 * scale,
    centerX + 4 * scale, centerY - 8 * scale,
    centerX + 8 * scale, centerY
  )
  ctx.bezierCurveTo(
    centerX + 12 * scale, centerY + 8 * scale,
    centerX + 20 * scale, centerY + 12 * scale,
    centerX + 28 * scale, centerY + 4 * scale
  )
  ctx.closePath()
  ctx.fill()

  // Conexão das mãos (aperto de mão)
  ctx.beginPath()
  ctx.ellipse(centerX, centerY - 4 * scale, 16 * scale, 12 * scale, 0, 0, 2 * Math.PI)
  ctx.fill()

  // Dedos entrelaçados (detalhes)
  ctx.strokeStyle = '#9CA3AF'
  ctx.lineWidth = 1.5 * scale
  
  // Linha 1
  ctx.beginPath()
  ctx.moveTo(centerX - 8 * scale, centerY - 8 * scale)
  ctx.lineTo(centerX + 8 * scale, centerY - 8 * scale)
  ctx.stroke()
  
  // Linha 2
  ctx.beginPath()
  ctx.moveTo(centerX - 6 * scale, centerY)
  ctx.lineTo(centerX + 6 * scale, centerY)
  ctx.stroke()
  
  // Linha 3
  ctx.beginPath()
  ctx.moveTo(centerX - 4 * scale, centerY + 8 * scale)
  ctx.lineTo(centerX + 4 * scale, centerY + 8 * scale)
  ctx.stroke()

  // Texto "C" na parte inferior
  ctx.fillStyle = '#000000'
  ctx.font = `bold ${24 * scale}px system-ui, -apple-system, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('C', centerX, centerY + 44 * scale)

  return canvas
}

// Gerar ícones
const sizes = [192, 512]
const publicDir = path.join(__dirname, '..', 'public')

sizes.forEach(size => {
  const canvas = generateIcon(size)
  const buffer = canvas.toBuffer('image/png')
  const filename = `icon-${size}x${size}.png`
  const filepath = path.join(publicDir, filename)
  
  fs.writeFileSync(filepath, buffer)
  console.log(`✅ Ícone gerado: ${filename}`)
})

// Gerar favicon.ico (usando o ícone 192x192)
const canvas = generateIcon(32)
const buffer = canvas.toBuffer('image/png')
const faviconPath = path.join(publicDir, 'favicon.ico')
fs.writeFileSync(faviconPath, buffer)
console.log('✅ Favicon gerado: favicon.ico')

console.log('\n🎉 Todos os ícones PWA foram gerados com sucesso!')
console.log('📍 Localização: /public/')
console.log('📱 Tamanhos: 192x192, 512x512')
console.log('🎨 Estilo: Duas mãos dadas em preto com fundo cinza')




