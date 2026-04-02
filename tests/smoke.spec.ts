import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// 1. Startseite: plausible Inhalte
// ---------------------------------------------------------------------------
test('Startseite zeigt Artikel', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1, h2').first()).toBeVisible()
  // Mindestens ein Artikel-Link vorhanden
  const articleLinks = page.locator('a[href*="/faktenchecks/"], a[href*="/lagerfeuer/"]')
  await expect(articleLinks.first()).toBeVisible()
  const count = await articleLinks.count()
  expect(count).toBeGreaterThanOrEqual(2)
})

// ---------------------------------------------------------------------------
// 2. Sitemap: > 500 Zeilen, gueltige URLs
// ---------------------------------------------------------------------------
test('Sitemap hat > 500 Eintraege', async ({ request }) => {
  const res = await request.get('/sitemap.xml')
  expect(res.status()).toBe(200)
  const body = await res.text()
  const urls = body.match(/<loc>/g)
  expect(urls).not.toBeNull()
  expect(urls!.length).toBeGreaterThan(500)
})

test('Sitemap-Links liefern keine 404', async ({ request }) => {
  const res = await request.get('/sitemap.xml')
  const body = await res.text()
  const locMatches = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])

  // Stichprobe: je 3 aus verschiedenen Bereichen
  const samples: string[] = []
  for (const prefix of ['/faktenchecks/', '/lagerfeuer/', '/glossar/', '/quellen/']) {
    const matches = locMatches.filter(u => new URL(u).pathname.startsWith(prefix))
    samples.push(...matches.slice(0, 3))
  }
  expect(samples.length).toBeGreaterThanOrEqual(4)

  const errors: string[] = []
  for (const url of samples) {
    const path = new URL(url).pathname
    const check = await request.get(path)
    if (check.status() !== 200) {
      errors.push(`${path} → ${check.status()}`)
    }
  }
  expect(errors, `Fehlerhafte Sitemap-URLs:\n${errors.join('\n')}`).toHaveLength(0)
})

// ---------------------------------------------------------------------------
// 3. Faktenchecks-Seite: Artikel werden angezeigt
// ---------------------------------------------------------------------------
test('Faktenchecks-Uebersicht zeigt Beitraege', async ({ page }) => {
  await page.goto('/faktenchecks/')
  const articles = page.locator('a[href*="/faktenchecks/"]').filter({ hasNot: page.locator('nav a') })
  await expect(articles.first()).toBeVisible()
})

// ---------------------------------------------------------------------------
// 4. Lagerfeuer-Seite: Artikel werden angezeigt
// ---------------------------------------------------------------------------
test('Lagerfeuer-Uebersicht zeigt Beitraege', async ({ page }) => {
  await page.goto('/lagerfeuer/')
  const articles = page.locator('a[href*="/lagerfeuer/"]').filter({ hasNot: page.locator('nav a') })
  await expect(articles.first()).toBeVisible()
})

// ---------------------------------------------------------------------------
// 5. Navigation: Klick auf Artikel laed Detailseite (Client-Side)
// ---------------------------------------------------------------------------
test('Navigation zu Faktencheck-Artikel via Router', async ({ page }) => {
  await page.goto('/faktenchecks/')
  const firstArticle = page.locator('a[href*="/faktenchecks/"][href*="/"]').first()
  const href = await firstArticle.getAttribute('href')
  expect(href).toBeTruthy()
  await firstArticle.click()
  await page.waitForURL(/\/faktenchecks\//)
  await expect(page.locator('h1')).toBeVisible()
  const h1Text = await page.locator('h1').textContent()
  expect(h1Text!.trim().length).toBeGreaterThan(3)
})

test('Navigation zu Lagerfeuer-Artikel via Router', async ({ page }) => {
  await page.goto('/lagerfeuer/')
  const firstArticle = page.locator('a[href*="/lagerfeuer/"][href*="/"]').first()
  const href = await firstArticle.getAttribute('href')
  expect(href).toBeTruthy()
  await firstArticle.click()
  await page.waitForURL(/\/lagerfeuer\//)
  await expect(page.locator('h1')).toBeVisible()
})

// ---------------------------------------------------------------------------
// 6. Direkter Request: selbe URL wie Router-Navigation liefert 200
// ---------------------------------------------------------------------------
test('Artikel-URL funktioniert auch als direkter Request', async ({ page, request }) => {
  await page.goto('/faktenchecks/')
  const firstArticle = page.locator('a[href*="/faktenchecks/"][href*="/"]').first()
  const href = await firstArticle.getAttribute('href')
  expect(href).toBeTruthy()

  // Direkter HTTP-Request (kein Browser/Router)
  const directRes = await request.get(href!)
  expect(directRes.status()).toBe(200)
  const html = await directRes.text()
  expect(html).toContain('<h1')
})

test('Lagerfeuer-URL funktioniert auch als direkter Request', async ({ page, request }) => {
  await page.goto('/lagerfeuer/')
  const firstArticle = page.locator('a[href*="/lagerfeuer/"][href*="/"]').first()
  const href = await firstArticle.getAttribute('href')
  expect(href).toBeTruthy()

  const directRes = await request.get(href!)
  expect(directRes.status()).toBe(200)
  const html = await directRes.text()
  expect(html).toContain('<h1')
})
