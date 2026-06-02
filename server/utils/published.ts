// Zentral: steuert, ob publishedOn<=heute gefiltert wird. Auf dev (siteEnv='dev')
// werden Zukunfts-/Draft-Inhalte angezeigt -> Filter aus. KEINE App-Typen importieren.
export function isPreview(siteEnv: string | undefined): boolean {
  return siteEnv === 'dev'
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
