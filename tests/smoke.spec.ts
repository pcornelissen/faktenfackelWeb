import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Smoke Tests: laufen nach jedem Deploy gegen die Live-URL.
// Testen Erreichbarkeit, Content-Rendering, Feeds, SEO und Security-Headers.
// ---------------------------------------------------------------------------

// --- Statische Seiten (prerendert) -----------------------------------------

test.describe('Statische Seiten', () => {
  const pages = [
    { path: '/', name: 'Startseite' },
    { path: '/about/', name: 'About' },
    { path: '/faq/', name: 'FAQ' },
    { path: '/impressum/', name: 'Impressum' },
    { path: '/datenschutz/', name: 'Datenschutz' },
    { path: '/bewertungsmasstab/', name: 'Bewertungsmaßstab' },
    { path: '/kontakt/', name: 'Kontakt' },
    { path: '/mehr/', name: 'Mehr' },
  ]

  for (const { path, name } of pages) {
    test(`${name} (${path}) liefert 200`, async ({ request }) => {
      const res = await request.get(path)
      expect(res.status()).toBe(200)
    })
  }
})

test('Startseite zeigt Artikel-Links', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1, h2').first()).toBeVisible()
  const articleLinks = page.locator('a[href*="/faktenchecks/"], a[href*="/lagerfeuer/"]')
  await expect(articleLinks.first()).toBeVisible()
  const count = await articleLinks.count()
  expect(count).toBeGreaterThanOrEqual(2)
})

// --- Dynamische Content-Seiten (SSR, brauchen SQLite) ----------------------

test.describe('Content-Rendering', () => {
  test('Faktenchecks-Index liefert 200 mit Artikeln', async ({ page }) => {
    await page.goto('/faktenchecks/')
    await expect(page).toHaveTitle(/Faktencheck/i)
    const articles = page.locator('a[href*="/faktenchecks/"]')
    await expect(articles.first()).toBeVisible()
  })

  test('Lagerfeuer-Index liefert 200 mit Artikeln', async ({ page }) => {
    await page.goto('/lagerfeuer/')
    await expect(page).toHaveTitle(/Lagerfeuer/i)
    const articles = page.locator('a[href*="/lagerfeuer/"]')
    await expect(articles.first()).toBeVisible()
  })

  test('Glossar-Index liefert 200 mit Begriffen', async ({ page }) => {
    await page.goto('/glossar/')
    await expect(page).toHaveTitle(/Glossar/i)
    const terms = page.locator('a[href*="/glossar/"]')
    await expect(terms.first()).toBeVisible()
  })

  test('Quellen-Index liefert 200 mit Quellen', async ({ page }) => {
    await page.goto('/quellen/')
    await expect(page).toHaveTitle(/Quellen/i)
    const sources = page.locator('a[href*="/quellen/"]')
    await expect(sources.first()).toBeVisible()
  })

  test('Einzelner Faktencheck rendert Artikel-Body', async ({ page }) => {
    await page.goto('/faktenchecks/')
    // Artikel-Links haben mindestens 3 Segmente (z.B. /faktenchecks/politik/parteien/...)
    const articleLink = page.locator('a[href^="/faktenchecks/"]').filter({
      has: page.locator(':scope'),
      hasNot: page.locator(':scope[href$="/_payload.json"]'),
    })
    const allHrefs = await articleLink.evaluateAll(els =>
      els.map(el => el.getAttribute('href')!).filter(h => h.split('/').length > 3),
    )
    expect(allHrefs.length).toBeGreaterThan(0)
    await page.goto(allHrefs[0]!)
    expect(page.url()).toContain('/faktenchecks/')
    await expect(page.locator('article, main').first()).toBeVisible()
    const bodyText = await page.locator('article, main').first().textContent()
    expect(bodyText!.length).toBeGreaterThan(100)
  })

  test('Einzelne Quelle rendert Profil', async ({ page }) => {
    await page.goto('/quellen/')
    // Quellen-Links haben mindestens 3 Segmente (z.B. /quellen/politik/markus-soeder)
    const sourceLinks = page.locator('a[href^="/quellen/"]')
    const allHrefs = await sourceLinks.evaluateAll(els =>
      els.map(el => el.getAttribute('href')!).filter(h => h.split('/').length > 3),
    )
    expect(allHrefs.length).toBeGreaterThan(0)
    await page.goto(allHrefs[0]!)
    await expect(page.locator('h1').first()).toBeVisible()
  })
})

// --- Feeds -----------------------------------------------------------------

test.describe('Feeds', () => {
  test('RSS Feed liefert XML', async ({ request }) => {
    const res = await request.get('/feed.xml')
    expect(res.status()).toBe(200)
    const ct = res.headers()['content-type'] || ''
    expect(ct).toMatch(/xml/)
    const body = await res.text()
    expect(body).toContain('<rss')
    expect(body).toContain('<item>')
  })

  test('JSON Feed liefert JSON', async ({ request }) => {
    const res = await request.get('/feed.json')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.items).toBeDefined()
    expect(data.items.length).toBeGreaterThan(0)
  })

  test('Sitemap liefert XML', async ({ request }) => {
    const res = await request.get('/sitemap.xml')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain('<urlset')
  })
})

