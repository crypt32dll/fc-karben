import { expect, test } from '@playwright/test'

test.describe('Frontend smoke', () => {
  test('homepage shows club hero', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/FC Karben/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Leidenschaft/i)
  })

  test('mannschaft page has fussball.de link', async ({ page }) => {
    await page.goto('/1-mannschaft')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('1. Mannschaft')
    await expect(page.getByRole('link', { name: /Fussball\.de/i })).toBeVisible()
  })
})
