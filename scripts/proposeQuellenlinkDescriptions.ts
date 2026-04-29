#!/usr/bin/env npx tsx
/**
 * Generiert `description`-Frontmatter für Quellenlinks ohne Description aus
 * dem ersten Body-Absatz. Truncated auf 80-200 Zeichen mit Satzgrenze.
 *
 * Usage:
 *   pnpm tsx scripts/proposeQuellenlinkDescriptions.ts            # Vorschau
 *   pnpm tsx scripts/proposeQuellenlinkDescriptions.ts --write    # In Dateien schreiben
 *   pnpm tsx scripts/proposeQuellenlinkDescriptions.ts --limit 10
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const PROJECT_ROOT = join(import.meta.dirname, '..')
const CONTENT_ROOT = join(PROJECT_ROOT, 'content')

const TARGET_MIN = 50
const TARGET_MAX = 200
const SWEET_SPOT = 150
const NBSP = ' '

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const LIMIT_IDX = args.indexOf('--limit')
const LIMIT = LIMIT_IDX >= 0 ? Number.parseInt(args[LIMIT_IDX + 1] ?? '0', 10) : Infinity

interface ParsedFile {
  path: string
  rel: string
  raw: string
  fmRaw: string
  fmEnd: number
  body: string
  hasDescription: boolean
}

async function collectQuellenlinks(): Promise<string[]> {
  const out: string[] = []
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = join(dir, e.name)
      if (e.isDirectory()) await walk(full)
      else if (e.isFile() && e.name.endsWith('.md') && /\/links\//.test(full)) out.push(full)
    }
  }
  await walk(join(CONTENT_ROOT, 'quellen'))
  return out
}

function parse(raw: string, path: string): ParsedFile | null {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return null
  const fmRaw = m[1]
  const fmEnd = m[0].length
  const body = raw.slice(fmEnd)
  const hasDescription = /^description:\s*\S/m.test(fmRaw)
  return {
    path,
    rel: relative(CONTENT_ROOT, path),
    raw,
    fmRaw,
    fmEnd,
    body,
    hasDescription,
  }
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
  // &nbsp; -> echtes NBSP, NICHT regulärer Space (sonst splittet splitSentences bei "13. April")
  out = out.replace(/&nbsp;/g, NBSP)
  out = out.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, '\'')
  out = out.replace(/\s+/g, ' ').trim()
  // Restore NBSP nach \s+/g collapse — \s matched NBSP. Re-insert where date+month patterns are.
  out = out.replace(/(\d+)\.\s(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)/g, `$1.${NBSP}$2`)
  return out
}

/** Skip Boilerplate-Zeilen wie "**Zitat:**", "Zitat:", "(Geprüft)", "Worum geht es?" am Anfang des Bodys. */
const BOILERPLATE_LINE_RE = /^\s*(?:\*\*)?(?:Zitat|Zusammenfassung|Quote|Kurz|Worum\s+geht\s+es)\s*[:?]?\s*(?:\*\*)?\s*$/i
const BOILERPLATE_PAREN_RE = /^\s*\(\s*(?:Geprüft|Tippfehler[^)]*|Zusammenfassung[^)]*manuell[^)]*)\s*\)\s*$/i
/** Kurze Ankündigungs-Zeilen wie "Grundsicherungs-Debatte:", "Bild der Linken mit dem Text:". */
const ANNOUNCEMENT_LINE_RE = /^\s*(?:\*\*)?[^:]{3,60}:\s*(?:\*\*)?\s*$/
/** Boilerplate kombiniert mit Klammerzusatz: "Zitat: (Tippfehler korrigiert)" oder "Zitat: _(Tippfehler korrigiert)_". */
const BOILERPLATE_WITH_PAREN_RE = /^\s*(?:\*\*)?(?:Zitat|Zusammenfassung)\s*[:?]\s*[*_]?\(\s*[^)]*\)\s*[*_]?\s*(?:\*\*)?\s*$/i
function collectParagraphs(body: string, want: number): string[] {
  const paras: string[] = []
  let cur: string[] = []
  for (const rawLine of body.split('\n')) {
    let line = rawLine
    // Behandle Blockquote-Zeilen "> ..." als normalen Absatz-Text (Quote-Inhalt ist hier brauchbar).
    if (line.startsWith('> ')) line = line.slice(2)
    else if (line.startsWith('>')) line = line.slice(1).trimStart()
    // Listen-Items "- ..." und "* ..." als Fließtext fließend mit Komma trennen.
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
  // Hole bis zu 3 Absätze, überspringe Boilerplate-Zeilen wie "Zitat:" oder "(Geprüft)".
  const paras = collectParagraphs(body, 3)
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
    // Satzgrenze: . ! ? gefolgt von regulärem Space oder Ende. NBSP zählt NICHT als Trennzeichen.
    if ((ch === '.' || ch === '!' || ch === '?') && (next === ' ' || next === '')) {
      // Abkürzungen, die KEIN Satzende sind.
      const tail = cur.slice(-5).toLowerCase()
      if (/(\bz\.|\bu\.|\bca\.|\bvgl\.|\bbzw\.|\betc\.|\bd\.h\.|\bs\.|\bjh\.|\bnr\.|\bart\.|\babs\.)$/.test(tail)) continue
      // Numerische Präfixe (Datum oder Aufzählung): "13. April", "1. Vorsitzender"
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
  const escaped = description.replace(/"/g, '\\"')
  const newLine = `description: "${escaped}"`
  if (/^description:/m.test(fmRaw)) {
    return fmRaw.replace(/^description:.*$/m, newLine)
  }
  const lines = fmRaw.split('\n')
  const titleIdx = lines.findIndex(l => /^title:/.test(l))
  if (titleIdx >= 0) {
    lines.splice(titleIdx + 1, 0, newLine)
  } else {
    lines.push(newLine)
  }
  return lines.join('\n')
}

async function main() {
  const files = await collectQuellenlinks()
  let touched = 0
  let skipped = 0
  let preview = 0
  let failed = 0

  for (const path of files) {
    if (touched + preview >= LIMIT) break
    const raw = await readFile(path, 'utf-8')
    const parsed = parse(raw, path)
    if (!parsed) continue
    if (parsed.hasDescription) {
      skipped++
      continue
    }
    const intro = firstParagraph(parsed.body)
    if (!intro) {
      console.log(`! ${parsed.rel} — kein Body-Absatz, manuell erforderlich`)
      failed++
      continue
    }
    const desc = pickDescription(intro)
    if (!desc || desc.length < TARGET_MIN) {
      console.log(`! ${parsed.rel} — Vorschlag zu kurz (${desc.length} Zeichen): ${desc.slice(0, 80)}`)
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
      console.log(`\n— ${parsed.rel} (${desc.length} Zeichen)`)
      console.log(`  ${desc}`)
    }
  }

  console.log(`\nFertig. ${WRITE ? `Geschrieben: ${touched}` : `Vorgeschlagen: ${preview}`}, schon mit Description: ${skipped}, manuell zu ergänzen: ${failed}, gesamt: ${files.length}`)
  if (!WRITE) console.log(`Hinweis: Mit --write speichert.`)
}

main().catch((err) => {
  console.error('Fehler:', err)
  process.exit(2)
})
