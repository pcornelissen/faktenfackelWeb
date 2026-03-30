#!/usr/bin/env node
/**
 * Orchestrator: Postet Social-Media-Drafts auf alle Plattformen.
 *
 * Usage:
 *   node scripts/social/post-all.mjs path/to/draft.md
 *   node scripts/social/post-all.mjs path/to/draft.md --only bluesky,mastodon
 *   node scripts/social/post-all.mjs path/to/draft.md --dry-run
 *
 * Liest Draft-Datei (Markdown mit Frontmatter), extrahiert plattformspezifische
 * Texte und postet sie via die einzelnen Posting-Scripts.
 */

import { readFile } from 'node:fs/promises'
import { execFile as execFileCb } from 'node:child_process'
import { promisify } from 'node:util'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFileCb)
const __dirname = dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
if (dryRun) args.splice(args.indexOf('--dry-run'), 1)

const onlyIdx = args.indexOf('--only')
let onlyPlatforms = null
if (onlyIdx !== -1) {
  onlyPlatforms = args[onlyIdx + 1].split(',').map(p => p.trim().toLowerCase())
  args.splice(onlyIdx, 2)
}

const draftPath = args[0]
if (!draftPath) {
  console.error('Usage: node scripts/social/post-all.mjs <draft.md> [--only plattformen] [--dry-run]')
  process.exit(1)
}

// Draft-Datei parsen
const content = await readFile(draftPath, 'utf-8')

// Frontmatter extrahieren
const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
if (!fmMatch) {
  console.error('Draft-Datei hat kein gueltiges Frontmatter.')
  process.exit(1)
}

const body = fmMatch[2]

// Frontmatter: image-Pfad extrahieren
const imageMatch = fmMatch[1].match(/^image:\s*(.+)$/m)
const imageName = imageMatch ? imageMatch[1].trim() : null
const draftDir = dirname(resolve(draftPath))
const imagePath = imageName ? resolve(draftDir, imageName) : null

// Plattform-Texte extrahieren (## Plattformname\nText bis naechstes ##)
function extractSection(name) {
  const regex = new RegExp(`^## ${name}\\n([\\s\\S]*?)(?=^## |$)`, 'm')
  const match = body.match(regex)
  return match ? match[1].trim() : null
}

const platforms = [
  { name: 'Bluesky', script: 'post-bluesky.mjs', supportsImage: true },
  { name: 'Mastodon', script: 'post-mastodon.mjs', supportsImage: true },
  { name: 'X/Twitter', script: 'post-twitter.mjs', supportsImage: false },
  { name: 'Facebook', script: 'post-facebook.mjs', supportsImage: true },
  { name: 'Instagram', script: 'post-instagram.mjs', supportsImage: true },
  { name: 'TikTok', script: 'post-tiktok.mjs', supportsImage: false },
]

const results = []

for (const platform of platforms) {
  if (onlyPlatforms && !onlyPlatforms.includes(platform.name.toLowerCase())) continue

  const text = extractSection(platform.name)
  if (!text) {
    console.log(`${platform.name}: Kein Text im Draft, uebersprungen.`)
    continue
  }

  const scriptPath = resolve(__dirname, platform.script)
  const scriptArgs = [scriptPath, text]
  if (platform.supportsImage && imagePath) {
    scriptArgs.push('--image', imagePath)
  }

  if (dryRun) {
    console.log(`[DRY RUN] ${platform.name}: ${text.substring(0, 80)}...`)
    results.push({ platform: platform.name, status: 'dry-run' })
    continue
  }

  try {
    const { stdout } = await execFileAsync('node', scriptArgs, {
      env: process.env,
      timeout: 30000,
    })
    console.log(stdout.trim())
    results.push({ platform: platform.name, status: 'ok', url: stdout.trim() })
  }
  catch (err) {
    const errorMsg = err.stderr || err.message
    console.error(`${platform.name}: FEHLER - ${errorMsg}`)
    results.push({ platform: platform.name, status: 'error', error: errorMsg })
  }
}

// YouTube-Hinweis (immer manuell)
const ytText = extractSection('YouTube')
if (ytText && (!onlyPlatforms || onlyPlatforms.includes('youtube'))) {
  console.log('')
  console.log('YouTube Community Post (manuell):')
  console.log('---')
  console.log(ytText)
  console.log('---')
}

// Zusammenfassung
console.log('')
console.log('Ergebnis:')
for (const r of results) {
  const icon = r.status === 'ok' ? 'OK' : r.status === 'dry-run' ? 'DRY' : 'FEHLER'
  console.log(`  ${icon} ${r.platform}${r.url ? ` - ${r.url}` : ''}${r.error ? ` - ${r.error}` : ''}`)
}
