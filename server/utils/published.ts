import { setHeader, type H3Event } from 'h3'

// Zentral: steuert, ob publishedOn<=heute gefiltert wird. Auf dev (siteEnv='dev')
// werden Zukunfts-/Draft-Inhalte angezeigt -> Filter aus. KEINE App-Typen importieren.
export function isPreview(siteEnv: string | undefined): boolean {
  return siteEnv === 'dev'
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

// Cache-Control fuer Content-/Such-Routen. Prod cacht aggressiv am Edge (liefert
// dort nur veroeffentlichten Content). Preview (dev) liefert unveroeffentlichten
// Content und darf daher NIE in einen geteilten Cache -> private/no-store.
export function setContentCache(event: H3Event, preview: boolean): void {
  setHeader(event, 'Cache-Control', preview
    ? 'private, no-store'
    : 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')
}