// --- SEO & Meta ------------------------------------------------------------

test.describe('SEO', () => {
  test('Startseite hat OG-Tags', async ({ page }) => {
    await page.goto('/')
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBeTruthy()
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(ogImage).toBeTruthy()
    expect(ogImage).toContain('http')
  })

  test('Startseite hat twitter:card', async ({ page }) => {
    await page.goto('/')
    const card = await page.locator('meta[name="twitter:card"]').getAttribute('content')
    expect(card).toBe('summary_large_image')
  })

  test('Faktencheck hat ClaimReview JSON-LD', async ({ page }) => {
    await page.goto('/faktenchecks/')
    const articleLinks = page.locator('a[href^="/faktenchecks/"]')
    const allHrefs = await articleLinks.evaluateAll(els =>
      els.map(el => el.getAttribute('href')!).filter(h => h.split('/').length > 3),
    )
    expect(allHrefs.length).toBeGreaterThan(0)
    await page.goto(allHrefs[0]!)
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    const hasClaimReview = jsonLd.some(t => t.includes('ClaimReview'))
    expect(hasClaimReview).toBe(true)
  })

  test('robots.txt existiert', async ({ request }) => {
    const res = await request.get('/robots.txt')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain('Sitemap:')
  })
})

// --- OG-Image-Rendering (dynamisch) ----------------------------------------

test.describe('OG-Image-Rendering', () => {
  // Faktencheck- und Quellenlink-Seiten erzeugen ihr Vorschaubild zur Laufzeit
  // unter /_og/d/ (Satori-Renderer im node-server). Die og:image-Meta-URL muss
  // tatsaechlich ein PNG liefern, sonst zeigen Facebook/X kein Vorschaubild.

  async function firstArticleHref(page: import('@playwright/test').Page, indexPath: string): Promise<string | null> {
    await page.goto(indexPath)
    const hrefs = await page.locator(`a[href^="${indexPath.replace(/\/$/, '')}"]`).evaluateAll(
      els => els.map(el => el.getAttribute('href')!).filter(h => h.split('/').length > 3),
    )
    return hrefs[0] ?? null
  }

  test('Faktencheck rendert dynamisches OG-Image (200, image/png)', async ({ page, request }) => {
    const href = await firstArticleHref(page, '/faktenchecks/')
    expect(href, 'kein Faktencheck-Artikel gefunden').toBeTruthy()
    await page.goto(href!)
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(ogImage, 'og:image fehlt').toBeTruthy()
    expect(ogImage, 'erwartet dynamische /_og/d/-URL').toContain('/_og/d/')

    // og:image ist eine absolute site.url-URL; gegen die getestete Origin
    // (baseURL) pruefen, damit wir denselben Server treffen, der die Seite lieferte.
    const ogPath = new URL(ogImage!).pathname
    const res = await request.get(ogPath)
    expect(res.status(), `OG-Image ${ogPath} lieferte ${res.status()}`).toBe(200)
    expect(res.headers()['content-type'] || '').toContain('image/png')
  })

  test('Quellenlink rendert dynamisches OG-Image (200, image/png)', async ({ page, request }) => {
    await page.goto('/quellen/')
    const sourceHrefs = await page.locator('a[href^="/quellen/"]').evaluateAll(
      els => els.map(el => el.getAttribute('href')!).filter(h => h.split('/').length > 3),
    )
    expect(sourceHrefs.length, 'keine Quelle gefunden').toBeGreaterThan(0)
    await page.goto(sourceHrefs[0]!)
    const linkHrefs = await page.locator('a[href*="/links/"]').evaluateAll(
      els => els.map(el => el.getAttribute('href')!),
    )
    expect(linkHrefs.length, 'kein Quellenlink gefunden').toBeGreaterThan(0)
    await page.goto(linkHrefs[0]!)
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(ogImage, 'og:image fehlt').toBeTruthy()
    expect(ogImage, 'erwartet dynamische /_og/d/-URL').toContain('/_og/d/')

    const ogPath = new URL(ogImage!).pathname
    const res = await request.get(ogPath)
    expect(res.status(), `OG-Image ${ogPath} lieferte ${res.status()}`).toBe(200)
    expect(res.headers()['content-type'] || '').toContain('image/png')
  })
})

// --- Security Headers ------------------------------------------------------

test.describe('Security Headers', () => {
  test('HSTS Header gesetzt', async ({ request }) => {
    const res = await request.get('/')
    const hsts = res.headers()['strict-transport-security']
    expect(hsts).toBeTruthy()
    expect(hsts).toContain('max-age')
  })

  test('X-Content-Type-Options gesetzt', async ({ request }) => {
    const res = await request.get('/')
    expect(res.headers()['x-content-type-options']).toBe('nosniff')
  })

  test('X-Frame-Options gesetzt', async ({ request }) => {
    const res = await request.get('/')
    expect(res.headers()['x-frame-options']).toBeTruthy()
  })

  test('Content-Security-Policy gesetzt', async ({ request }) => {
    const res = await request.get('/')
    const csp = res.headers()['content-security-policy']
    expect(csp).toBeTruthy()
    expect(csp).toContain('default-src')
  })
})

