#!/usr/bin/env npx tsx
/**
 * Content Lint Script (FF-4)
 *
 * Prüft alle content/** /*.md Dateien gegen:
 *   - MDC-Tag-Mismatches
 *   - unbekannte MDC-Komponenten
 *   - literale Escape-Sequenzen (\u00A0, \n, \t)
 *   - Stray Emphasis (einzelnes * zwischen Wortzeichen)
 *   - &nbsp;-Entity statt Unicode-NBSP
 *   - Em-Dashes (—) im Fließtext
 *   - Typografische Anführungszeichen („ " « »)
 *   - Datum ohne NBSP vor Monatsname
 *   - URL-unsichere Zeichen in Frontmatter-Tags
 *   - Broken internal links (gegen Content-Routen + statische Seiten)
 *   - Broken external links (HTTP HEAD/GET Erreichbarkeitscheck)
 *
 * Usage:
 *   pnpm check:content           # nur prüfen
 *   pnpm check:content --fix     # auto-fix für NBSP-Entity + typogr. Quotes
 *   pnpm check:content --quiet   # nur Zusammenfassung
 *   pnpm check:content --no-external  # ohne externe Link-Checks
 */

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const PROJECT_ROOT = join(import.meta.dirname, '..')
const CONTENT_ROOT = join(PROJECT_ROOT, 'content')
const COMPONENTS_ROOT = join(PROJECT_ROOT, 'app', 'components')

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
  line: number
  col: number
  rule: string
  message: string
  snippet: string
  severity: Severity
}

const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

const MDC_BUILT_INS = new Set<string>([
  // Falls MDC-Inline-Komponenten mit PascalCase-Syntax ohne lokale Vue-Datei genutzt werden,
  // hier hinzufuegen. Bislang leer.
])

async function collectChangedMarkdownFiles(): Promise<string[]> {
  // Files staged + working-tree changes vs origin/main (or main if no remote).
  // Falls back to HEAD~1 when no main ref is reachable (e.g. fresh shallow clone).
  const candidates = ['origin/main', 'main']
  let baseRef: string | null = null
  for (const ref of candidates) {
    try {
      await execFileAsync('git', ['rev-parse', '--verify', '--quiet', ref])
      baseRef = ref
      break
    } catch { /* not found */ }
  }
  if (!baseRef) baseRef = 'HEAD~1'

  let raw = ''
  try {
    const { stdout } = await execFileAsync('git', ['diff', '--name-only', '--diff-filter=ACMR', `${baseRef}...HEAD`])
    raw += stdout
  } catch {
    // ignore - new branch, no commits yet
  }
  // Nur committete Aenderungen vs origin/main werden geprueft. Staged- und
  // Working-Tree-Aenderungen sind noch nicht im Push und werden ignoriert.

  const repoRootResult = await execFileAsync('git', ['rev-parse', '--show-toplevel'])
  const repoRoot = repoRootResult.stdout.trim()

  const result = new Set<string>()
  for (const line of raw.split('\n')) {
    const f = line.trim()
    if (!f) continue
    if (!f.endsWith('.md')) continue
    const abs = resolve(repoRoot, f)
    const rel = relative(CONTENT_ROOT, abs)
    if (rel.startsWith('..') || rel.startsWith('/')) continue
    result.add(abs)
  }
  return [...result].sort()
}

async function collectMarkdownFiles(root: string): Promise<string[]> {
  const results: string[] = []
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(full)
      }
    }
  }
  await walk(root)
  return results
}

async function collectComponentNames(root: string): Promise<Set<string>> {
  const names = new Set<string>()
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
      } else if (entry.isFile() && entry.name.endsWith('.vue')) {
        const base = entry.name.replace(/\.vue$/, '')
        if (!base.includes('.') && /^[A-Z][A-Za-z0-9]*$/.test(base)) {
          names.add(base)
        }
      }
    }
  }
  await walk(root)
  return names
}

// -- Link-Linter: Bekannte Routen --

const PUBLIC_DIR = join(PROJECT_ROOT, 'public')

function contentPathToRoute(filepath: string): string {
  const route = '/' + relative(CONTENT_ROOT, filepath)
    .replace(/\.md$/, '')
    .replace(/\\/g, '/')
  return route.replace(/\/index$/, '').replace(/\/$/, '') || '/'
}

async function buildKnownRoutes(): Promise<Set<string>> {
  const routes = new Set<string>()
  const allFiles = await collectMarkdownFiles(CONTENT_ROOT)
  for (const f of allFiles) {
    const route = contentPathToRoute(f)
    routes.add(route)
    routes.add(route + '/')
  }
  const staticPages = [
    '/', '/impressum', '/datenschutz', '/kontakt', '/faq',
    '/about', '/bewertungsmasstab', '/mehr',
    '/faktenchecks', '/lagerfeuer', '/glossar', '/quellen', '/zitate',
    '/news', '/themen', '/tags',
  ]
  for (const p of staticPages) {
    routes.add(p)
    routes.add(p + '/')
  }
  return routes
}

interface RedirectIndex {
  exact: Set<string>
  prefixes: string[]
}

