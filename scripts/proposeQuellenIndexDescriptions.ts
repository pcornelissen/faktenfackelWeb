#!/usr/bin/env npx tsx
/**
 * Generiert `description`-Frontmatter für Quellen-Profile (index.md) deren
 * Description fehlt oder unter 60 Zeichen ist. Extrahiert aus dem ersten
 * Body-Absatz (oder Blockquote) nach "## Über die Quelle"-Heading.
 *
 * Usage:
 *   pnpm tsx scripts/proposeQuellenIndexDescriptions.ts            # Vorschau
 *   pnpm tsx scripts/proposeQuellenIndexDescriptions.ts --write    # Schreiben
 *   pnpm tsx scripts/proposeQuellenIndexDescriptions.ts --limit 10
 *   pnpm tsx scripts/proposeQuellenIndexDescriptions.ts --min 60   # Threshold (default 60)
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const PROJECT_ROOT = join(import.meta.dirname, '..')
const CONTENT_ROOT = join(PROJECT_ROOT, 'content')

const TARGET_MIN = 60
const TARGET_MAX = 240
const SWEET_SPOT = 180
const NBSP = ' '

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const LIMIT_IDX = args.indexOf('--limit')
const LIMIT = LIMIT_IDX >= 0 ? Number.parseInt(args[LIMIT_IDX + 1] ?? '0', 10) : Infinity
const MIN_IDX = args.indexOf('--min')
const REPLACE_BELOW = MIN_IDX >= 0 ? Number.parseInt(args[MIN_IDX + 1] ?? '60', 10) : 60

interface ParsedFile {
  path: string
  rel: string
  raw: string
  fmRaw: string
  fmEnd: number
  body: string
  existingDescription: string
}

/** Quellen index.md: 3 segments deep (group/source/index.md), nicht in /links/ oder /zitate/. */
async function collectQuellenIndexes(): Promise<string[]> {
  const out: string[] = []
  async function walk(dir: string, depth: number) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = join(dir, e.name)
      if (e.isDirectory()) {
        if (e.name === 'links' || e.name === 'zitate') continue
        if (depth < 2) await walk(full, depth + 1)
      } else if (e.isFile() && e.name === 'index.md' && depth === 2) {
        out.push(full)
      }
    }
  }
  await walk(join(CONTENT_ROOT, 'quellen'), 0)
  return out
}

function parse(raw: string, path: string): ParsedFile | null {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return null
  const fmRaw = m[1]
  const fmEnd = m[0].length
  const body = raw.slice(fmEnd)
  const descMatch = fmRaw.match(/^description:\s*(.*)$/m)
  const existingDescription = descMatch ? unquote(descMatch[1]) : ''
  return { path, rel: relative(CONTENT_ROOT, path), raw, fmRaw, fmEnd, body, existingDescription }
}

function unquote(value: string): string {
  let v = value.trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith('\'') && v.endsWith('\''))) {
    v = v.slice(1, -1)
  }
  return v
}

function humaniseSlug(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function stripMdc(text: string): string {
  let out = text
  out = out.replace(/:quelle-ref\{[^}]*name="([^"]+)"[^}]*\}/g, (_m, slug) => humaniseSlug(slug))
  out = out.replace(/<SourceRef[^>]*>([^<]+)<\/SourceRef>/gi, '$1')
  out = out.replace(/<QuoteReference[^>]*>([^<]*)<\/QuoteReference>/gi, '$1')
  out = out.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  out = out.replace(/^::[a-z][\w-]*[^\n]*\n[\s\S]*?^::\s*$/gm, '')
  out = out.replace(/[*_]+([^*_]+)[*_]+/g, '$1')
  out = out.replace(/&nbsp;/g, NBSP)
  out = out.replace(/&quot;/g, '"').replace(/&#x27;/g, '\'').replace(/&amp;/g, '&')
  out = out.replace(/\s+/g, ' ').trim()
  out = out.replace(/(\d+)\.\s(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)/g, `$1.${NBSP}$2`)
  return out
}

const BOILERPLATE_LINE_RE = /^\s*(?:\*\*)?(?:Zitat|Zusammenfassung|Quote|Kurz|Worum\s+geht\s+es)(?:\s+\w+)?\s*[:?]?\s*(?:\*\*)?\s*$/i
const BOILERPLATE_PAREN_RE = /^\s*\(\s*(?:Geprüft|Tippfehler[^)]*|Zusammenfassung[^)]*manuell[^)]*)\s*\)\s*$/i
const ANNOUNCEMENT_LINE_RE = /^\s*(?:\*\*)?[^:]{3,60}:\s*(?:\*\*)?\s*$/
const BOILERPLATE_WITH_PAREN_RE = /^\s*(?:\*\*)?(?:Zitat|Zusammenfassung)\s*[:?]\s*[*_]?\(\s*[^)]*\)\s*[*_]?\s*(?:\*\*)?\s*$/i