// --- Interne Referenzen (SourceRef, QuoteReference, QuelleRef) -------------

test.describe('Referenz-Integrität', () => {
  // Broken references rendern ein rotes Bug-Icon (i-lucide:bug) und die
  // CSS-Klasse "ref-missing". Der Test sammelt Stichproben aus allen
  // Content-Bereichen und prüft, ob unaufgelöste Referenzen vorliegen.

  async function collectArticleHrefs(page: import('@playwright/test').Page, indexPath: string, minSegments: number): Promise<string[]> {
    await page.goto(indexPath)
    return page.locator(`a[href^="${indexPath.replace(/\/$/, '')}"]`).evaluateAll(
      (els, min) => els.map(el => el.getAttribute('href')!).filter(h => h.split('/').length >= min),
      minSegments,
    )
  }

  async function checkBrokenRefs(page: import('@playwright/test').Page, hrefs: string[]): Promise<string[]> {
    const broken: string[] = []
    for (const href of hrefs) {
      await page.goto(href)
      const count = await page.locator('[class*="ref-missing"]').count()
      if (count > 0) broken.push(`${href} (${count} broken)`)
    }
    return broken
  }

  test('Faktenchecks: keine broken SourceRef/QuoteReference', async ({ page }) => {
    const hrefs = await collectArticleHrefs(page, '/faktenchecks/', 4)
    const broken = await checkBrokenRefs(page, hrefs.slice(0, 5))
    expect(broken, `Broken references:\n${broken.join('\n')}`).toEqual([])
  })

  test('Lagerfeuer: keine broken SourceRef/QuoteReference', async ({ page }) => {
    const hrefs = await collectArticleHrefs(page, '/lagerfeuer/', 4)
    const broken = await checkBrokenRefs(page, hrefs.slice(0, 5))
    expect(broken, `Broken references:\n${broken.join('\n')}`).toEqual([])
  })

  test('Quellenlinks: keine broken SourceRef/QuoteReference', async ({ page }) => {
    await page.goto('/quellen/')
    const sourceHrefs = await page.locator('a[href^="/quellen/"]').evaluateAll(
      els => els.map(el => el.getAttribute('href')!).filter(h => h.split('/').length >= 4),
    )
    if (sourceHrefs.length === 0) return
    await page.goto(sourceHrefs[0]!)
    const linkHrefs = await page.locator('a[href*="/links/"]').evaluateAll(
      els => els.map(el => el.getAttribute('href')!),
    )
    const broken = await checkBrokenRefs(page, linkHrefs.slice(0, 5))
    expect(broken, `Broken references:\n${broken.join('\n')}`).toEqual([])
  })
})

// --- Graph API -------------------------------------------------------------

test.describe('Graph API', () => {
  test('by-tags liefert Ergebnisse', async ({ request }) => {
    const res = await request.get('/api/graph/by-tags?tags=AfD&type=link')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.items.length).toBeGreaterThan(0)
    expect(data.items[0]).toHaveProperty('id')
  })

  test('tags-Index liefert Tag-Frequenzen', async ({ request }) => {
    const res = await request.get('/api/graph/tags')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.results.length).toBeGreaterThan(0)
    expect(data.results[0]).toHaveProperty('tag')
    expect(data.results[0]).toHaveProperty('count')
  })

  test('tag-Detail liefert Knoten', async ({ request }) => {
    const res = await request.get('/api/graph/tags/AfD')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.results.length).toBeGreaterThan(0)
    expect(data.results[0]).toHaveProperty('type')
  })

  test('referrers liefert Verweise', async ({ request }) => {
    const res = await request.get('/api/graph/referrers/correctiv')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.results).toBeDefined()
    expect(data.count).toBeGreaterThanOrEqual(0)
  })

  test('co-sourced-by liefert Co-Quellen', async ({ request }) => {
    const res = await request.get('/api/graph/co-sourced-by/correctiv')
    expect(res.status()).toBe(200)
    const data = await res.json()
    expect(data.results).toBeDefined()
    expect(data.count).toBeGreaterThanOrEqual(0)
  })
})

// --- Redirects & Error Handling --------------------------------------------

test.describe('Redirects & Fehlerseiten', () => {
  test('404 für nicht-existierende Seite', async ({ request }) => {
    const res = await request.get('/diese-seite-gibt-es-nicht-12345/', {
      maxRedirects: 0,
    })
    expect(res.status()).toBe(404)
  })

  test('Trailing Slash Redirect', async ({ request }) => {
    const res = await request.get('/about', { maxRedirects: 0 })
    const status = res.status()
    // Entweder 301/308 Redirect auf /about/ oder direkt 200
    expect([200, 301, 308]).toContain(status)
    if (status === 301 || status === 308) {
      const location = res.headers()['location']
      expect(location).toContain('/about/')
    }
  })
})
