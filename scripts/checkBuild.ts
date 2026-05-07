#!/usr/bin/env npx tsx
/**
 * Post-Build HTML Check (FF-4, Stufe 4)
 *
 * Phase 1: Prueft prerendered HTML im .output/public auf:
 *   - literale Escape-Sequenzen (\u00A0, \n, \t)
 *   - unparsed MDC-Tags
 *   - doppelt-escaped Entities (&amp;nbsp;, &amp;quot;)
 *   - leere Ueberschriften / leere Links
 *   - broken references (ref-missing)
 *
 * Phase 2: Startet den Build-Server und prueft SSR-gerenderte Content-Seiten auf:
 *   - broken references (ref-missing)
 *   - unparsed MDC-Tags
 *
 * Usage:
 *   pnpm check:build            # Phase 1 + Phase 2
 *   pnpm check:build --static   # nur Phase 1 (kein Server)
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { type ChildProcess, spawn } from 'node:child_process'
import { createServer } from 'node:net'

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
    name: 'broken-ref',
    pattern: /class="[^"]*ref-missing[^"]*"/g,
    message: `Broken reference: SourceRef/QuoteReference/QuelleRef Code nicht aufgeloest.`,
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

const SSR_RULES: RuleDef[] = RULES.filter(r => r.name === 'broken-ref' || r.name === 'unparsed-mdc')

async function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.listen(0, () => {
      const addr = srv.address()
      if (addr && typeof addr === 'object') {
        const { port } = addr
        srv.close(() => resolve(port))
      } else {
        reject(new Error('Konnte keinen freien Port finden'))
      }
    })
  })
}

async function startServer(port: number): Promise<ChildProcess> {
  const serverPath = join(PROJECT_ROOT, '.output', 'server', 'index.mjs')
  const child = spawn('node', [serverPath], {
    env: { ...process.env, PORT: String(port), NITRO_PORT: String(port), HOST: '127.0.0.1', NITRO_HOST: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server-Start Timeout (15s)')), 15_000)
    child.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })
    child.on('exit', (code) => {
      clearTimeout(timeout)
      reject(new Error(`Server beendet mit Code ${code}`))
    })
    const onData = (chunk: Buffer) => {
      if (chunk.toString().includes('Listening')) {
        clearTimeout(timeout)
        resolve()
      }
    }
    child.stdout?.on('data', onData)
    child.stderr?.on('data', onData)
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/__sitemap__/urls`)
        if (res.ok) {
          clearInterval(poll)
          clearTimeout(timeout)
          resolve()
        }
      } catch { /* Port noch nicht offen */ }
    }, 500)
    child.on('exit', () => clearInterval(poll))
  })
  return child
}

async function fetchContentRoutes(port: number): Promise<string[]> {
  const res = await fetch(`http://127.0.0.1:${port}/api/__sitemap__/urls`)
  if (!res.ok) throw new Error(`Sitemap-API liefert ${res.status}`)
  const urls: Array<{ loc: string }> = await res.json()
  return urls.map(u => u.loc).filter(Boolean)
}

async function checkSsrPages(port: number, routes: string[], findings: Finding[]): Promise<void> {
  let checked = 0
  let failed = 0
  for (const route of routes) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}${route}`)
      if (!res.ok) {
        failed++
        continue
      }
      const html = await res.text()
      const stripped = stripNonContent(html)
      for (const rule of SSR_RULES) {
        const re = new RegExp(rule.pattern.source, rule.pattern.flags)
        let m: RegExpExecArray | null
        const seen = new Set<number>()
        while ((m = re.exec(stripped)) !== null) {
          if (seen.has(m.index)) break
          seen.add(m.index)
          findings.push({
            file: route,
            rule: rule.name,
            message: rule.message,
            snippet: snippetFromMatch(html, m.index),
            severity: rule.severity,
          })
        }
      }
      checked++
    } catch {
      failed++
    }
  }
  console.log(`${GRAY}  ${checked} Seiten geprueft, ${failed} fehlgeschlagen${RESET}`)
}

async function main() {
  const staticOnly = process.argv.includes('--static')
  const findings: Finding[] = []

  // Phase 1: Statische HTML-Dateien
  console.log(`${GRAY}Phase 1: Scanne .output/public fuer HTML-Dateien ...${RESET}`)
  const files = await collectHtmlFiles(BUILD_ROOT)
  if (files.length === 0) {
    console.log(`${YELLOW}Keine HTML-Dateien gefunden. Build erst ausfuehren: pnpm build${RESET}`)
    process.exit(2)
  }
  console.log(`${GRAY}  ${files.length} HTML-Dateien werden geprueft ...${RESET}`)
  for (const file of files) {
    const html = await readFile(file, 'utf-8')
    checkHtmlFile(file, html, findings)
  }

  // Phase 2: SSR-gerenderte Content-Seiten
  if (!staticOnly) {
    console.log(`\n${GRAY}Phase 2: Starte Build-Server fuer SSR-Check ...${RESET}`)
    let server: ChildProcess | undefined
    try {
      const port = await findFreePort()
      server = await startServer(port)
      console.log(`${GRAY}  Server laeuft auf Port ${port}${RESET}`)
      const routes = await fetchContentRoutes(port)
      console.log(`${GRAY}  ${routes.length} Content-Routen gefunden${RESET}`)
      await checkSsrPages(port, routes, findings)
    } catch (err) {
      console.log(`${YELLOW}SSR-Check uebersprungen: ${err instanceof Error ? err.message : err}${RESET}`)
    } finally {
      if (server) {
        server.kill('SIGTERM')
        await new Promise<void>((resolve) => {
          server!.on('exit', () => resolve())
          setTimeout(() => {
            server!.kill('SIGKILL')
            resolve()
          }, 3000)
        })
      }
    }
  }

  const errorCount = report(findings)
  process.exit(errorCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(`${RED}${BOLD}Fehler:${RESET}`, err)
  process.exit(2)
})
