// FF-19 Stufe 0: Hängt eine Build-Kennung (?v=<buildId>) an client-seitige
// Requests an die cachebaren Content-Routen. So bekommt jeder Deploy eigene
// Cloudflare-Cache-Keys — alte Antworten verfallen per TTL, kein manueller Purge.
// Nur Client (SSR-interne Fetches gehen nicht über den Edge). Die Route-Handler
// ignorieren das unbekannte `v` und verhalten sich unverändert.

const CACHED_API = /^\/api\/(content|references|search|graph)(\/|\?|$)/

export default defineNuxtPlugin(() => {
  const buildId = useRuntimeConfig().public.buildId
  if (!buildId) return

  const base = globalThis.$fetch
  globalThis.$fetch = base.create({
    onRequest({ request, options }) {
      const path = typeof request === 'string' ? request : (request as Request)?.url ?? ''
      if (CACHED_API.test(path)) {
        options.query = { ...(options.query as Record<string, unknown> | undefined), v: buildId }
      }
    },
  }) as typeof base
})
