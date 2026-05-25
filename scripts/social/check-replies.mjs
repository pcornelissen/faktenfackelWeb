#!/usr/bin/env node
/**
 * Liest Antworten/Erwähnungen auf den Faktenfackel-Social-Kanälen aus.
 *
 * Holt Replies + Mentions (+ Quotes bei Bluesky) der letzten Tage, damit der
 * Scout mitbekommt, wenn Leute auf uns reagieren. Eigene Beiträge/Selbst-
 * antworten werden herausgefiltert.
 *
 * Usage:
 *   node scripts/social/check-replies.mjs            # letzte 3 Tage, Textausgabe
 *   node scripts/social/check-replies.mjs --days 7   # längeres Fenster
 *   node scripts/social/check-replies.mjs --json     # maschinenlesbar
 *
 * Env (aus .env.local): BLUESKY_HANDLE, BLUESKY_APP_PASSWORD,
 *                       MASTODON_INSTANCE, MASTODON_ACCESS_TOKEN
 *
 * X/Twitter wird NICHT abgedeckt (keine API) — dort per Browser auf der
 * eingeloggten Session prüfen.
 */

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// .env.local laden (ohne dotenv-Dependency, wie post-all.mjs)
const websiteDir = resolve(__dirname, '../..')
try {
  const envContent = await readFile(resolve(websiteDir, '.env.local'), 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\'')))
      val = val.slice(1, -1)
    if (!process.env[key]) process.env[key] = val
  }
} catch {
  // .env.local nicht vorhanden — weiter mit bestehenden env vars
}

const args = process.argv.slice(2)
const asJson = args.includes('--json')
const daysIdx = args.indexOf('--days')
const days = daysIdx !== -1 ? Number(args[daysIdx + 1]) : 3
if (!Number.isFinite(days) || days <= 0) {
  console.error('--days erwartet eine positive Zahl.')
  process.exit(1)
}
const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

function stripHtml(html) {
  return html
    .replace(/<\/(p|br)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text, max = 240) {
  const t = (text || '').replace(/\s+/g, ' ').trim()
  return t.length > max ? t.slice(0, max - 1) + '…' : t
}

async function checkBluesky() {
  const handle = process.env.BLUESKY_HANDLE || 'faktenfackel.bsky.social'
  const password = process.env.BLUESKY_APP_PASSWORD
  if (!password) return { platform: 'Bluesky', skipped: 'BLUESKY_APP_PASSWORD nicht gesetzt', items: [] }

  const session = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: handle, password }),
  }).then(r => r.json())

  if (session.error) return { platform: 'Bluesky', skipped: `Login fehlgeschlagen: ${session.error}`, items: [] }

  const auth = { Authorization: `Bearer ${session.accessJwt}` }
  const res = await fetch(
    'https://bsky.social/xrpc/app.bsky.notification.listNotifications?limit=100',
    { headers: auth },
  ).then(r => r.json())

  if (res.error) return { platform: 'Bluesky', skipped: `Abruf fehlgeschlagen: ${res.error}`, items: [] }

  const relevant = new Set(['reply', 'mention', 'quote'])
  const items = []
  for (const n of res.notifications || []) {
    if (!relevant.has(n.reason)) continue
    if (new Date(n.indexedAt).getTime() < cutoff) continue
    if (n.author?.handle === handle) continue // eigene Antworten ausschließen
    const rkey = n.uri.split('/').pop()
    items.push({
      reason: n.reason,
      author: n.author?.handle || n.author?.did || 'unbekannt',
      authorName: n.author?.displayName || '',
      date: n.indexedAt,
      text: truncate(n.record?.text || ''),
      url: `https://bsky.app/profile/${n.author?.handle || n.author?.did}/post/${rkey}`,
    })
  }
  items.sort((a, b) => new Date(b.date) - new Date(a.date))
  return { platform: 'Bluesky', items }
}

async function checkMastodon() {
  const instance = process.env.MASTODON_INSTANCE || 'https://mastodon.social'
  const token = process.env.MASTODON_ACCESS_TOKEN
  if (!token) return { platform: 'Mastodon', skipped: 'MASTODON_ACCESS_TOKEN nicht gesetzt', items: [] }

  // mention deckt Replies + direkte Erwähnungen ab
  const res = await fetch(
    `${instance}/api/v1/notifications?limit=80&types[]=mention`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) return { platform: 'Mastodon', skipped: `Abruf fehlgeschlagen: ${res.status}`, items: [] }
  const notifications = await res.json()

  const items = []
  for (const n of notifications) {
    if (n.type !== 'mention') continue
    if (new Date(n.created_at).getTime() < cutoff) continue
    items.push({
      reason: n.status?.in_reply_to_id ? 'reply' : 'mention',
      author: n.account?.acct || 'unbekannt',
      authorName: n.account?.display_name || '',
      date: n.created_at,
      text: truncate(stripHtml(n.status?.content || '')),
      url: n.status?.url || '',
    })
  }
  items.sort((a, b) => new Date(b.date) - new Date(a.date))
  return { platform: 'Mastodon', items }
}

const results = await Promise.all([checkBluesky(), checkMastodon()])

if (asJson) {
  console.log(JSON.stringify({ days, cutoff: new Date(cutoff).toISOString(), results }, null, 2))
  process.exit(0)
}

let total = 0
for (const r of results) {
  console.log(`\n=== ${r.platform} ===`)
  if (r.skipped) {
    console.log(`  übersprungen: ${r.skipped}`)
    continue
  }
  if (r.items.length === 0) {
    console.log(`  Keine Antworten/Erwähnungen in den letzten ${days} Tagen.`)
    continue
  }
  for (const it of r.items) {
    total += 1
    const who = it.authorName ? `${it.authorName} (@${it.author})` : `@${it.author}`
    console.log(`  [${it.reason}] ${it.date.slice(0, 10)} — ${who}`)
    console.log(`    "${it.text}"`)
    console.log(`    ${it.url}`)
  }
}
console.log(`\nGesamt: ${total} Antwort(en)/Erwähnung(en) in den letzten ${days} Tagen (ohne X/Twitter).`)
