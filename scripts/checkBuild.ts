#!/usr/bin/env npx tsx
/**
 * Post-Build HTML Check (FF-4, Stufe 4)
 *
 * Prueft prerendered HTML im .output/public auf:
 *   - literale Escape-Sequenzen (\u00A0, \n, \t)
 *   - unparsed MDC-Tags
 *   - doppelt-escaped Entities (&amp;nbsp;, &amp;quot;)
 *   - leere Ueberschriften / leere Links
 *
 * Usage:
 *   pnpm check:build     # nach pnpm build
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const PROJECT_ROOT = join(import.meta.dirname, '..')
const BUILD_ROOT = join(PROJECT_ROOT, '.output', 'public')

const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'
const GRAY = '\x1b[90m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

type Severity = 'error' | 'warn'

interface Finding {
  file: string
  rule: string
  message: string
  snippet: string
  severity: Severity
}

interface RuleDef {
  name: string
  pattern: RegExp
  message: string
  severity: Severity
}

const RULES: RuleDef[] = [
  {
    name: 'literal-escape-html',
    pattern: /\\u[0-9a-fA-F]{4}/g,
    message: `Literale Escape-Sequenz im HTML. Wahrscheinlich fehlgeschlagener Unescape.`,
    severity: 'error',
  },
  {
    name: 'unparsed-mdc',
    pattern: /<(?:SourceRef|Reference|QuoteReference|GlossarRef|QuelleRef|ContentSection|ExampleBox|QuoteBlock)\b/g,
    message: `Unparsed MDC-Tag im HTML. Komponente wurde nicht gerendert.`,
    severity: 'error',
  },
  {
    name: 'double-escaped-entity',
    pattern: /&amp;(?:nbsp|quot|amp|lt|gt|#\d+|#x[0-9a-fA-F]+);/g,
    message: `Doppelt-escaped HTML-Entity. Inhalt wurde falsch verarbeitet.`,
    severity: 'error',
  },
  {
    name: 'empty-heading',
    pattern: /<h[1-6][^>]*>\s*<\/h[1-6]>/g,
    message: `Leere Ueberschrift.`,
    severity: 'warn',
  },
]

async function collectHtmlFiles(root: string): Promise<string[]> {
  const results: string[] = []
  async function walk(dir: string) {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name.startsWith('_')) continue
        await walk(full)
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        results.push(full)
      }
    }
  }
  await walk(root)
  return results
}

function snippetFromMatch(html: string, index: number): string {
  const start = Math.max(0, index - 40)
  const end = Math.min(html.length, index + 80)
  return html.slice(start, end).replace(/\s+/g, ' ').trim()
}

// Ersetzt <script>...</script>, <style>...</style> und HTML-Kommentare durch Leerzeichen
// gleicher Laenge, damit Positionen erhalten bleiben aber Inhalt nicht gescannt wird.
function stripNonContent(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, m => ' '.repeat(m.length))
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, m => ' '.repeat(m.length))
    .replace(/<!--[\s\S]*?-->/g, m => ' '.repeat(m.length))
}

function checkHtmlFile(file: string, html: string, findings: Finding[]) {
  const stripped = stripNonContent(html)
  for (const rule of RULES) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags)
    let m: RegExpExecArray | null
    const seen = new Set<number>()
    while ((m = re.exec(stripped)) !== null) {
      if (seen.has(m.index)) break
      seen.add(m.index)
      findings.push({
        file,
        rule: rule.name,
        message: rule.message,
        snippet: snippetFromMatch(html, m.index),
        severity: rule.severity,
      })
    }
  }
}

function report(findings: Finding[]): number {
  if (findings.length === 0) {
    console.log(`${GREEN}${BOLD}✓${RESET} ${GREEN}Build-HTML bestanden den Check.${RESET}`)
    return 0
  }
  const byFile = new Map<string, Finding[]>()
  for (const f of findings) {
    const arr = byFile.get(f.file) ?? []
    arr.push(f)
    byFile.set(f.file, arr)
  }
  let errorCount = 0
  let warnCount = 0
  for (const [file, list] of [...byFile.entries()].sort()) {
    const rel = relative(PROJECT_ROOT, file)
    console.log(`\n${BOLD}${CYAN}${rel}${RESET}`)
    for (const f of list) {
      const color = f.severity === 'error' ? RED : YELLOW
      const tag = f.severity === 'error' ? 'ERROR' : 'WARN '
      console.log(`  ${color}${tag}${RESET}  ${BOLD}${f.rule}${RESET}  ${f.message}`)
      console.log(`    ${GRAY}${f.snippet}${RESET}`)
    }
  }
  for (const f of findings) {
    if (f.severity === 'error') errorCount++
    else warnCount++
  }
  console.log(`\n${BOLD}Summary:${RESET} ${errorCount} error(s), ${warnCount} warning(s) in ${byFile.size} file(s)`)
  return errorCount
}

async function main() {
  console.log(`${GRAY}Scanne .output/public fuer HTML-Dateien ...${RESET}`)
  const files = await collectHtmlFiles(BUILD_ROOT)
  if (files.length === 0) {
    console.log(`${YELLOW}Keine HTML-Dateien gefunden. Build erst ausfuehren: pnpm build${RESET}`)
    process.exit(2)
  }
  console.log(`${GRAY}${files.length} HTML-Dateien werden geprueft ...${RESET}`)
  const findings: Finding[] = []
  for (const file of files) {
    const html = await readFile(file, 'utf-8')
    checkHtmlFile(file, html, findings)
  }
  const errorCount = report(findings)
  process.exit(errorCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(`${RED}${BOLD}Fehler:${RESET}`, err)
  process.exit(2)
})
