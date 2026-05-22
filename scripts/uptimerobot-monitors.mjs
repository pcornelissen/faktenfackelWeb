#!/usr/bin/env node
/**
 * UptimeRobot Monitore pausieren / fortsetzen
 *
 * Wird im Deploy-Workflow genutzt, um während des Container-Cutovers auf dem
 * Host kurzzeitig keine Falsch-Alarme (DOWN → UP) zu erzeugen. Pausiert bzw.
 * startet gezielt nur die Monitore mit einem bestimmten Tag (Default:
 * "faktenfackel"), damit andere Sites auf demselben Account (z.B. kiberblick)
 * unberührt bleiben.
 *
 * Die v3-API kennt keine Maintenance-Windows pro Monitor – nur accountweit.
 * Deshalb pausieren wir gezielt einzelne Monitore statt ein MW anzulegen.
 *
 * Usage:
 *   UPTIMEROBOT_API_KEY=... node scripts/uptimerobot-monitors.mjs pause
 *   UPTIMEROBOT_API_KEY=... node scripts/uptimerobot-monitors.mjs start
 *   ... pause --tag kiberblick
 *
 * Endpoints (v3, Bearer-Auth):
 *   GET  /monitors            → { data: [{ id, friendlyName, tags: [{name}] }] }
 *   POST /monitors/{id}/pause
 *   POST /monitors/{id}/start
 */

const API_BASE = 'https://api.uptimerobot.com/v3'

const action = process.argv[2]
const tagIdx = process.argv.indexOf('--tag')
const tag = tagIdx !== -1 ? process.argv[tagIdx + 1] : 'faktenfackel'

if (action !== 'pause' && action !== 'start') {
  console.error('Usage: uptimerobot-monitors.mjs <pause|start> [--tag <name>]')
  process.exit(2)
}

const apiKey = process.env.UPTIMEROBOT_API_KEY
if (!apiKey) {
  // Fehlender Key darf den Deploy nicht blockieren – nur warnen.
  console.warn('⚠ UPTIMEROBOT_API_KEY nicht gesetzt – überspringe Monitor-' + action + '.')
  process.exit(0)
}

const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
}

async function listMonitors() {
  const res = await fetch(`${API_BASE}/monitors?limit=100`, { headers })
  if (!res.ok) {
    throw new Error(`GET /monitors fehlgeschlagen: HTTP ${res.status} ${await res.text().catch(() => '')}`)
  }
  const json = await res.json()
  return json.data ?? []
}

async function setStatus(id, name) {
  const endpoint = action === 'pause' ? 'pause' : 'start'
  const res = await fetch(`${API_BASE}/monitors/${id}/${endpoint}`, {
    method: 'POST',
    headers,
    body: '{}',
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${await res.text().catch(() => '')}`)
  }
  console.log(`✓ ${action === 'pause' ? 'pausiert' : 'gestartet'}: ${name} (${id})`)
}

const monitors = (await listMonitors()).filter(m =>
  (m.tags ?? []).some(t => t?.name === tag),
)

if (monitors.length === 0) {
  console.warn(`⚠ Keine Monitore mit Tag "${tag}" gefunden – nichts zu tun.`)
  process.exit(0)
}

console.log(`${action === 'pause' ? 'Pausiere' : 'Starte'} ${monitors.length} Monitor(e) mit Tag "${tag}":`)

let failed = 0
for (const m of monitors) {
  const name = m.friendlyName ?? m.name ?? '?'
  try {
    await setStatus(m.id, name)
  } catch (err) {
    failed++
    console.error(`✗ ${name} (${m.id}): ${err.message}`)
  }
}

if (failed > 0) {
  console.error(`\n${failed} von ${monitors.length} Monitor(en) fehlgeschlagen.`)
  process.exit(1)
}

console.log(`\nFertig: ${monitors.length} Monitor(e) ${action === 'pause' ? 'pausiert' : 'gestartet'}.`)
