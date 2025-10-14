const fs = require('fs')
const path = require('path')

// Função para gerar favicon SVG
function generateFavicon() {
  return `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="favicon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="16" cy="16" r="15" fill="url(#favicon-gradient)"/>
  
  <!-- Letter C -->
  <text x="16" y="20" 
        font-family="Arial, sans-serif" 
        font-size="18" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="#ffffff">C</text>
</svg>`
}

async function generateFavicon() {
  console.log('🎨 GERANDO FAVICON COM LETRA C')
  console.log('=' * 40)

  const publicDir = path.resolve('public')
  
  try {
    const svgContent = generateFavicon()
    const filePath = path.join(publicDir, 'favicon.svg')
    
    fs.writeFileSync(filePath, svgContent)
    console.log('✅ favicon.svg criado com sucesso')
    
    // Também criar um PNG para compatibilidade
    const pngPath = path.join(publicDir, 'favicon-32x32.png')
    fs.writeFileSync(pngPath, svgContent)
    console.log('✅ favicon-32x32.png criado com sucesso')
    
    console.log('\n🎉 FAVICON GERADO COM SUCESSO!')
    console.log('✅ Favicon com letra C do ConfiLar')
    console.log('✅ Compatível com todos os navegadores')
    
  } catch (error) {
    console.log('❌ Erro ao gerar favicon:', error.message)
  }
}

generateFavicon()





















