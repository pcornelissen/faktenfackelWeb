# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Sitemap-Links liefern keine 404
- Location: tests/smoke.spec.ts:28:1

# Error details

```
Error: /quellen/allgemein/2-millionen-stimmen-gegen-afd/ sollte 200 liefern

expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | // ---------------------------------------------------------------------------
  4   | // 1. Startseite: plausible Inhalte
  5   | // ---------------------------------------------------------------------------
  6   | test('Startseite zeigt Artikel', async ({ page }) => {
  7   |   await page.goto('/')
  8   |   await expect(page.locator('h1, h2').first()).toBeVisible()
  9   |   // Mindestens ein Artikel-Link vorhanden
  10  |   const articleLinks = page.locator('a[href*="/faktenchecks/"], a[href*="/lagerfeuer/"]')
  11  |   await expect(articleLinks.first()).toBeVisible()
  12  |   const count = await articleLinks.count()
  13  |   expect(count).toBeGreaterThanOrEqual(2)
  14  | })
  15  | 
  16  | // ---------------------------------------------------------------------------
  17  | // 2. Sitemap: > 500 Zeilen, gueltige URLs
  18  | // ---------------------------------------------------------------------------
  19  | test('Sitemap hat > 500 Eintraege', async ({ request }) => {
  20  |   const res = await request.get('/sitemap.xml')
  21  |   expect(res.status()).toBe(200)
  22  |   const body = await res.text()
  23  |   const urls = body.match(/<loc>/g)
  24  |   expect(urls).not.toBeNull()
  25  |   expect(urls!.length).toBeGreaterThan(500)
  26  | })
  27  | 
  28  | test('Sitemap-Links liefern keine 404', async ({ request }) => {
  29  |   const res = await request.get('/sitemap.xml')
  30  |   const body = await res.text()
  31  |   const locMatches = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  32  | 
  33  |   // Stichprobe: je 2 aus verschiedenen Bereichen
  34  |   const samples: string[] = []
  35  |   for (const prefix of ['/faktenchecks/', '/lagerfeuer/', '/glossar/', '/quellen/']) {
  36  |     const matches = locMatches.filter(u => new URL(u).pathname.startsWith(prefix))
  37  |     samples.push(...matches.slice(0, 2))
  38  |   }
  39  |   expect(samples.length).toBeGreaterThanOrEqual(4)
  40  | 
  41  |   for (const url of samples) {
  42  |     const path = new URL(url).pathname
  43  |     const check = await request.get(path)
> 44  |     expect(check.status(), `${path} sollte 200 liefern`).toBe(200)
      |                                                          ^ Error: /quellen/allgemein/2-millionen-stimmen-gegen-afd/ sollte 200 liefern
  45  |   }
  46  | })
  47  | 
  48  | // ---------------------------------------------------------------------------
  49  | // 3. Faktenchecks-Seite: Artikel werden angezeigt
  50  | // ---------------------------------------------------------------------------
  51  | test('Faktenchecks-Uebersicht zeigt Beitraege', async ({ page }) => {
  52  |   await page.goto('/faktenchecks/')
  53  |   const articles = page.locator('a[href*="/faktenchecks/"]').filter({ hasNot: page.locator('nav a') })
  54  |   await expect(articles.first()).toBeVisible()
  55  | })
  56  | 
  57  | // ---------------------------------------------------------------------------
  58  | // 4. Lagerfeuer-Seite: Artikel werden angezeigt
  59  | // ---------------------------------------------------------------------------
  60  | test('Lagerfeuer-Uebersicht zeigt Beitraege', async ({ page }) => {
  61  |   await page.goto('/lagerfeuer/')
  62  |   const articles = page.locator('a[href*="/lagerfeuer/"]').filter({ hasNot: page.locator('nav a') })
  63  |   await expect(articles.first()).toBeVisible()
  64  | })
  65  | 
  66  | // ---------------------------------------------------------------------------
  67  | // 5. Navigation: Klick auf Artikel laed Detailseite (Client-Side)
  68  | // ---------------------------------------------------------------------------
  69  | test('Navigation zu Faktencheck-Artikel via Router', async ({ page }) => {
  70  |   await page.goto('/faktenchecks/')
  71  |   const firstArticle = page.locator('a[href*="/faktenchecks/"][href*="/"]').first()
  72  |   const href = await firstArticle.getAttribute('href')
  73  |   expect(href).toBeTruthy()
  74  |   await firstArticle.click()
  75  |   await page.waitForURL(/\/faktenchecks\//)
  76  |   await expect(page.locator('h1')).toBeVisible()
  77  |   const h1Text = await page.locator('h1').textContent()
  78  |   expect(h1Text!.trim().length).toBeGreaterThan(3)
  79  | })
  80  | 
  81  | test('Navigation zu Lagerfeuer-Artikel via Router', async ({ page }) => {
  82  |   await page.goto('/lagerfeuer/')
  83  |   const firstArticle = page.locator('a[href*="/lagerfeuer/"][href*="/"]').first()
  84  |   const href = await firstArticle.getAttribute('href')
  85  |   expect(href).toBeTruthy()
  86  |   await firstArticle.click()
  87  |   await page.waitForURL(/\/lagerfeuer\//)
  88  |   await expect(page.locator('h1')).toBeVisible()
  89  | })
  90  | 
  91  | // ---------------------------------------------------------------------------
  92  | // 6. Direkter Request: selbe URL wie Router-Navigation liefert 200
  93  | // ---------------------------------------------------------------------------
  94  | test('Artikel-URL funktioniert auch als direkter Request', async ({ page, request }) => {
  95  |   await page.goto('/faktenchecks/')
  96  |   const firstArticle = page.locator('a[href*="/faktenchecks/"][href*="/"]').first()
  97  |   const href = await firstArticle.getAttribute('href')
  98  |   expect(href).toBeTruthy()
  99  | 
  100 |   // Direkter HTTP-Request (kein Browser/Router)
  101 |   const directRes = await request.get(href!)
  102 |   expect(directRes.status()).toBe(200)
  103 |   const html = await directRes.text()
  104 |   expect(html).toContain('<h1')
  105 | })
  106 | 
  107 | test('Lagerfeuer-URL funktioniert auch als direkter Request', async ({ page, request }) => {
  108 |   await page.goto('/lagerfeuer/')
  109 |   const firstArticle = page.locator('a[href*="/lagerfeuer/"][href*="/"]').first()
  110 |   const href = await firstArticle.getAttribute('href')
  111 |   expect(href).toBeTruthy()
  112 | 
  113 |   const directRes = await request.get(href!)
  114 |   expect(directRes.status()).toBe(200)
  115 |   const html = await directRes.text()
  116 |   expect(html).toContain('<h1')
  117 | })
  118 | 
```