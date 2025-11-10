import { test, expect } from '@playwright/test'

const TEST_EMAIL = 'fabiano.schmits@outlook.com'
const TEST_PASSWORD = 'Teste123@'

test.describe('Investigação de Problemas - Feed e Recuperação', () => {
  
  test('Problema 1: Feed timeout - Verificar autenticação', async ({ page }) => {
    console.log('🔍 Testando acesso ao feed sem autenticação...')
    
    // Tentar acessar feed sem login
    const response = await page.goto('http://localhost:3000/feed', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    }).catch(() => null)
    
    if (response) {
      console.log(`Status da resposta: ${response.status()}`)
      console.log(`URL final: ${page.url()}`)
      
      // Verificar se foi redirecionado para login
      if (page.url().includes('/auth') || page.url().includes('/login')) {
        console.log('✅ Feed requer autenticação - redirecionado para login')
      } else {
        console.log('⚠️ Feed não redirecionou para login')
      }
    }
    
    // Verificar se há mensagem de erro ou loading
    await page.waitForTimeout(2000)
    
    const hasError = await page.getByText(/erro|error|não autorizado/i).first().isVisible().catch(() => false)
    const hasLoading = await page.getByText(/carregando|loading/i).first().isVisible().catch(() => false)
    const hasAuthMessage = await page.getByText(/login|entrar|autenticar/i).first().isVisible().catch(() => false)
    
    console.log('Elementos na página:')
    console.log(`- Erro: ${hasError}`)
    console.log(`- Loading: ${hasLoading}`)
    console.log(`- Mensagem de auth: ${hasAuthMessage}`)
  })

  test('Problema 1: Feed timeout - Verificar com autenticação', async ({ page }) => {
    console.log('🔍 Testando acesso ao feed COM autenticação...')
    
    // Fazer login primeiro
    await page.goto('http://localhost:3000/auth')
    await page.waitForLoadState('domcontentloaded')
    
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first()
    await emailInput.fill(TEST_EMAIL)
    
    const passwordInput = page.locator('input[type="password"], input[placeholder*="senha" i]').first()
    await passwordInput.fill(TEST_PASSWORD)
    
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    await loginButton.click()
    
    // Aguardar login (não usar networkidle pois pode demorar)
    await page.waitForTimeout(5000)
    
    console.log(`URL após login: ${page.url()}`)
    
    // Tentar acessar feed
    console.log('Tentando acessar /feed...')
    const startTime = Date.now()
    
    try {
      await page.goto('http://localhost:3000/feed', { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      })
      
      const loadTime = Date.now() - startTime
      console.log(`✅ Feed carregou em ${loadTime}ms`)
      
      // Verificar se a página carregou
      await page.waitForTimeout(3000) // Aguardar carregamento de conteúdo
      
      const hasContent = await page.locator('body').textContent().then(t => t && t.length > 100).catch(() => false)
      console.log(`Página tem conteúdo: ${hasContent}`)
      
      // Verificar se há posts
      const hasPosts = await page.locator('[data-testid="post"], .post, article').first().isVisible({ timeout: 5000 }).catch(() => false)
      console.log(`Posts visíveis: ${hasPosts}`)
      
      // Verificar se há erro
      const hasError = await page.getByText(/erro|error/i).first().isVisible().catch(() => false)
      console.log(`Erro na página: ${hasError}`)
      
      // Verificar se está em loading
      const isLoading = await page.getByText(/carregando|loading/i).first().isVisible().catch(() => false)
      console.log(`Ainda carregando: ${isLoading}`)
      
    } catch (error) {
      const loadTime = Date.now() - startTime
      console.log(`❌ Timeout após ${loadTime}ms`)
      console.log(`Erro: ${error.message}`)
      
      // Tirar screenshot para debug
      await page.screenshot({ path: 'test-results/feed-timeout.png', fullPage: true })
    }
  })

  test('Problema 2: Link de recuperação - Verificar navegação', async ({ page }) => {
    console.log('🔍 Testando link de recuperação de senha...')
    
    await page.goto('http://localhost:3000/auth')
    await page.waitForLoadState('domcontentloaded')
    
    // Procurar link de recuperação
    const forgotPasswordLink = page.getByText(/esqueci|esqueceu|recuperar|senha/i).first()
    const linkExists = await forgotPasswordLink.isVisible({ timeout: 5000 }).catch(() => false)
    
    if (!linkExists) {
      console.log('❌ Link de recuperação não encontrado')
      return
    }
    
    console.log('✅ Link de recuperação encontrado')
    
    // Verificar se é um botão ou link
    const tagName = await forgotPasswordLink.evaluate(el => el.tagName.toLowerCase())
    console.log(`Tipo do elemento: ${tagName}`)
    
    // Verificar href se for link
    if (tagName === 'a') {
      const href = await forgotPasswordLink.getAttribute('href')
      console.log(`Href do link: ${href}`)
    }
    
    // Clicar no link
    console.log('Clicando no link...')
    const urlBefore = page.url()
    
    await forgotPasswordLink.click()
    
    // Aguardar navegação
    await page.waitForTimeout(3000)
    
    const urlAfter = page.url()
    console.log(`URL antes: ${urlBefore}`)
    console.log(`URL depois: ${urlAfter}`)
    
    // Verificar se navegou
    if (urlAfter !== urlBefore) {
      console.log('✅ Navegação ocorreu')
      
      // Verificar se está na página correta
      if (urlAfter.includes('recuperar') || urlAfter.includes('nova-senha') || urlAfter.includes('reset')) {
        console.log('✅ Navegou para página de recuperação')
      } else {
        console.log('⚠️ Navegou para página diferente do esperado')
      }
    } else {
      console.log('⚠️ Navegação não ocorreu - pode ser modal ou ação JavaScript')
      
      // Verificar se há modal aberto
      const hasModal = await page.locator('[role="dialog"], .modal, [data-testid="modal"]').first().isVisible().catch(() => false)
      console.log(`Modal aberto: ${hasModal}`)
      
      // Verificar se há formulário de recuperação na mesma página
      const hasRecoveryForm = await page.getByText(/recuperar|senha|email/i).first().isVisible().catch(() => false)
      console.log(`Formulário de recuperação visível: ${hasRecoveryForm}`)
    }
    
    // Verificar se há campo de email na página
    const hasEmailInput = await page.locator('input[type="email"]').first().isVisible().catch(() => false)
    console.log(`Campo de email presente: ${hasEmailInput}`)
  })

  test('Problema 2: Link de recuperação - Testar acesso direto', async ({ page }) => {
    console.log('🔍 Testando acesso direto à página de recuperação...')
    
    const response = await page.goto('http://localhost:3000/recuperar-senha', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    }).catch(() => null)
    
    if (response) {
      console.log(`Status: ${response.status()}`)
      
      if (response.status() === 200) {
        console.log('✅ Página de recuperação acessível')
        
        // Verificar se há formulário
        const hasForm = await page.locator('form').first().isVisible().catch(() => false)
        console.log(`Formulário presente: ${hasForm}`)
        
        // Verificar se há campo de email
        const hasEmailInput = await page.locator('input[type="email"]').first().isVisible().catch(() => false)
        console.log(`Campo de email presente: ${hasEmailInput}`)
        
        // Verificar se há botão de enviar
        const hasSubmitButton = await page.getByRole('button', { name: /enviar|recuperar|enviar email/i }).first().isVisible().catch(() => false)
        console.log(`Botão de enviar presente: ${hasSubmitButton}`)
      } else {
        console.log(`❌ Página retornou status ${response.status()}`)
      }
    } else {
      console.log('❌ Não foi possível carregar a página')
    }
  })

  test('Problema 1: Feed - Verificar queries do Supabase', async ({ page }) => {
    console.log('🔍 Monitorando requisições do feed...')
    
    // Fazer login
    await page.goto('http://localhost:3000/auth')
    await page.waitForLoadState('domcontentloaded')
    
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first()
    await emailInput.fill(TEST_EMAIL)
    
    const passwordInput = page.locator('input[type="password"], input[placeholder*="senha" i]').first()
    await passwordInput.fill(TEST_PASSWORD)
    
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    await loginButton.click()
    
    await page.waitForTimeout(5000)
    
    // Monitorar requisições de rede
    const requests: string[] = []
    const responses: string[] = []
    
    page.on('request', request => {
      const url = request.url()
      if (url.includes('supabase') || url.includes('feed') || url.includes('posts')) {
        requests.push(url)
        console.log(`📤 Request: ${url}`)
      }
    })
    
    page.on('response', response => {
      const url = response.url()
      if (url.includes('supabase') || url.includes('feed') || url.includes('posts')) {
        responses.push(`${response.status()} - ${url}`)
        console.log(`📥 Response: ${response.status()} - ${url}`)
      }
    })
    
    // Tentar acessar feed
    console.log('Acessando feed e monitorando requisições...')
    const startTime = Date.now()
    
    try {
      await page.goto('http://localhost:3000/feed', { 
        waitUntil: 'domcontentloaded',
        timeout: 20000 
      })
      
      // Aguardar algumas requisições
      await page.waitForTimeout(5000)
      
      const loadTime = Date.now() - startTime
      console.log(`\n📊 Resumo:`)
      console.log(`Tempo de carregamento: ${loadTime}ms`)
      console.log(`Requisições detectadas: ${requests.length}`)
      console.log(`Respostas recebidas: ${responses.length}`)
      
      if (requests.length === 0) {
        console.log('⚠️ Nenhuma requisição detectada - pode indicar problema de autenticação')
      }
      
      if (responses.some(r => r.includes('401') || r.includes('403'))) {
        console.log('❌ Requisições com erro de autenticação detectadas')
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`)
      console.log(`Requisições antes do erro: ${requests.length}`)
    }
  })
})

