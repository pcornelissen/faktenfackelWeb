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
 *
 * Usage:
 *   pnpm check:content           # nur prüfen
 *   pnpm check:content --fix     # auto-fix für NBSP-Entity + typogr. Quotes
 *   pnpm check:content --quiet   # nur Zusammenfassung
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

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
  return { raw, start, end, tags }
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
  const body = text.slice(bodyStart)
  const codeMask = buildCodeMask(body)
  const map: Record<string, string> = {
    '\u201e': '„ (U+201E)',
    '\u201c': '" (U+201C)',
    '\u201d': '" (U+201D)',
    '\u00ab': '« (U+00AB)',
    '\u00bb': '» (U+00BB)',
    '\u2018': '\' (U+2018)',
    '\u2019': '\' (U+2019)',
  }
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
  const allowlist = await collectComponentNames(COMPONENTS_ROOT)
  if (!quiet) console.log(`${GRAY}Component-Allowlist: ${allowlist.size} Namen${RESET}`)

  const files = await collectMarkdownFiles(CONTENT_ROOT)
  if (!quiet) console.log(`${GRAY}Pruefe ${files.length} Markdown-Dateien ...${RESET}`)

  const findings: Finding[] = []
  for (const file of files) {
    const text = await readFile(file, 'utf-8')
    if (fix) {
      const fixed = autofix(text)
      if (fixed !== text) {
        await writeFile(file, fixed)
        checkFile(file, fixed, allowlist, findings)
      } else {
        checkFile(file, text, allowlist, findings)
      }
    } else {
      checkFile(file, text, allowlist, findings)
    }
  }

  const errorCount = report(findings, quiet)
  process.exit(errorCount > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(`${RED}${BOLD}Fehler:${RESET}`, err)
  process.exit(2)
})
