import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login form on auth page', async ({ page }) => {
    await page.goto('/auth')
    
    await expect(page.getByText('Entrar na sua conta')).toBeVisible()
    await expect(page.getByPlaceholder('Digite seu email')).toBeVisible()
    await expect(page.getByPlaceholder('Digite sua senha')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth')
    
    const loginButton = page.getByRole('button', { name: 'Entrar' })
    await loginButton.click()
    
    // Should show validation errors
    await expect(page.getByText('Email é obrigatório')).toBeVisible()
    await expect(page.getByText('Senha é obrigatória')).toBeVisible()
  })

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/auth')
    
    await page.getByPlaceholder('Digite seu email').fill('invalid-email')
    await page.getByPlaceholder('Digite sua senha').fill('password123')
    
    const loginButton = page.getByRole('button', { name: 'Entrar' })
    await loginButton.click()
    
    await expect(page.getByText('Email inválido')).toBeVisible()
  })

  test('should navigate to registration form', async ({ page }) => {
    await page.goto('/auth')
    
    const registerLink = page.getByText('Criar conta')
    await registerLink.click()
    
    await expect(page.getByText('Criar sua conta')).toBeVisible()
    await expect(page.getByPlaceholder('Digite seu nome completo')).toBeVisible()
  })

  test('should show password recovery link', async ({ page }) => {
    await page.goto('/auth')
    
    const forgotPasswordLink = page.getByText('Esqueceu sua senha?')
    await forgotPasswordLink.click()
    
    await expect(page.getByText('Recuperar senha')).toBeVisible()
    await expect(page.getByPlaceholder('Digite seu email')).toBeVisible()
  })
})
