#!/usr/bin/env node
/**
 * IndexNow submission script
 *
 * Ermittelt geänderte Seiten seit dem letzten Commit (oder einem angegebenen Ref)
 * und meldet die URLs an IndexNow (Bing, Yandex, etc.).
 *
 * Usage:
 *   pnpm indexnow                      # seit dem letzten Commit
 *   pnpm indexnow --since HEAD~5       # letzte 5 Commits
 *   pnpm indexnow --since 2026-03-01   # seit Datum
 *   pnpm indexnow --all                # komplette Sitemap einreichen
 */

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SITE_URL = 'https://faktenfackel.de'
const INDEXNOW_KEY = '0e97519e-1406-4765-887e-bdd0b75fc25b'
const INDEXNOW_HOST = 'api.indexnow.org'

// ─── Argumente parsen ──────────────────────────────────────────────────────
const args = process.argv.slice(2)
const sinceIdx = args.indexOf('--since')
const since = sinceIdx !== -1 ? args[sinceIdx + 1] : 'HEAD~1'
const submitAll = args.includes('--all')
const dryRun = args.includes('--dry-run')

// ─── Geänderte Dateien aus git holen ──────────────────────────────────────
function getChangedFiles() {
  if (submitAll) {
    // Alle Content-Dateien und Pages
    const out = execSync('git ls-files -- content/ app/pages/', { cwd: ROOT }).toString()
    return out.trim().split('\n').filter(Boolean)
  }
  try {
    const out = execSync(`git diff --name-only ${since} HEAD -- content/ app/pages/`, { cwd: ROOT }).toString()
    const staged = execSync('git diff --name-only --cached -- content/ app/pages/', { cwd: ROOT }).toString()
    return [...new Set([...out.trim().split('\n'), ...staged.trim().split('\n')])].filter(Boolean)
  } catch {
    console.error('Fehler beim git diff – läuft das Skript im richtigen Verzeichnis?')
    process.exit(1)
  }
}

// ─── Dateipfad → URL ───────────────────────────────────────────────────────
function fileToUrl(file) {
  // content/faktenchecks/kategorie/subkat/slug.md → /faktenchecks/kategorie/subkat/slug
  // content/lagerfeuer/kat/slug.md                → /lagerfeuer/kat/slug
  // content/glossar/slug.md                       → /glossar/slug
  // content/quellen/group/src/index.md            → /quellen/group/src
  // content/quellen/group/src/links/DATE.slug.md  → /quellen/group/src/links/slug
  // content/zitate/...                            → /zitate/...
  // app/pages/foo.vue                             → /foo  (index.vue → /)
  // app/pages/tags/[tag].vue                      → ignorieren (dynamisch)

  if (file.startsWith('app/pages/')) {
    const page = file.replace('app/pages/', '').replace(/\.vue$/, '')
    if (page.includes('[') || page.includes('...')) return null // dynamische Routen überspringen
    if (page === 'index') return SITE_URL + '/'
    return SITE_URL + '/' + page
  }

  if (!file.startsWith('content/')) return null
  const rel = file.replace('content/', '').replace(/\.md$/, '')
  const parts = rel.split('/')

  // Quellenlinks: quellen/group/source/links/DATE.slug → quellen/group/source/links/slug
  if (parts[0] === 'quellen' && parts[3] === 'links') {
    const slug = parts[4].replace(/^\d{8}\./, '') // Datums-Präfix entfernen
    return `${SITE_URL}/quellen/${parts[1]}/${parts[2]}/links/${slug}`
  }

  // Quellen index.md → /quellen/group/source
  if (parts[0] === 'quellen' && parts[parts.length - 1] === 'index') {
    return `${SITE_URL}/${parts.slice(0, -1).join('/')}`
  }

  // Zitate-Unterseiten: quellen/group/source/zitate/slug
  if (parts[0] === 'quellen' && parts[3] === 'zitate') {
    return `${SITE_URL}/quellen/${parts[1]}/${parts[2]}/zitate/${parts[4]}`
  }

  // Faktenchecks, Lagerfeuer, Glossar: index.md der Kategorie überspringen
  if (parts[parts.length - 1] === 'index' || parts[parts.length - 1] === '_info') {
    return null
  }

  return `${SITE_URL}/${rel}`
}

// ─── Batch einreichen ──────────────────────────────────────────────────────
async function submitUrls(urls) {
  const body = JSON.stringify({
    host: 'faktenfackel.de',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  })

  console.log(`\nEinreichen: ${urls.length} URL(s) an IndexNow`)
  if (dryRun) {
    console.log('[dry-run] POST https://' + INDEXNOW_HOST + '/indexnow')
    console.log(JSON.parse(body).urlList.join('\n'))
    return
  }

  const res = await fetch(`https://${INDEXNOW_HOST}/indexnow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  })

  if (res.ok || res.status === 200 || res.status === 202) {
    console.log(`✓ IndexNow akzeptiert (HTTP ${res.status})`)
  } else {
    const text = await res.text().catch(() => '')
    console.error(`✗ Fehler: HTTP ${res.status}`, text)
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
const changed = getChangedFiles()
console.log(`Geänderte Dateien (${submitAll ? 'alle' : `seit ${since}`}): ${changed.length}`)

const urls = [...new Set(
  changed
    .map(fileToUrl)
    .filter(Boolean),
)]

if (urls.length === 0) {
  console.log('Keine indexierbaren URLs gefunden.')
  process.exit(0)
}

console.log('URLs:')
urls.forEach(u => console.log(' ', u))

await submitUrls(urls)
