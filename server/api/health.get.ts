// Health endpoint used by Caddy upstream probes and by deploy.sh to gate
// blue-green swaps. Verifies that:
//   - the server is alive (trivially true if this handler runs)
//   - @nuxt/content can read the content collection (cheap query)
//   - the GraphDB driver is reachable (cheap PRAGMA)
//
// Returns 200 only when everything is healthy. Any failure returns 503 so
// Caddy stops sending traffic and the deploy script aborts the swap.

import { useGraphDb } from '~~/server/utils/graphDb'
import { queryCollection } from '@nuxt/content/server'

const APP_VERSION = process.env.APP_VERSION || 'unknown'
const APP_COLOR = process.env.APP_COLOR || 'unknown'

export default defineEventHandler(async (event) => {
  const checks = { content: 'unknown', graphdb: 'unknown' } as Record<string, string>

  // --- Content DB ---
  try {
    const row = await queryCollection(event, 'faktenchecks').limit(1).first()
    checks.content = row ? 'ok' : 'empty'
  } catch (err) {
    checks.content = err instanceof Error ? `error: ${err.message}` : 'error'
  }

  // --- Graph DB ---
  try {
    const db = await useGraphDb(event)
    const row = await db.prepare('SELECT 1 AS ok').first<{ ok: number }>()
    checks.graphdb = row?.ok === 1 ? 'ok' : 'unexpected'
  } catch (err) {
    checks.graphdb = err instanceof Error ? `error: ${err.message}` : 'error'
  }

  const ok = checks.content === 'ok' && checks.graphdb === 'ok'

  setHeader(event, 'Cache-Control', 'no-store')
  if (!ok) setResponseStatus(event, 503)

  return {
    ok,
    version: APP_VERSION,
    color: APP_COLOR,
    timestamp: new Date().toISOString(),
    ...checks,
  }
})
