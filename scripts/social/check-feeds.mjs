#!/usr/bin/env node
/**
 * Liest die Home-/Following-Timelines der Faktenfackel-Social-Kanäle aus.
 *
 * Anders als check-replies.mjs (Reaktionen AUF uns) zeigt dieses Skript, was
 * die Accounts posten, denen wir folgen — als proaktive Scout-Quelle. Damit der
 * Following-Feed nicht im Rauschen untergeht, wird nach Scout-Themen gefiltert;
 * Reposts und Zitate (aktive Amplifikation durch gefolgte Accounts) werden immer
 * gezeigt. Eigene Beiträge werden herausgefiltert.
 *
 * Usage:
 *   node scripts/social/check-feeds.mjs              # letzte 48 Stunden, Textausgabe
 *   node scripts/social/check-feeds.mjs --hours 24   # kürzeres Fenster
 *   node scripts/social/check-feeds.mjs --all        # ohne Themen-Filter, alles
 *   node scripts/social/check-feeds.mjs --json       # maschinenlesbar
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

// .env.local laden (ohne dotenv-Dependency, wie check-replies.mjs)
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
const noFilter = args.includes('--all')
const hoursIdx = args.indexOf('--hours')
const daysIdx = args.indexOf('--days')
let windowMs
if (hoursIdx !== -1) windowMs = Number(args[hoursIdx + 1]) * 60 * 60 * 1000
else if (daysIdx !== -1) windowMs = Number(args[daysIdx + 1]) * 24 * 60 * 60 * 1000
else windowMs = 48 * 60 * 60 * 1000
if (!Number.isFinite(windowMs) || windowMs <= 0) {
  console.error('--hours/--days erwartet eine positive Zahl.')
  process.exit(1)
}
const cutoff = Date.now() - windowMs

// Scout-Themen. Bewusst breit, aber fokussiert. Bei Bedarf hier erweitern.
// Wortgrenzen-Matching (siehe matchesTopic), damit z.B. "Klima" nicht in
// "Reklamation" trifft. Kleinschreibung genügt, Vergleich ist case-insensitive.
const TOPICS = [
  'afd', 'rechtsextrem', 'rechtsextremismus', 'neonazi', 'reichsbürger',
  'höcke', 'weidel', 'chrupalla', 'björn höcke', 'identitäre',
  'desinformation', 'desinfo', 'fake news', 'faktencheck', 'falschbehauptung',
  'propaganda', 'hetze', 'verschwörung', 'verschwörungs',
  'klima', 'klimawandel', 'klimaleugnung', 'klimakrise', 'erderwärmung',
  'migration', 'migrant', 'migranten', 'asyl', 'geflüchtete', 'abschiebung',
  'remigration', 'islam', 'muslim',
  'impf', 'corona', 'covid', 'pandemie', 'mrna',
  'correctiv', 'volksverpetzer', 'mimikama', 'faktenfinder',
  'pks', 'kriminalstatistik', 'statistik', 'studie',
  'bundestag', 'merz', 'söder', 'dobrindt', 'putin', 'russland',
  'querdenk', 'antisemit', 'rassismus', 'queer', 'csd', 'demokratie',
]

function matchesTopic(text) {
  if (noFilter) return true
  if (!text) return false
  const lower = text.toLowerCase()
  return TOPICS.some((t) => {
    // Mehrwort-Begriffe: einfache Teilstring-Suche.
    if (t.includes(' ')) return lower.includes(t)
    // Einzelwörter: Wortgrenze davor, Präfix-Treffer erlaubt (impf -> Impfung).
    const re = new RegExp(`(^|[^a-zäöüß])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
    return re.test(lower)
  })
}

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

function truncate(text, max = 260) {
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
  const items = []
  const seen = new Set()
  let cursor
  let stop = false

  for (let page = 0; page < 8 && !stop; page++) {
    const url = new URL('https://bsky.social/xrpc/app.bsky.feed.getTimeline')
    url.searchParams.set('limit', '100')
    if (cursor) url.searchParams.set('cursor', cursor)
    const res = await fetch(url, { headers: auth }).then(r => r.json())
    if (res.error) {
      if (items.length === 0) return { platform: 'Bluesky', skipped: `Abruf fehlgeschlagen: ${res.error}`, items: [] }
      break
    }
    cursor = res.cursor
    if (!res.feed || res.feed.length === 0) break

    for (const fi of res.feed) {
      const post = fi.post
      if (!post) continue
      const isRepost = fi.reason?.$type === 'app.bsky.feed.defs#reasonRepost'
      // Zeitpunkt: bei Repost zählt der Repost-Zeitpunkt, sonst der Post selbst.
      const ts = isRepost && fi.reason?.indexedAt ? fi.reason.indexedAt : post.indexedAt
      if (new Date(ts).getTime() < cutoff) {
        stop = true
        break
      }

      const author = post.author?.handle || post.author?.did || 'unbekannt'
      const reposter = isRepost ? (fi.reason?.by?.handle || fi.reason?.by?.did) : null
      // Eigene Beiträge/Reposts ausschließen.
      if (author === handle && !isRepost) continue
      if (reposter === handle) continue

      // Zitat erkennen (eingebetteter Record).
      const embed = post.record?.embed || post.embed
      const isQuote = !!embed && /app\.bsky\.embed\.record/.test(embed.$type || '')

      const text = post.record?.text || ''
      const kind = isRepost ? 'repost' : isQuote ? 'quote' : 'post'
      // Reposts/Zitate immer zeigen (kuratierte Amplifikation), Originale nur bei Themen-Treffer.
      if (kind === 'post' && !matchesTopic(text)) continue

      const rkey = post.uri.split('/').pop()
      const key = `${kind}:${post.uri}:${reposter || ''}`
      if (seen.has(key)) continue
      seen.add(key)

      items.push({
        kind,
        author,
        authorName: post.author?.displayName || '',
        repostedBy: reposter || '',
        date: ts,
        text: truncate(text),
        url: `https://bsky.app/profile/${author}/post/${rkey}`,
      })
    }
  }

  items.sort((a, b) => new Date(b.date) - new Date(a.date))
  return { platform: 'Bluesky', items }
}

async function checkMastodon() {
  const instance = process.env.MASTODON_INSTANCE || 'https://mastodon.social'
  const token = process.env.MASTODON_ACCESS_TOKEN
  if (!token) return { platform: 'Mastodon', skipped: 'MASTODON_ACCESS_TOKEN nicht gesetzt', items: [] }

  // Eigenes Handle bestimmen, um eigene Boosts/Posts auszuschließen.
  let ownAcct = ''
  try {
    const me = await fetch(`${instance}/api/v1/accounts/verify_credentials`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : null)
    ownAcct = me?.acct || ''
  } catch { /* ignore */ }

  const items = []
  const seen = new Set()
  let maxId
  let stop = false

  for (let page = 0; page < 8 && !stop; page++) {
    const url = new URL(`${instance}/api/v1/timelines/home`)
    url.searchParams.set('limit', '40')
    if (maxId) url.searchParams.set('max_id', maxId)
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      if (items.length === 0) return { platform: 'Mastodon', skipped: `Abruf fehlgeschlagen: ${res.status}`, items: [] }
      break
    }
    const statuses = await res.json()
    if (!Array.isArray(statuses) || statuses.length === 0) break
    maxId = statuses[statuses.length - 1].id

    for (const s of statuses) {
      const isBoost = !!s.reblog
      const ts = s.created_at // Boost-Zeitpunkt steht im Wrapper-Status
      if (new Date(ts).getTime() < cutoff) {
        stop = true
        break
      }

      const booster = isBoost ? (s.account?.acct || '') : ''
      if (ownAcct && booster === ownAcct) continue

      const inner = isBoost ? s.reblog : s
      const author = inner.account?.acct || 'unbekannt'
      if (ownAcct && !isBoost && author === ownAcct) continue

      const text = stripHtml(inner.content || '')
      const kind = isBoost ? 'boost' : 'post'
      if (kind === 'post' && !matchesTopic(text)) continue

      const key = `${kind}:${inner.url || inner.id}:${booster}`
      if (seen.has(key)) continue
      seen.add(key)

      items.push({
        kind,
        author,
        authorName: inner.account?.display_name || '',
        repostedBy: booster,
        date: ts,
        text: truncate(text),
        url: inner.url || '',
      })
    }
  }

  items.sort((a, b) => new Date(b.date) - new Date(a.date))
  return { platform: 'Mastodon', items }
}

