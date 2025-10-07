const fs = require('fs')
const path = require('path')

// Função para gerar favicon SVG simples
function generateSimpleFavicon() {
  return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="16" cy="16" r="15" fill="url(#gradient)"/>
  
  <!-- Letter C -->
  <text x="16" y="20" 
        font-family="Arial, sans-serif" 
        font-size="18" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="#ffffff">C</text>
</svg>`
}

async function createFavicon() {
  console.log('🎨 CRIANDO FAVICON SIMPLES COM LETRA C')
  
  const publicDir = path.resolve('public')
  
  try {
    const svgContent = generateSimpleFavicon()
    const filePath = path.join(publicDir, 'favicon.svg')
    
    fs.writeFileSync(filePath, svgContent)
    console.log('✅ favicon.svg criado com sucesso')
    
    console.log('\n🎉 FAVICON CRIADO COM SUCESSO!')
    console.log('✅ Favicon com letra C do ConfiLar')
    
  } catch (error) {
    console.log('❌ Erro ao criar favicon:', error.message)
  }
}

createFavicon()













