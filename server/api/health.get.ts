// Health endpoint used by Caddy upstream probes and by deploy.sh to gate
// blue-green swaps. Verifies that:
//   - the server is alive (trivially true if this handler runs)
//   - @nuxt/content has seeded all collections (touches each one once,
//     forcing first-request seeding before Caddy switches traffic)
//   - the GraphDB driver is reachable (cheap PRAGMA)
//
// Returns 200 only when everything is healthy. Any failure returns 503 so
// Caddy stops sending traffic and the deploy script aborts the swap.

import { useGraphDb } from '~~/server/utils/graphDb'
import { queryCollection } from '@nuxt/content/server'

const APP_VERSION = process.env.APP_VERSION || 'unknown'
const APP_COLOR = process.env.APP_COLOR || 'unknown'

const COLLECTIONS = [
  'faktenchecks',
  'lagerfeuer',
  'glossar',
  'quellen',
  'quellenlinks',
  'zitate',
  'news',
  'themen',
] as const

export default defineEventHandler(async (event) => {
  const checks: Record<string, string> = { content: 'unknown', graphdb: 'unknown' }

  // --- Content DB: touch every collection so the SQLite gets fully seeded
  //     before Caddy is told to switch upstream. Otherwise the first
  //     request hitting /lagerfeuer etc. still pays the seed cost. ---
  try {
    const results = await Promise.allSettled(
      COLLECTIONS.map(c => queryCollection(event, c).limit(1).first()),
    )
    const failed = results
      .map((r, i) => ({ r, name: COLLECTIONS[i] }))
      .filter(({ r }) => r.status === 'rejected')
    if (failed.length === 0) {
      checks.content = 'ok'
    } else {
      const names = failed.map(({ name }) => name).join(',')
      checks.content = `error: failed=${names}`
    }
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