async function buildRedirectSources(): Promise<RedirectIndex> {
  const exact = new Set<string>()
  const prefixes: string[] = []
  try {
    const redirectsPath = join(PROJECT_ROOT, 'server', 'middleware', 'redirects.ts')
    const content = await readFile(redirectsPath, 'utf-8')

    // Exact link redirects (linkRedirects object)
    const linkSection = content.match(/const linkRedirects[^{]*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    const linkRe = /^\s*'([^']+)':/gm
    let m: RegExpExecArray | null
    while ((m = linkRe.exec(linkSection)) !== null) {
      exact.add(m[1].replace(/\/$/, ''))
    }

    // Prefix redirects (prefixRedirects object)
    const prefixSection = content.match(/const prefixRedirects[^{]*\{([\s\S]*?)\n\}/)?.[1] ?? ''
    const prefixRe = /^\s*'([^']+)':/gm
    while ((m = prefixRe.exec(prefixSection)) !== null) {
      prefixes.push(m[1].replace(/\/$/, ''))
    }
  } catch { /* file not found, no problem */ }
  return { exact, prefixes }
}

// -- Link-Linter: Links extrahieren --

interface ExtractedLink {
  url: string
  resolvedUrl: string
  line: number
  source: 'markdown' | 'frontmatter'
}

function extractLinks(text: string, lines: string[]): ExtractedLink[] {
  const links: ExtractedLink[] = []
  const fm = extractFrontmatter(text)
  const bodyStartLine = fm ? text.slice(0, fm.end).split('\n').length : 0

  // Frontmatter: uri field
  if (fm?.fields.uri) {
    const uri = fm.fields.uri
    const fmLines = fm.raw.split('\n')
    let uriLine = 1
    for (let i = 0; i < fmLines.length; i++) {
      if (fmLines[i].match(/^uri:\s/)) {
        uriLine = i + 2
        break
      }
    }
    links.push({
      url: uri,
      resolvedUrl: uri.split('#')[0].split('?')[0],
      line: uriLine,
      source: 'frontmatter',
    })
  }

  // Body: Markdown links [text](url) and ![alt](url)
  const mdLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g
  for (let i = bodyStartLine; i < lines.length; i++) {
    const line = lines[i]
    let match: RegExpExecArray | null
    mdLinkRegex.lastIndex = 0
    while ((match = mdLinkRegex.exec(line)) !== null) {
      const rawUrl = match[2].split('#')[0].split('?')[0].trim()
      if (!rawUrl) continue
      if (!rawUrl.startsWith('/') && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) continue
      links.push({
        url: match[2],
        resolvedUrl: rawUrl,
        line: i + 1,
        source: 'markdown',
      })
    }
  }

  return links
}

// -- Link-Linter: Interne Links pruefen --

function checkInternalLinkSync(
  url: string,
  knownRoutes: Set<string>,
  redirects: RedirectIndex,
): { severity: Severity, message: string } | null {
  const normalized = url.replace(/\/$/, '')
  if (url.startsWith('#')) return null
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return null

  if (
    url.startsWith('/images/') || url.startsWith('/fonts/')
    || url.startsWith('/favicon') || url.startsWith('/files/')
    || url.startsWith('/robots') || url.startsWith('/sitemap')
  ) {
    if (!existsSync(join(PUBLIC_DIR, url))) {
      return { severity: 'error', message: `Asset nicht gefunden: ${url}` }
    }
    return null
  }

  if (url.startsWith('/api/')) return null
  if (url.startsWith('/dev/')) return null
  if (url.startsWith('/rss') || url.startsWith('/feed') || url.startsWith('/_nuxt/')) return null

  // Exact redirect sources
  if (redirects.exact.has(normalized)) return null
  // Prefix redirect sources (dissolved sources whose sub-paths are all redirected)
  if (redirects.prefixes.some(p => normalized === p || normalized.startsWith(p + '/'))) return null

  if (normalized.startsWith('/tags/')) return null
  if (normalized.startsWith('/autoren/')) return null

  if (knownRoutes.has(normalized) || knownRoutes.has(normalized + '/')) return null

  return { severity: 'error', message: `Interner Link zeigt ins Leere: ${url}` }
}

// -- Link-Linter: Externe Links pruefen --

const externalLinkCache = new Map<string, string | null>()

async function checkExternalLink(url: string): Promise<string | null> {
  if (!url.startsWith('http://') && !url.startsWith('https://')) return null
  const cacheKey = url.split('#')[0].split('?')[0]
  if (externalLinkCache.has(cacheKey)) return externalLinkCache.get(cacheKey) ?? null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    let response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Faktenfackel-LinkChecker/1.0', 'Accept': 'text/html,*/*' },
    })

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': 'Faktenfackel-LinkChecker/1.0', 'Accept': 'text/html,*/*' },
      })
    }

    clearTimeout(timeout)

    if (response.status >= 400) {
      const result = `HTTP ${response.status}: ${url}`
      externalLinkCache.set(cacheKey, result)
      return result
    }
    externalLinkCache.set(cacheKey, null)
    return null
  } catch (err: unknown) {
    const e = err as { name?: string, message?: string }
    const msg = e.name === 'AbortError'
      ? `Timeout (10s): ${url}`
      : `Nicht erreichbar: ${url} (${e.message ?? 'unbekannt'})`
    externalLinkCache.set(cacheKey, msg)
    return msg
  }
}

// -- Link-Linter: Orchestrierung --

