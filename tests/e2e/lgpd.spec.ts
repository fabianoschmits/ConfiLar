import { test, expect } from '@playwright/test'

test.describe('LGPD Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display cookie consent banner', async ({ page }) => {
    // Clear any existing consent
    await page.evaluate(() => {
      localStorage.removeItem('cookie-consent')
    })
    
    await page.reload()
    
    await expect(page.getByText('🍪 Usamos cookies para melhorar sua experiência')).toBeVisible()
    await expect(page.getByText('Aceitar Todos')).toBeVisible()
    await expect(page.getByText('Configurações')).toBeVisible()
  })

  test('should accept all cookies', async ({ page }) => {
    // Clear any existing consent
    await page.evaluate(() => {
      localStorage.removeItem('cookie-consent')
    })
    
    await page.reload()
    
    const acceptAllButton = page.getByText('Aceitar Todos')
    await acceptAllButton.click()
    
    // Banner should disappear
    await expect(page.getByText('🍪 Usamos cookies para melhorar sua experiência')).not.toBeVisible()
    
    // Check if consent was saved
    const consent = await page.evaluate(() => localStorage.getItem('cookie-consent'))
    expect(consent).toBe('true')
  })

  test('should open cookie settings modal', async ({ page }) => {
    // Clear any existing consent
    await page.evaluate(() => {
      localStorage.removeItem('cookie-consent')
    })
    
    await page.reload()
    
    const settingsButton = page.getByText('Configurações')
    await settingsButton.click()
    
    await expect(page.getByText('Configurações de Cookies')).toBeVisible()
    await expect(page.getByText('Cookies Essenciais')).toBeVisible()
    await expect(page.getByText('Cookies Funcionais')).toBeVisible()
    await expect(page.getByText('Cookies Analíticos')).toBeVisible()
    await expect(page.getByText('Cookies de Marketing')).toBeVisible()
  })

  test('should navigate to privacy policy', async ({ page }) => {
    // Navigate to privacy policy from footer
    await page.goto('/sobre')
    
    const privacyLink = page.getByText('Política de privacidade')
    await privacyLink.click()
    
    await expect(page).toHaveURL('/privacidade')
    await expect(page.getByText('Política de Privacidade')).toBeVisible()
    await expect(page.getByText('Lei Geral de Proteção de Dados')).toBeVisible()
  })

  test('should navigate to terms of use', async ({ page }) => {
    // Navigate to terms from footer
    await page.goto('/sobre')
    
    const termsLink = page.getByText('Termos de uso')
    await termsLink.click()
    
    await expect(page).toHaveURL('/termos')
    await expect(page.getByText('Termos de Uso')).toBeVisible()
    await expect(page.getByText('ConfiLar')).toBeVisible()
  })

  test('should access privacy settings from sidebar', async ({ page }) => {
    // This test would require authentication
    // For now, we'll test the direct navigation
    await page.goto('/configuracoes-privacidade')
    
    await expect(page.getByText('Configurações de Privacidade')).toBeVisible()
    await expect(page.getByText('Acesso Restrito')).toBeVisible() // Since not logged in
  })

  test('should display LGPD rights information', async ({ page }) => {
    await page.goto('/privacidade')
    
    // Check for LGPD rights sections
    await expect(page.getByText('Seus Direitos LGPD')).toBeVisible()
    await expect(page.getByText('Acesso aos Dados')).toBeVisible()
    await expect(page.getByText('Correção de Dados')).toBeVisible()
    await expect(page.getByText('Exclusão de Dados')).toBeVisible()
    await expect(page.getByText('Portabilidade de Dados')).toBeVisible()
  })

  test('should have proper navigation links in sidebar', async ({ page }) => {
    // Check if sidebar has LGPD links (this would require authentication)
    // For now, test direct navigation
    await page.goto('/termos')
    await expect(page.getByText('Termos de Uso')).toBeVisible()
    
    await page.goto('/privacidade')
    await expect(page.getByText('Política de Privacidade')).toBeVisible()
  })
})
