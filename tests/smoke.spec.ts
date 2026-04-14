import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Nur prerenderte Seiten testen — kein D1 nötig, kein Cold-Start-Problem
// Prerendered: /, /about, /faq, /impressum, /datenschutz, /mehr, /news
// ---------------------------------------------------------------------------

test('Startseite zeigt Artikel', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1, h2').first()).toBeVisible()
  // Mindestens ein Artikel-Link vorhanden (aus prerenderten Daten)
  const articleLinks = page.locator('a[href*="/faktenchecks/"], a[href*="/lagerfeuer/"]')
  await expect(articleLinks.first()).toBeVisible()
  const count = await articleLinks.count()
  expect(count).toBeGreaterThanOrEqual(2)
})

test('Startseite liefert 200', async ({ request }) => {
  const res = await request.get('/')
  expect(res.status()).toBe(200)
})

test('/about liefert 200 und hat Inhalt', async ({ request }) => {
  const res = await request.get('/about')
  expect(res.status()).toBe(200)
  const html = await res.text()
  expect(html).toContain('<h1')
})

test('/faq liefert 200', async ({ request }) => {
  const res = await request.get('/faq')
  expect(res.status()).toBe(200)
})

test('/impressum liefert 200', async ({ request }) => {
  const res = await request.get('/impressum')
  expect(res.status()).toBe(200)
})