async function checkBrokenLinks(
  files: string[],
  texts: Map<string, string>,
  findings: Finding[],
  quiet: boolean,
  noExternal: boolean,
): Promise<void> {
  if (!quiet) console.log(`${GRAY}Baue Routen-Index auf ...${RESET}`)
  const knownRoutes = await buildKnownRoutes()
  const redirects = await buildRedirectSources()
  if (!quiet) console.log(`${GRAY}${knownRoutes.size} bekannte Routen, ${redirects.exact.size} exakte + ${redirects.prefixes.length} Prefix-Redirects${RESET}`)

  const externalChecks: Array<{ url: string, file: string, line: number }> = []
  const linesCache = new Map<string, string[]>()

  for (const file of files) {
    const text = texts.get(file)
    if (!text) continue
    const fileLines = splitLines(text)
    linesCache.set(file, fileLines)
    const links = extractLinks(text, fileLines)

    for (const link of links) {
      if (link.resolvedUrl.startsWith('http://') || link.resolvedUrl.startsWith('https://')) {
        externalChecks.push({ url: link.url.split('#')[0], file, line: link.line })
      } else if (link.resolvedUrl.startsWith('/')) {
        const result = checkInternalLinkSync(link.resolvedUrl, knownRoutes, redirects)
        if (result) {
          findings.push({
            file,
            line: link.line,
            col: 1,
            rule: 'broken-internal-link',
            message: result.message,
            snippet: snippetAt(fileLines, link.line),
            severity: result.severity,
          })
        }
      }
    }
  }

  if (externalChecks.length > 0 && !noExternal) {
    if (!quiet) console.log(`${GRAY}Pruefe ${externalChecks.length} externe Links ...${RESET}`)
    const CONCURRENCY = 5
    for (let i = 0; i < externalChecks.length; i += CONCURRENCY) {
      const batch = externalChecks.slice(i, i + CONCURRENCY)
      await Promise.all(batch.map(async (check) => {
        const error = await checkExternalLink(check.url)
        if (error) {
          const fileLines = linesCache.get(check.file) ?? []
          findings.push({
            file: check.file,
            line: check.line,
            col: 1,
            rule: 'broken-external-link',
            message: error,
            snippet: snippetAt(fileLines, check.line),
            severity: 'warn',
          })
        }
      }))
    }
  }
}

function splitLines(text: string): string[] {
  return text.split('\n')
}

