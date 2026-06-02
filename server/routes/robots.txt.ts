// Auf dev-Instanzen (siteEnv='dev') wird robots.txt durch "Disallow: /" ersetzt,
// damit Suchmaschinen den Preview-Container vollständig meiden.
// Auf prod wird der Inhalt der früheren public/robots.txt ausgeliefert (die statische
// Datei wurde entfernt, damit dieser Server-Route Vorrang hat -- Nitro-static-Files
// würden sonst den Handler überschreiben).
const PROD_ROBOTS = `User-agent: *
Allow: /
Disallow: /_admin/

# AI Bots -- explicitly allowed
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://faktenfackel.de/sitemap.xml
`

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  if (String(useRuntimeConfig(event).public.siteEnv ?? '') === 'dev') {
    return 'User-agent: *\nDisallow: /\n'
  }

  return PROD_ROBOTS
})
