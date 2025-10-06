import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to home page', async ({ page }) => {
    await expect(page).toHaveURL('/')
    await expect(page.getByText('ConfiLar')).toBeVisible()
  })

  test('should navigate to about page', async ({ page }) => {
    const aboutLink = page.getByText('Sobre')
    await aboutLink.click()
    
    await expect(page).toHaveURL('/sobre')
    await expect(page.getByText('Sobre o ConfiLar')).toBeVisible()
  })

  test('should navigate to help page', async ({ page }) => {
    const helpLink = page.getByText('Ajuda')
    await helpLink.click()
    
    await expect(page).toHaveURL('/ajuda')
    await expect(page.getByText('Central de Ajuda')).toBeVisible()
  })

  test('should navigate to search page', async ({ page }) => {
    const searchLink = page.getByText('Buscar')
    await searchLink.click()
    
    await expect(page).toHaveURL('/buscar')
    await expect(page.getByText('Buscar Profissionais')).toBeVisible()
  })

  test('should navigate to classifieds page', async ({ page }) => {
    const classifiedsLink = page.getByText('Classificados')
    await classifiedsLink.click()
    
    await expect(page).toHaveURL('/classificados')
    await expect(page.getByText('Classificados')).toBeVisible()
  })

  test('should have responsive mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check if mobile menu button is visible
    const menuButton = page.locator('[data-testid="mobile-menu-button"]')
    if (await menuButton.isVisible()) {
      await menuButton.click()
      
      // Check if mobile menu is open
      const mobileMenu = page.locator('[data-testid="mobile-menu"]')
      await expect(mobileMenu).toBeVisible()
    }
  })

  test('should have working footer links', async ({ page }) => {
    await page.goto('/sobre')
    
    // Test footer links
    const privacyLink = page.getByText('Política de privacidade')
    await privacyLink.click()
    await expect(page).toHaveURL('/privacidade')
    
    await page.goBack()
    
    const termsLink = page.getByText('Termos de uso')
    await termsLink.click()
    await expect(page).toHaveURL('/termos')
  })

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/pagina-inexistente')
    
    // Should show 404 page
    await expect(page.getByText('Página não encontrada')).toBeVisible()
    await expect(page.getByText('Voltar ao início')).toBeVisible()
  })

  test('should have proper page titles', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/ConfiLar/)
    
    await page.goto('/sobre')
    await expect(page).toHaveTitle(/Sobre/)
    
    await page.goto('/ajuda')
    await expect(page).toHaveTitle(/Ajuda/)
  })

  test('should have proper meta descriptions', async ({ page }) => {
    await page.goto('/')
    
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content')
    
    const content = await metaDescription.getAttribute('content')
    expect(content).toBeTruthy()
    expect(content!.length).toBeGreaterThan(50)
  })
})