// Boolean-Maske: true wo Zeichen innerhalb von Codeblock, Inline-Code oder URL liegt.
function buildCodeMask(text: string): boolean[] {
  const mask = new Array<boolean>(text.length).fill(false)
  const fenceRe = /```[\s\S]*?```/g
  let m: RegExpExecArray | null
  while ((m = fenceRe.exec(text)) !== null) {
    for (let i = m.index; i < m.index + m[0].length; i++) mask[i] = true
  }
  const inlineRe = /`[^`\n]*`/g
  while ((m = inlineRe.exec(text)) !== null) {
    for (let i = m.index; i < m.index + m[0].length; i++) mask[i] = true
  }
  // URLs (http/https). Stop at whitespace oder typischen Trennzeichen.
  const urlRe = /https?:\/\/[^\s<>"()\]}]+/g
  while ((m = urlRe.exec(text)) !== null) {
    for (let i = m.index; i < m.index + m[0].length; i++) mask[i] = true
  }
  // MDC-Block-Frontmatter: innerhalb einer ::block-Struktur die YAML-Kopfzeile
  // zwischen "---" und "---" maskieren. Allows leading whitespace on :: lines.
  const mdcBlockRe = /^\s*::[a-z][a-z0-9-]*[\s\S]*?^\s*::\s*$/gm
  while ((m = mdcBlockRe.exec(text)) !== null) {
    const inner = m[0]
    const yamlMatch = inner.match(/\n\s*---\n[\s\S]*?\n\s*---\n/)
    if (yamlMatch && yamlMatch.index !== undefined) {
      const absStart = m.index + yamlMatch.index
      for (let i = absStart; i < absStart + yamlMatch[0].length; i++) mask[i] = true
    }
  }
  return mask
}

function indexToPos(text: string, index: number): { line: number, col: number } {
  let line = 1
  let col = 1
  for (let i = 0; i < index && i < text.length; i++) {
    if (text[i] === '\n') {
      line++
      col = 1
    } else {
      col++
    }
  }
  return { line, col }
}

function snippetAt(lines: string[], line: number): string {
  return (lines[line - 1] ?? '').trim().slice(0, 200)
}

function addFinding(
  findings: Finding[],
  file: string,
  text: string,
  lines: string[],
  index: number,
  rule: string,
  message: string,
  severity: Severity = 'error',
) {
  const { line, col } = indexToPos(text, index)
  findings.push({
    file,
    line,
    col,
    rule,
    message,
    snippet: snippetAt(lines, line),
    severity,
  })
}

interface Frontmatter {
  raw: string
  start: number
  end: number
  tags: string[]
  fields: Record<string, string>
}

function unquote(value: string): string {
  let v = value.trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith('\'') && v.endsWith('\''))) {
    v = v.slice(1, -1)
  }
  return v
}

function extractFrontmatter(text: string): Frontmatter | null {
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return null
  const raw = match[1]
  const start = 0
  const end = match[0].length
  const tags: string[] = []
  const tagsMatch = raw.match(/\ntags:\n((?:[ \t]+-[^\n]*\n?)+)/)
  if (tagsMatch) {
    for (const line of tagsMatch[1].split('\n')) {
      const t = line.match(/^[ \t]+-\s+(.+?)\s*$/)
      if (t) tags.push(t[1].replace(/^["']|["']$/g, ''))
    }
  }

  const fields: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!m) continue
    const key = m[1]
    const rawValue = m[2]
    if (rawValue === '' || rawValue.startsWith('|') || rawValue.startsWith('>') || rawValue.startsWith('[')) continue
    fields[key] = unquote(rawValue)
  }

  return { raw, start, end, tags, fields }
}

interface SeoCollectionRule {
  name: string
  match: (relPath: string) => boolean
  titleField: 'title' | 'name'
  titleMin: number
  titleMax: number
  descField: 'description' | 'teaser' | 'subtitle' | null
  descFallbackField?: 'subtitle' | 'teaser' | null
  descMin: number
  descMax: number
  descRequired: boolean
  /**
   * Wenn true: descRequired wird geprueft, descMin/descMax aber NICHT.
   * Sinnvoll fuer Felder, die inhaltlich (Originalzitat) und nicht als
   * SEO-Metabeschreibung dienen, z.B. teaser bei zitate.
   */
  descSkipLengthValidation?: boolean
}

const SEO_COLLECTIONS: SeoCollectionRule[] = [
  {
    name: 'glossar',
    match: rel => rel.startsWith('glossar/'),
    titleField: 'title',
    titleMin: 15,
    titleMax: 70,
    descField: 'description',
    descFallbackField: null,
    descMin: 120,
    descMax: 160,
    descRequired: true,
  },
  {
    name: 'faktenchecks',
    match: rel => rel.startsWith('faktenchecks/') && !rel.endsWith('/_info.md'),
    titleField: 'title',
    titleMin: 15,
    titleMax: 70,
    descField: 'description',
    descFallbackField: null,
    descMin: 120,
    descMax: 160,
    descRequired: true,
  },
  {
    name: 'lagerfeuer',
    match: rel => rel.startsWith('lagerfeuer/') && !rel.endsWith('/_info.md'),
    titleField: 'title',
    titleMin: 15,
    titleMax: 70,
    descField: 'description',
    descFallbackField: null,
    descMin: 120,
    descMax: 160,
    descRequired: true,
  },
  {
    name: 'news',
    match: rel => rel.startsWith('news/'),
    titleField: 'title',
    titleMin: 15,
    titleMax: 70,
    descField: 'teaser',
    descMin: 80,
    descMax: 200,
    descRequired: false,
  },
  {
    name: 'zitate',
    match: rel => /^quellen\/[^/]+\/[^/]+\/zitate\//.test(rel),
    titleField: 'title',
    titleMin: 8,
    titleMax: 90,
    descField: 'teaser',
    // teaser bei zitate ist das Originalzitat, kein SEO-Description-Feld.
    // descRequired bleibt aktiv (Teaser muss existieren), Laengen werden nicht geprueft.
    descMin: 0,
    descMax: Number.MAX_SAFE_INTEGER,
    descRequired: true,
    descSkipLengthValidation: true,
  },
  {
    name: 'quellen',
    match: rel => /^quellen\/[^/]+\/[^/]+\/index\.md$/.test(rel),
    titleField: 'name',
    titleMin: 2,
    titleMax: 90,
    descField: 'description',
    descMin: 60,
    descMax: 240,
    descRequired: false,
  },
  {
    name: 'quellenlinks',
    match: rel => /^quellen\/[^/]+\/[^/]+\/links\//.test(rel),
    titleField: 'title',
    titleMin: 5,
    titleMax: 110,
    descField: 'description',
    descMin: 80,
    descMax: 200,
    descRequired: true,
  },
]

function resolveSeoRule(relPath: string): SeoCollectionRule | null {
  return SEO_COLLECTIONS.find(c => c.match(relPath)) ?? null
}

function indexAtLine(text: string, line: number): number {
  let idx = 0
  for (let i = 1; i < line; i++) {
    const nl = text.indexOf('\n', idx)
    if (nl === -1) break
    idx = nl + 1
  }
  return idx
}

function fieldLineNumber(text: string, key: string): number {
  const re = new RegExp(`^${key}:`, 'm')
  const m = re.exec(text)
  if (!m) return 1
  return text.slice(0, m.index).split('\n').length
}

function checkFrontmatterSeo(file: string, text: string, lines: string[], findings: Finding[]) {
  const fm = extractFrontmatter(text)
  if (!fm) return
  const relFromContent = relative(CONTENT_ROOT, file).replaceAll('\\', '/')
  const rule = resolveSeoRule(relFromContent)
  if (!rule) return

  const titleVal = fm.fields[rule.titleField]
  const titleLine = fieldLineNumber(text, rule.titleField)
  const titleIdx = indexAtLine(text, titleLine)
  if (!titleVal) {
    addFinding(findings, file, text, lines, titleIdx, 'seo-title-missing',
      `Pflichtfeld "${rule.titleField}" fehlt`, 'error')
  } else {
    if (titleVal.length < rule.titleMin) {
      addFinding(findings, file, text, lines, titleIdx, 'seo-title-short',
        `Title zu kurz: ${titleVal.length} Zeichen (min ${rule.titleMin})`, 'error')
    }
    if (titleVal.length > rule.titleMax) {
      addFinding(findings, file, text, lines, titleIdx, 'seo-title-long',
        `Title zu lang: ${titleVal.length} Zeichen (max ${rule.titleMax}) - Google kürzt in den SERPs`, 'error')
    }
  }

  if (rule.descField) {
    const descVal = fm.fields[rule.descField] ?? ''
    const fallbackVal = rule.descFallbackField ? (fm.fields[rule.descFallbackField] ?? '') : ''
    const effective = descVal || fallbackVal
    const descLine = fieldLineNumber(text, rule.descField)
    const descIdx = indexAtLine(text, descLine)

    if (!descVal && rule.descRequired) {
      addFinding(findings, file, text, lines, descIdx, 'seo-desc-missing',
        `Pflichtfeld "${rule.descField}" fehlt`, 'error')
    }
    if (!effective && !rule.descRequired) {
      addFinding(findings, file, text, lines, descIdx, 'seo-desc-empty',
        `Weder "${rule.descField}"${rule.descFallbackField ? ` noch "${rule.descFallbackField}"` : ''} gesetzt - Meta-Description faellt auf Default zurueck`, 'warn')
    }
    if (!rule.descSkipLengthValidation && effective && effective.length < rule.descMin) {
      const which = descVal ? rule.descField : rule.descFallbackField
      addFinding(findings, file, text, lines, descIdx, 'seo-desc-short',
        `Description ("${which}") zu kurz: ${effective.length} Zeichen (min ${rule.descMin})`, 'error')
    }
    if (!rule.descSkipLengthValidation && effective && effective.length > rule.descMax) {
      const which = descVal ? rule.descField : rule.descFallbackField
      addFinding(findings, file, text, lines, descIdx, 'seo-desc-long',
        `Description ("${which}") zu lang: ${effective.length} Zeichen (max ${rule.descMax}) - Google kürzt`, 'error')
    }
  }
}

function checkTagMismatch(file: string, text: string, lines: string[], findings: Finding[]) {
  const bodyStart = text.startsWith('---\n') ? (text.indexOf('\n---\n') + 5) : 0
  const body = text.slice(bodyStart)
  const codeMask = buildCodeMask(body)

  const openRe = /<([A-Z][A-Za-z0-9]*)\b([^>]*?)>/g
  const closeRe = /<\/([A-Z][A-Za-z0-9]*)>/g

  interface Open { name: string, index: number }
  const stack: Open[] = []
  type Tag = { kind: 'open' | 'close' | 'selfclose', name: string, index: number, raw: string }
  const tags: Tag[] = []
  let m: RegExpExecArray | null
  while ((m = openRe.exec(body)) !== null) {
    if (codeMask[m.index]) continue
    const selfClose = m[2].trim().endsWith('/')
    tags.push({ kind: selfClose ? 'selfclose' : 'open', name: m[1], index: m.index, raw: m[0] })
  }
  while ((m = closeRe.exec(body)) !== null) {
    if (codeMask[m.index]) continue
    tags.push({ kind: 'close', name: m[1], index: m.index, raw: m[0] })
  }
  tags.sort((a, b) => a.index - b.index)

  for (const tag of tags) {
    if (tag.kind === 'selfclose') continue
    if (tag.kind === 'open') {
      stack.push({ name: tag.name, index: tag.index })
    } else {
      const last = stack.pop()
      if (!last) {
        addFinding(findings, file, text, lines, bodyStart + tag.index, 'tag-mismatch',
          `Schliessendes Tag </${tag.name}> ohne passendes Oeffnungstag`)
      } else if (last.name !== tag.name) {
        addFinding(findings, file, text, lines, bodyStart + tag.index, 'tag-mismatch',
          `Schliessendes Tag </${tag.name}> passt nicht zu offenem <${last.name}> (Zeile ${indexToPos(text, bodyStart + last.index).line})`)
        stack.push(last)
      }
    }
  }
  for (const unclosed of stack) {
    addFinding(findings, file, text, lines, bodyStart + unclosed.index, 'tag-mismatch',
      `Oeffnendes Tag <${unclosed.name}> ohne schliessendes </${unclosed.name}>`)
  }
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[a.length][b.length]
}

function closestMatch(target: string, pool: string[]): string | null {
  let best: string | null = null
  let bestDist = Infinity
  for (const cand of pool) {
    const d = levenshtein(target.toLowerCase(), cand.toLowerCase())
    if (d < bestDist) {
      bestDist = d
      best = cand
    }
  }
  const threshold = Math.max(2, Math.floor(target.length * 0.3))
  return bestDist <= threshold ? best : null
}

function checkUnknownComponents(
  file: string,
  text: string,
  lines: string[],
  findings: Finding[],
  allowlist: Set<string>,
) {
  const bodyStart = text.startsWith('---\n') ? (text.indexOf('\n---\n') + 5) : 0
  const body = text.slice(bodyStart)
  const codeMask = buildCodeMask(body)
  const tagRe = /<([A-Z][A-Za-z0-9]*)\b/g
  let m: RegExpExecArray | null
  const reported = new Set<string>()
  while ((m = tagRe.exec(body)) !== null) {
    if (codeMask[m.index]) continue
    const name = m[1]
    if (allowlist.has(name) || MDC_BUILT_INS.has(name)) continue
    const suggestion = closestMatch(name, [...allowlist])
    const suggestionText = suggestion ? ` Meintest du <${suggestion}>?` : ''
    const key = `${name}@${m.index}`
    if (reported.has(key)) continue
    reported.add(key)
    addFinding(findings, file, text, lines, bodyStart + m.index, 'unknown-component',
      `Unbekannte MDC-Komponente <${name}>.${suggestionText}`)
  }
}

function getBodyStart(text: string): number {
  return text.startsWith('---\n') ? (text.indexOf('\n---\n') + 5) : 0
}

function checkLiteralEscapes(file: string, text: string, lines: string[], findings: Finding[]) {
  const bodyStart = getBodyStart(text)
  const body = text.slice(bodyStart)
  const codeMask = buildCodeMask(body)
  const re = /\\(u[0-9a-fA-F]{4}|n|t)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    if (codeMask[m.index]) continue
    addFinding(findings, file, text, lines, bodyStart + m.index, 'literal-escape',
      `Literale Escape-Sequenz '${m[0]}' im Text. Wahrscheinlich fehlgeschlagener Unescape.`)
  }
}

function checkStrayEmphasis(file: string, text: string, lines: string[], findings: Finding[]) {
  const bodyStart = getBodyStart(text)
  const body = text.slice(bodyStart)
  const codeMask = buildCodeMask(body)
  const re = /[A-Za-zÄÖÜäöüß0-9]\*(?!\*)[A-Za-zÄÖÜäöüß0-9]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    if (codeMask[m.index]) continue
    addFinding(findings, file, text, lines, bodyStart + m.index + 1, 'stray-emphasis',
      `Einzelnes '*' zwischen Wortzeichen. Markdown rendert das faelschlich als Emphasis.`, 'warn')
  }
}

function checkNbspEntity(file: string, text: string, lines: string[], findings: Finding[]) {
  const bodyStart = getBodyStart(text)
  const body = text.slice(bodyStart)
  const codeMask = buildCodeMask(body)
  const re = /&nbsp;/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    if (codeMask[m.index]) continue
    addFinding(findings, file, text, lines, bodyStart + m.index, 'nbsp-entity',
      `'&nbsp;'-Entity statt Unicode-NBSP (U+00A0). Auto-fixbar mit --fix.`, 'warn')
  }
}

function checkEmDash(file: string, text: string, lines: string[], findings: Finding[]) {
  const bodyStart = text.startsWith('---\n') ? (text.indexOf('\n---\n') + 5) : 0
  const body = text.slice(bodyStart)
  const codeMask = buildCodeMask(body)
  const linesBody = splitLines(body)
  let lineStart = 0
  for (let lineIdx = 0; lineIdx < linesBody.length; lineIdx++) {
    const line = linesBody[lineIdx]
    const isQuote = line.trimStart().startsWith('>')
    if (!isQuote) {
      for (let i = 0; i < line.length; i++) {
        const abs = lineStart + i
        if (codeMask[abs]) continue
        if (line.charCodeAt(i) === 0x2014) {
          addFinding(findings, file, text, lines, bodyStart + abs, 'em-dash',
            `Em-Dash '—' im Fliesstext. CLAUDE.md verbietet Gedankenstriche. Durch Doppelpunkt, Komma oder Punkt ersetzen.`)
        }
      }
    }
    lineStart += line.length + 1
  }
}

function checkTypographicQuotes(file: string, text: string, lines: string[], findings: Finding[]) {
  const bodyStart = getBodyStart(text)
  const map: Record<string, string> = {
    '\u201e': '„ (U+201E)',
    '\u201c': '" (U+201C)',
    '\u201d': '" (U+201D)',
    '\u00ab': '« (U+00AB)',
    '\u00bb': '» (U+00BB)',
    '\u2018': '\' (U+2018)',
    '\u2019': '\' (U+2019)',
  }
  // Frontmatter: typografische Quotes brechen YAML-Strings (U+201C / U+201D besonders,
  // weil sie visuell an das Schliessen einer "..."-Sequenz erinnern und Parser/Editor
  // je nach Encoding stolpern). Hard error, kein Auto-Fix - autofix in YAML waere
  // riskant und wuerde die kaputte Struktur nur verschieben.
  const frontmatter = text.slice(0, bodyStart)
  for (let i = 0; i < frontmatter.length; i++) {
    const c = frontmatter[i]
    if (map[c]) {
      addFinding(findings, file, text, lines, i, 'typographic-quote-frontmatter',
        `Typografisches Anfuehrungszeichen ${map[c]} in Frontmatter. Bricht YAML-Parsing oder verfaelscht Metadaten. Manuell durch gerade " ersetzen oder Formulierung umschreiben.`, 'error')
    }
  }
  // Body: weiterhin warn + auto-fixbar. Typografische Quotes sind hier ein KI-Tell.
  const body = text.slice(bodyStart)
  const codeMask = buildCodeMask(body)
  for (let i = 0; i < body.length; i++) {
    if (codeMask[i]) continue
    const c = body[i]
    if (map[c]) {
      addFinding(findings, file, text, lines, bodyStart + i, 'typographic-quote',
        `Typografisches Anfuehrungszeichen ${map[c]}. Auto-fixbar mit --fix.`, 'warn')
    }
  }
}

