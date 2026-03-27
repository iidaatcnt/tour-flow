import { test, expect } from '@playwright/test'

test.describe('認証フロー', () => {
  test('未ログインで / にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    // cookieを持たない状態でトップにアクセス
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('未ログインで /inquiries にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/inquiries')
    await expect(page).toHaveURL(/\/login/)
  })

  test('/login ページにログインフォームが表示される', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})