function collectParagraphs(body: string, want: number): string[] {
  const paras: string[] = []
  let cur: string[] = []
  for (const rawLine of body.split('\n')) {
    let line = rawLine
    if (line.startsWith('> ')) line = line.slice(2)
    else if (line.startsWith('>')) line = line.slice(1).trimStart()
    if (/^\s*[-*]\s+/.test(line)) line = line.replace(/^\s*[-*]\s+/, '')

    if (line.startsWith('#')) {
      if (cur.length) {
        paras.push(cur.join(' '))
        cur = []
      }
      if (paras.length >= want) break
      continue
    }
    if (line.trim() === '') {
      if (cur.length) {
        paras.push(cur.join(' '))
        cur = []
      }
      if (paras.length >= want) break
      continue
    }
    cur.push(line)
  }
  if (cur.length && paras.length < want) paras.push(cur.join(' '))
  return paras
}

function firstParagraph(body: string): string {
  const paras = collectParagraphs(body, 4)
  for (const p of paras) {
    const trimmed = p.trim()
    if (!trimmed) continue
    if (BOILERPLATE_LINE_RE.test(trimmed)) continue
    if (BOILERPLATE_PAREN_RE.test(trimmed)) continue
    if (BOILERPLATE_WITH_PAREN_RE.test(trimmed)) continue
    if (ANNOUNCEMENT_LINE_RE.test(trimmed)) continue
    return trimmed
  }
  return ''
}

function splitSentences(text: string): string[] {
  const result: string[] = []
  let cur = ''
  for (let i = 0; i < text.length; i++) {
    cur += text[i]
    const ch = text[i]
    const next = text[i + 1] ?? ''
    if ((ch === '.' || ch === '!' || ch === '?') && (next === ' ' || next === '')) {
      const tail = cur.slice(-5).toLowerCase()
      if (/(\bz\.|\bu\.|\bca\.|\bvgl\.|\bbzw\.|\betc\.|\bd\.h\.|\bs\.|\bjh\.|\bnr\.|\bart\.|\babs\.)$/.test(tail)) continue
      if (ch === '.' && /\d\.$/.test(cur)) continue
      result.push(cur.trim())
      cur = ''
    }
  }
  if (cur.trim()) result.push(cur.trim())
  return result
}

function pickDescription(intro: string): string {
  const cleaned = stripMdc(intro)
  if (!cleaned) return ''
  const sentences = splitSentences(cleaned)

  let acc = ''
  for (const s of sentences) {
    const candidate = acc ? `${acc} ${s}` : s
    if (candidate.length > TARGET_MAX) {
      if (acc.length >= TARGET_MIN) break
      const cut = candidate.slice(0, TARGET_MAX - 2)
      const lastSentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '))
      if (lastSentenceEnd > TARGET_MIN) {
        return cut.slice(0, lastSentenceEnd + 1).trim()
      }
      const lastBreak = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf(' '))
      if (lastBreak > TARGET_MIN) return `${cut.slice(0, lastBreak).trim()} …`
      return `${cut.trim()} …`
    }
    acc = candidate
    if (acc.length >= SWEET_SPOT) break
  }
  return acc
}

function injectDescription(fmRaw: string, description: string): string {
  const escaped = description.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const newLine = `description: "${escaped}"`
  if (/^description:/m.test(fmRaw)) {
    return fmRaw.replace(/^description:.*$/m, newLine)
  }
  const lines = fmRaw.split('\n')
  const nameIdx = lines.findIndex(l => /^name:/.test(l))
  if (nameIdx >= 0) {
    lines.splice(nameIdx + 1, 0, newLine)
  } else {
    lines.push(newLine)
  }
  return lines.join('\n')
}

async function main() {
  const files = await collectQuellenIndexes()
  let touched = 0
  let skipped = 0
  let preview = 0
  let failed = 0

  for (const path of files) {
    if (touched + preview >= LIMIT) break
    const raw = await readFile(path, 'utf-8')
    const parsed = parse(raw, path)
    if (!parsed) continue
    if (parsed.existingDescription.length >= REPLACE_BELOW) {
      skipped++
      continue
    }
    const intro = firstParagraph(parsed.body)
    if (!intro) {
      console.log(`! ${parsed.rel} — kein Body, manuell erforderlich (alt: ${parsed.existingDescription.length}: "${parsed.existingDescription}")`)
      failed++
      continue
    }
    const desc = pickDescription(intro)
    if (!desc || desc.length < TARGET_MIN) {
      console.log(`! ${parsed.rel} — Vorschlag zu kurz (${desc.length}): "${desc}" (alt ${parsed.existingDescription.length}: "${parsed.existingDescription}")`)
      failed++
      continue
    }

    const newFm = injectDescription(parsed.fmRaw, desc)
    const newRaw = `---\n${newFm}\n---\n${parsed.body.startsWith('\n') ? parsed.body.slice(1) : parsed.body}`

    if (WRITE) {
      await writeFile(path, newRaw, 'utf-8')
      touched++
    } else {
      preview++
      console.log(`\n— ${parsed.rel} (alt ${parsed.existingDescription.length}: "${parsed.existingDescription}")`)
      console.log(`  NEU (${desc.length}): ${desc}`)
    }
  }

  console.log(`\nFertig. ${WRITE ? `Geschrieben: ${touched}` : `Vorgeschlagen: ${preview}`}, lang genug (>= ${REPLACE_BELOW}): ${skipped}, manuell: ${failed}, gesamt: ${files.length}`)
  if (!WRITE) console.log(`Hinweis: Mit --write speichert.`)
}

main().catch((err) => {
  console.error('Fehler:', err)
  process.exit(2)
})