function checkDateNbsp(file: string, text: string, lines: string[], findings: Finding[]) {
  const bodyStart = text.startsWith('---\n') ? (text.indexOf('\n---\n') + 5) : 0
  const body = text.slice(bodyStart)
  const codeMask = buildCodeMask(body)
  const re = new RegExp(`\\b\\d{1,2}\\. (${MONTHS_DE.join('|')})\\b`, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    if (codeMask[m.index]) continue
    addFinding(findings, file, text, lines, bodyStart + m.index, 'date-nbsp',
      `Datumsangabe mit regulaerem Leerzeichen zwischen Tag und Monat. Erwartet: NBSP (U+00A0).`, 'warn')
  }
}

function checkFrontmatterColonInValue(file: string, text: string, lines: string[], findings: Finding[]) {
  // Faengt unquotete YAML-Skalare ab, deren Wert ein ': ' (Doppelpunkt + Space) enthaelt.
  // Solche Werte werden je nach Parser fehlerhaft als verschachtelter Mapping-Key gelesen.
  const fmStart = text.startsWith('---\n') ? 4 : -1
  if (fmStart < 0) return
  const fmEnd = text.indexOf('\n---\n', fmStart)
  if (fmEnd < 0) return
  const fmText = text.slice(fmStart, fmEnd)
  let lineStart = fmStart
  for (const rawLine of fmText.split('\n')) {
    const m = /^(\s*[-]?\s*)([A-Za-z_][A-Za-z0-9_]*):\s+(.*)$/.exec(rawLine)
    if (m) {
      const value = m[3]
      const first = value.charAt(0)
      const isQuoted = first === '"' || first === '\''
      const isBlockScalar = first === '|' || first === '>'
      const isFlow = first === '[' || first === '{'
      const isAnchor = first === '&' || first === '*'
      if (!isQuoted && !isBlockScalar && !isFlow && !isAnchor && value.length > 0) {
        const colonSpace = value.indexOf(': ')
        if (colonSpace >= 0) {
          const valueStart = lineStart + rawLine.length - value.length
          const idx = valueStart + colonSpace
          addFinding(findings, file, text, lines, idx, 'yaml-unquoted-colon',
            `Unquoteter YAML-Wert mit ': ' (Doppelpunkt + Leerzeichen): kann je nach Parser fehlerhaft als verschachtelter Key gelesen werden. Wert in "..." oder '...' setzen oder Formulierung ohne ': ' waehlen.`, 'error')
        }
      }
    }
    lineStart += rawLine.length + 1
  }
}