const results = await Promise.all([checkBluesky(), checkMastodon()])
const hours = Math.round(windowMs / (60 * 60 * 1000))

if (asJson) {
  console.log(JSON.stringify({ hours, filtered: !noFilter, cutoff: new Date(cutoff).toISOString(), results }, null, 2))
  process.exit(0)
}

const kindLabel = { post: 'Thema', repost: 'Repost', quote: 'Zitat', boost: 'Boost' }
let total = 0
for (const r of results) {
  console.log(`\n=== ${r.platform} ===`)
  if (r.skipped) {
    console.log(`  übersprungen: ${r.skipped}`)
    continue
  }
  if (r.items.length === 0) {
    console.log(`  Keine relevanten Feed-Beiträge in den letzten ${hours} Stunden${noFilter ? '' : ' (Themen-Filter aktiv)'}.`)
    continue
  }
  for (const it of r.items) {
    total += 1
    const who = it.authorName ? `${it.authorName} (@${it.author})` : `@${it.author}`
    const via = it.repostedBy ? ` [via @${it.repostedBy}]` : ''
    console.log(`  [${kindLabel[it.kind] || it.kind}] ${it.date.slice(0, 10)} — ${who}${via}`)
    console.log(`    "${it.text}"`)
    console.log(`    ${it.url}`)
  }
}
console.log(`\nGesamt: ${total} Feed-Beiträge in den letzten ${hours} Stunden${noFilter ? '' : ' (Themen-Filter; Reposts/Zitate immer)'} (ohne X/Twitter).`)
