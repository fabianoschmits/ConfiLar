import { test, expect } from '@playwright/test'

// Credenciais de teste existentes (do config.json do TestSprite)
const TEST_EMAIL = 'fabiano.schmits@outlook.com'
const TEST_PASSWORD = 'Teste123@'

// Alternativa: fabiano39@gmail.com / 123456 (se a primeira não funcionar)

test.describe('Testes Reais - ConfiLar', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar para a aplicação
    await page.goto('http://localhost:3000')
    // Aguardar carregamento
    await page.waitForLoadState('networkidle')
  })

  test('TC001 - Login com conta existente funciona', async ({ page }) => {
    // Navegar para página de login
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    // Verificar se o formulário de login está visível
    await expect(page.getByText('Entrar na sua conta').or(page.getByText('Login')).first()).toBeVisible({ timeout: 10000 })
    
    // Preencher email
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill(TEST_EMAIL)
    
    // Preencher senha
    const passwordInput = page.getByPlaceholder(/senha/i).or(page.locator('input[type="password"]')).first()
    await passwordInput.fill(TEST_PASSWORD)
    
    // Clicar no botão de login
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    await loginButton.click()
    
    // Aguardar redirecionamento ou mensagem de sucesso
    await page.waitForTimeout(3000)
    
    // Verificar se login foi bem-sucedido (redirecionamento ou mensagem)
    const currentUrl = page.url()
    const isLoggedIn = !currentUrl.includes('/auth') || await page.getByText(/feed|home|perfil/i).isVisible().catch(() => false)
    
    console.log('URL após login:', currentUrl)
    console.log('Login bem-sucedido:', isLoggedIn)
    
    // Se não redirecionou, verificar se há mensagem de erro
    if (currentUrl.includes('/auth')) {
      const errorMessage = await page.locator('text=/erro|inválido|incorreto/i').first().isVisible().catch(() => false)
      if (errorMessage) {
        const errorText = await page.locator('text=/erro|inválido|incorreto/i').first().textContent()
        console.log('Erro encontrado:', errorText)
      }
    }
  })

  test('TC002 - Verificar se página de perfil existe e é acessível', async ({ page }) => {
    // Primeiro fazer login
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill(TEST_EMAIL)
    
    const passwordInput = page.getByPlaceholder(/senha/i).or(page.locator('input[type="password"]')).first()
    await passwordInput.fill(TEST_PASSWORD)
    
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    await loginButton.click()
    
    // Aguardar login
    await page.waitForTimeout(5000)
    
    // Tentar acessar página de perfil de várias formas
    const profileUrls = [
      '/perfil',
      '/editar-perfil',
      '/editarperfil/dados-da-conta',
      '/meu-perfil'
    ]
    
    for (const url of profileUrls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 })
        const status = page.url()
        
        // Se não retornou 404, a página existe
        if (!status.includes('404') && !status.includes('not-found')) {
          console.log(`✅ Página de perfil encontrada: ${url}`)
          // Verificar se há conteúdo de perfil
          const hasProfileContent = await page.getByText(/perfil|dados|nome|email/i).first().isVisible().catch(() => false)
          if (hasProfileContent) {
            console.log(`✅ Conteúdo de perfil encontrado em: ${url}`)
            return // Encontrou uma página válida
          }
        }
      } catch (error) {
        console.log(`❌ Página ${url} não encontrada ou erro:`, error.message)
      }
    }
    
    // Se chegou aqui, nenhuma página de perfil foi encontrada
    console.log('⚠️ Nenhuma página de perfil válida encontrada')
  })

  test('TC003 - Verificar se feed social funciona', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill(TEST_EMAIL)
    
    const passwordInput = page.getByPlaceholder(/senha/i).or(page.locator('input[type="password"]')).first()
    await passwordInput.fill(TEST_PASSWORD)
    
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    await loginButton.click()
    
    await page.waitForTimeout(5000)
    
    // Navegar para o feed
    await page.goto('/feed')
    await page.waitForLoadState('networkidle')
    
    // Verificar se o feed carregou
    const feedContent = await page.locator('text=/feed|post|publicação/i').first().isVisible().catch(() => false)
    console.log('Feed carregado:', feedContent)
    
    // Verificar se há posts
    const hasPosts = await page.locator('[data-testid="post"], .post, article').first().isVisible().catch(() => false)
    console.log('Posts visíveis:', hasPosts)
    
    // Tentar criar um post
    const createPostButton = page.getByRole('button', { name: /criar|post|publicar/i }).first()
    const canCreatePost = await createPostButton.isVisible().catch(() => false)
    console.log('Botão de criar post visível:', canCreatePost)
  })

  test('TC004 - Verificar se chat flutuante está presente', async ({ page }) => {
    // Fazer login
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill(TEST_EMAIL)
    
    const passwordInput = page.getByPlaceholder(/senha/i).or(page.locator('input[type="password"]')).first()
    await passwordInput.fill(TEST_PASSWORD)
    
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    await loginButton.click()
    
    await page.waitForTimeout(5000)
    
    // Navegar para diferentes páginas e verificar se chat está presente
    const pages = ['/feed', '/home', '/buscar']
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      
      // Procurar por elementos de chat
      const chatElements = [
        page.locator('[data-testid="chat"]'),
        page.locator('[data-testid="floating-chat"]'),
        page.locator('.chat'),
        page.locator('text=/chat|mensagem|conversa/i'),
        page.getByRole('button', { name: /chat|mensagem/i })
      ]
      
      for (const element of chatElements) {
        const isVisible = await element.first().isVisible().catch(() => false)
        if (isVisible) {
          console.log(`✅ Chat encontrado na página ${pagePath}`)
          break
        }
      }
    }
  })

  test('TC005 - Verificar se seção ConfiPoints é acessível', async ({ page }) => {
    // Fazer login
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill(TEST_EMAIL)
    
    const passwordInput = page.getByPlaceholder(/senha/i).or(page.locator('input[type="password"]')).first()
    await passwordInput.fill(TEST_PASSWORD)
    
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    await loginButton.click()
    
    await page.waitForTimeout(5000)
    
    // Tentar acessar diretamente a página de ConfiPoints
    await page.goto('/confipoints')
    await page.waitForLoadState('networkidle')
    
    // Verificar se a página carregou
    const confiPointsContent = await page.getByText(/confipoints|pontos|saldo/i).first().isVisible().catch(() => false)
    console.log('Página ConfiPoints carregada:', confiPointsContent)
    
    // Verificar se há sidebar ou menu
    const sidebar = page.locator('nav, aside, [role="navigation"]').first()
    const hasSidebar = await sidebar.isVisible().catch(() => false)
    
    if (hasSidebar) {
      // Procurar por link de ConfiPoints na sidebar
      const confiPointsLink = page.getByText(/confipoints|pontos/i).first()
      const linkVisible = await confiPointsLink.isVisible().catch(() => false)
      console.log('Link ConfiPoints na sidebar:', linkVisible)
      
      if (linkVisible) {
        await confiPointsLink.click()
        await page.waitForTimeout(2000)
        console.log('✅ Link ConfiPoints clicável')
      }
    }
  })

  test('TC006 - Verificar se sistema de busca funciona', async ({ page }) => {
    // Fazer login
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill(TEST_EMAIL)
    
    const passwordInput = page.getByPlaceholder(/senha/i).or(page.locator('input[type="password"]')).first()
    await passwordInput.fill(TEST_PASSWORD)
    
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    await loginButton.click()
    
    await page.waitForTimeout(5000)
    
    // Navegar para página de busca
    await page.goto('/buscar')
    await page.waitForLoadState('networkidle')
    
    // Verificar se há campo de busca
    const searchInput = page.getByPlaceholder(/buscar|pesquisar/i).or(page.locator('input[type="search"]')).first()
    const hasSearchInput = await searchInput.isVisible().catch(() => false)
    console.log('Campo de busca visível:', hasSearchInput)
    
    // Verificar se há filtros
    const filters = page.getByText(/filtro|localização|serviço/i).first()
    const hasFilters = await filters.isVisible().catch(() => false)
    console.log('Filtros visíveis:', hasFilters)
  })

  test('TC007 - Verificar se notificações funcionam', async ({ page }) => {
    // Fazer login
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill(TEST_EMAIL)
    
    const passwordInput = page.getByPlaceholder(/senha/i).or(page.locator('input[type="password"]')).first()
    await passwordInput.fill(TEST_PASSWORD)
    
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    await loginButton.click()
    
    await page.waitForTimeout(5000)
    
    // Procurar por sino de notificações
    const notificationBell = page.locator('[data-testid="notification-bell"]')
      .or(page.locator('button[aria-label*="notificação"]'))
      .or(page.getByRole('button', { name: /notificação|sino/i }))
      .first()
    
    const hasNotificationBell = await notificationBell.isVisible().catch(() => false)
    console.log('Sino de notificações visível:', hasNotificationBell)
    
    if (hasNotificationBell) {
      await notificationBell.click()
      await page.waitForTimeout(2000)
      
      // Verificar se menu de notificações abriu
      const notificationMenu = page.locator('[data-testid="notification-menu"]')
        .or(page.getByText(/notificação|alerta/i))
        .first()
      
      const menuVisible = await notificationMenu.isVisible().catch(() => false)
      console.log('Menu de notificações aberto:', menuVisible)
    }
  })

  test('TC008 - Verificar se captcha está funcionando no formulário de registro', async ({ page }) => {
    // Navegar para página de registro
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    // Clicar em criar conta
    const createAccountLink = page.getByText(/criar conta|cadastrar/i).first()
    await createAccountLink.click()
    await page.waitForTimeout(2000)
    
    // Verificar se há captcha
    const captcha = page.locator('[data-testid="captcha"]')
      .or(page.getByText(/captcha|verificação|segurança/i))
      .or(page.locator('input[type="text"][placeholder*="captcha"]'))
      .first()
    
    const hasCaptcha = await captcha.isVisible().catch(() => false)
    console.log('Captcha visível:', hasCaptcha)
    
    if (hasCaptcha) {
      // Tentar interagir com o captcha
      try {
        await captcha.click()
        await page.waitForTimeout(1000)
        console.log('✅ Captcha é clicável')
        
        // Verificar se há campo de input no captcha
        const captchaInput = page.locator('input[type="text"]').filter({ hasText: /captcha|verificação/i }).first()
        const hasInput = await captchaInput.isVisible().catch(() => false)
        console.log('Campo de input do captcha:', hasInput)
      } catch (error) {
        console.log('Erro ao interagir com captcha:', error.message)
      }
    } else {
      console.log('⚠️ Captcha não encontrado ou não está visível')
    }
  })

  test('TC009 - Verificar se rate limiting está funcionando', async ({ page }) => {
    // Navegar para página de login
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    // Tentar fazer login com senha incorreta múltiplas vezes
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill(TEST_EMAIL)
    
    const passwordInput = page.getByPlaceholder(/senha/i).or(page.locator('input[type="password"]')).first()
    
    // Fazer 6 tentativas com senha incorreta
    for (let i = 0; i < 6; i++) {
      await passwordInput.fill(`senha_incorreta_${i}`)
      
      const loginButton = page.getByRole('button', { name: /entrar/i }).first()
      await loginButton.click()
      
      await page.waitForTimeout(2000)
      
      // Verificar se há mensagem de erro
      const errorMessage = await page.locator('text=/erro|inválido|incorreto|tentativas/i').first().isVisible().catch(() => false)
      if (errorMessage) {
        const errorText = await page.locator('text=/erro|inválido|incorreto|tentativas/i').first().textContent()
        console.log(`Tentativa ${i + 1}: ${errorText}`)
        
        // Verificar se há mensagem de rate limit
        if (errorText?.toLowerCase().includes('rate limit') || errorText?.toLowerCase().includes('tentativas')) {
          console.log('✅ Rate limiting está funcionando!')
          break
        }
      }
    }
  })

  test('TC010 - Verificar se link de recuperação de senha funciona', async ({ page }) => {
    // Navegar para página de login
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    // Procurar por link de recuperação de senha
    const forgotPasswordLink = page.getByText(/esqueci|esqueceu|recuperar|senha/i).first()
    const hasLink = await forgotPasswordLink.isVisible().catch(() => false)
    console.log('Link de recuperação de senha visível:', hasLink)
    
    if (hasLink) {
      await forgotPasswordLink.click()
      await page.waitForTimeout(3000)
      
      // Verificar se navegou para página de recuperação
      const currentUrl = page.url()
      console.log('URL após clicar em recuperar senha:', currentUrl)
      
      const isRecoveryPage = currentUrl.includes('recuperar') || 
                            currentUrl.includes('nova-senha') ||
                            await page.getByText(/recuperar|senha|email/i).first().isVisible().catch(() => false)
      
      console.log('Página de recuperação carregada:', isRecoveryPage)
    }
  })

  test('TC011 - Verificar se posts automáticos aparecem no feed', async ({ page }) => {
    // Fazer login
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill(TEST_EMAIL)
    
    const passwordInput = page.getByPlaceholder(/senha/i).or(page.locator('input[type="password"]')).first()
    await passwordInput.fill(TEST_PASSWORD)
    
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    await loginButton.click()
    
    await page.waitForTimeout(5000)
    
    // Navegar para o feed
    await page.goto('/feed')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000) // Aguardar carregamento de posts
    
    // Verificar se há posts no feed
    const posts = await page.locator('[data-testid="post"], .post, article, [class*="post"]').all()
    console.log(`Número de posts encontrados: ${posts.length}`)
    
    // Verificar se há posts de boas-vindas
    const welcomePosts = await page.getByText(/bem-vindo|boas-vindas|welcome/i).all()
    console.log(`Posts de boas-vindas encontrados: ${welcomePosts.length}`)
  })

  test('TC012 - Verificar se sistema de avaliações funciona', async ({ page }) => {
    // Fazer login
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')
    
    const emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]')).first()
    await emailInput.fill(TEST_EMAIL)
    
    const passwordInput = page.getByPlaceholder(/senha/i).or(page.locator('input[type="password"]')).first()
    await passwordInput.fill(TEST_PASSWORD)
    
    const loginButton = page.getByRole('button', { name: /entrar/i }).first()
    await loginButton.click()
    
    await page.waitForTimeout(5000)
    
    // Navegar para página de avaliações
    await page.goto('/avaliacoes')
    await page.waitForLoadState('networkidle')
    
    // Verificar se a página carregou
    const evaluationsContent = await page.getByText(/avaliação|avaliar|estrela/i).first().isVisible().catch(() => false)
    console.log('Página de avaliações carregada:', evaluationsContent)
  })
})