function checkFrontmatterTags(file: string, text: string, lines: string[], findings: Finding[]) {
  const fm = extractFrontmatter(text)
  if (!fm) return
  const allowed = /^[A-Za-zÄÖÜäöüß0-9\- ]+$/
  for (const tag of fm.tags) {
    if (!allowed.test(tag)) {
      const idx = text.indexOf(`- ${tag}`)
      addFinding(findings, file, text, lines, idx >= 0 ? idx : 0, 'tag-url-unsafe',
        `Tag '${tag}' enthaelt URL-unsichere Zeichen. Erlaubt: Buchstaben, Zahlen, Bindestrich, Leerzeichen.`)
    }
  }
}

function autofix(text: string): string {
  // Step 1: typografische Anfuehrungszeichen (nur im Body, nicht in Frontmatter)
  const fmStart = getBodyStart(text)
  const frontmatterText = text.slice(0, fmStart)
  const bodyText = text.slice(fmStart)
  const codeMask = buildCodeMask(bodyText)
  let bodyOut = ''
  for (let i = 0; i < bodyText.length; i++) {
    if (codeMask[i]) {
      bodyOut += bodyText[i]
      continue
    }
    const c = bodyText[i]
    if (c === '\u201e' || c === '\u201c' || c === '\u201d' || c === '\u00ab' || c === '\u00bb') {
      bodyOut += '"'
      continue
    }
    if (c === '\u2018' || c === '\u2019') {
      bodyOut += '\''
      continue
    }
    bodyOut += c
  }
  const out = frontmatterText + bodyOut
  // Step 2: &nbsp; -> U+00A0
  let step2 = ''
  const mask2 = buildCodeMask(out)
  for (let i = 0; i < out.length;) {
    if (!mask2[i] && out.slice(i, i + 6) === '&nbsp;') {
      step2 += '\u00A0'
      i += 6
    } else {
      step2 += out[i]
      i++
    }
  }
  // Step 3: literale \u00A0 -> U+00A0 (nur \u00a0 case-insensitive, außerhalb Code)
  const mask3 = buildCodeMask(step2)
  let step3 = ''
  for (let i = 0; i < step2.length;) {
    if (!mask3[i] && /^\\u00[aA]0/.test(step2.slice(i, i + 6))) {
      step3 += '\u00A0'
      i += 6
    } else {
      step3 += step2[i]
      i++
    }
  }
  // Step 4: Em-Dash " — " -> ": " wenn Folgewort gross beginnt, sonst ", "
  const mask4 = buildCodeMask(step3)
  let step4 = ''
  for (let i = 0; i < step3.length;) {
    if (!mask4[i] && step3[i] === '\u2014' && i > 0 && step3[i - 1] === ' ' && step3[i + 1] === ' ') {
      let j = i + 2
      while (j < step3.length && step3[j] === ' ') j++
      const nextChar = step3[j] ?? ''
      if (/[A-ZÄÖÜ]/.test(nextChar)) {
        step4 = step4.slice(0, -1) + ': '
      } else {
        step4 = step4.slice(0, -1) + ', '
      }
      i += 2
      continue
    }
    step4 += step3[i]
    i++
  }
  // Step 5: Datumsangaben "DD. Monat" -> "DD.\u00A0Monat" (nur ausserhalb Frontmatter + Code)
  const bodyStart = getBodyStart(step4)
  const frontmatter = step4.slice(0, bodyStart)
  const body = step4.slice(bodyStart)
  const mask5 = buildCodeMask(body)
  const dateRe = new RegExp(`\\b(\\d{1,2}\\.) (${MONTHS_DE.join('|')})\\b`, 'g')
  let bodyFixed = ''
  let lastIndex = 0
  let dm: RegExpExecArray | null
  while ((dm = dateRe.exec(body)) !== null) {
    if (mask5[dm.index]) continue
    bodyFixed += body.slice(lastIndex, dm.index) + dm[1] + '\u00A0' + dm[2]
    lastIndex = dm.index + dm[0].length
  }
  bodyFixed += body.slice(lastIndex)
  return frontmatter + bodyFixed
}

function checkFile(file: string, text: string, allowlist: Set<string>, findings: Finding[]) {
  const lines = splitLines(text)
  checkTagMismatch(file, text, lines, findings)
  checkUnknownComponents(file, text, lines, findings, allowlist)
  checkLiteralEscapes(file, text, lines, findings)
  checkStrayEmphasis(file, text, lines, findings)
  checkNbspEntity(file, text, lines, findings)
  checkEmDash(file, text, lines, findings)
  checkTypographicQuotes(file, text, lines, findings)
  checkDateNbsp(file, text, lines, findings)
  checkFrontmatterTags(file, text, lines, findings)
  checkFrontmatterColonInValue(file, text, lines, findings)
  checkFrontmatterSeo(file, text, lines, findings)
}

function report(findings: Finding[], quiet: boolean): number {
  if (findings.length === 0) {
    console.log(`${GREEN}${BOLD}✓${RESET} ${GREEN}Alle Content-Dateien bestanden den Lint.${RESET}`)
    return 0
  }
  const byFile = new Map<string, Finding[]>()
  for (const f of findings) {
    const arr = byFile.get(f.file) ?? []
    arr.push(f)
    byFile.set(f.file, arr)
  }
  for (const list of byFile.values()) list.sort((a, b) => a.line - b.line || a.col - b.col)
  let errorCount = 0
  let warnCount = 0
  if (!quiet) {
    for (const [file, list] of [...byFile.entries()].sort()) {
      const rel = relative(PROJECT_ROOT, file)
      console.log(`\n${BOLD}${CYAN}${rel}${RESET}`)
      for (const f of list) {
        const color = f.severity === 'error' ? RED : YELLOW
        const tag = f.severity === 'error' ? 'ERROR' : 'WARN '
        console.log(`  ${color}${tag}${RESET} ${GRAY}${f.line}:${f.col}${RESET}  ${BOLD}${f.rule}${RESET}  ${f.message}`)
        if (f.snippet) console.log(`    ${GRAY}│${RESET} ${f.snippet}`)
      }
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
  const args = process.argv.slice(2)
  const fix = args.includes('--fix')
  const quiet = args.includes('--quiet')
  const changedOnly = args.includes('--changed')
  const noExternal = args.includes('--no-external')
  const allowlist = await collectComponentNames(COMPONENTS_ROOT)
  if (!quiet) console.log(`${GRAY}Component-Allowlist: ${allowlist.size} Namen${RESET}`)

  let files: string[]
  if (changedOnly) {
    files = await collectChangedMarkdownFiles()
    if (!quiet) console.log(`${GRAY}Modus --changed: ${files.length} geaenderte Markdown-Dateien gegen origin/main${RESET}`)
  } else {
    files = await collectMarkdownFiles(CONTENT_ROOT)
    if (!quiet) console.log(`${GRAY}Pruefe ${files.length} Markdown-Dateien ...${RESET}`)
  }

  const findings: Finding[] = []
  const texts = new Map<string, string>()

  for (const file of files) {
    const text = await readFile(file, 'utf-8')
    texts.set(file, text)
    if (fix) {
      const fixed = autofix(text)
      if (fixed !== text) {
        await writeFile(file, fixed)
        texts.set(file, fixed)
        checkFile(file, fixed, allowlist, findings)
      } else {
        checkFile(file, text, allowlist, findings)
      }
    } else {
      checkFile(file, text, allowlist, findings)
    }
  }

  // Link-Linter (async, HTTP)
  await checkBrokenLinks(files, texts, findings, quiet, noExternal)

  const errorCount = report(findings, quiet)
  process.exit(errorCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(`${RED}${BOLD}Fehler:${RESET}`, err)
  process.exit(2)
})
