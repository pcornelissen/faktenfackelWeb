#!/usr/bin/env npx tsx
/**
 * FF-13 Changelog-Backfill
 *
 * Schlaegt aus der git-History fuer jede Artikeldatei "## Änderungshistorie"-
 * Eintraege vor. Klassifiziert pro Datei und Commit signifikante (inhaltliche)
 * Aenderungen vs. triviale (Tippfehler, Typografie, Lint, reine Frontmatter-/
 * Tag-/lastScanned-Pflege). Die Erstveroeffentlichung (aeltester Commit) erzeugt
 * KEINEN Eintrag.
 *
 * WICHTIG: Default ist Trockenlauf. Es wird nur ausgegeben, nichts geschrieben.
 *
 * Usage:
 *   npx tsx scripts/backfillChangelog.ts                 # Trockenlauf, alle Artikel
 *   npx tsx scripts/backfillChangelog.ts <pfad-fragment> # nur passende Pfade
 *   npx tsx scripts/backfillChangelog.ts --write         # Abschnitte schreiben
 *                                                        # (nur in Dateien ohne
 *                                                        #  bestehenden Abschnitt)
 */

import { execFile } from 'node:child_process'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const PROJECT_ROOT = join(import.meta.dirname, '..')
const CONTENT_ROOT = join(PROJECT_ROOT, 'content')

const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

const NBSP = ' '

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const pathFilters = args.filter(a => !a.startsWith('--'))

// Commit-Message-Praefixe / Schluesselwoerter, die eine Aenderung als trivial markieren.
const TRIVIAL_PREFIX = /^(chore|style|lint|format|ci|build|refactor|test)(\(|:|!)/i
const TRIVIAL_KEYWORDS = new RegExp([
  // Typografie / Formatierung / Style
  'tippfehler', 'typo', 'typografie', 'typographic', 'quotes?', 'em[- ]?dash', 'gedankenstrich',
  'nbsp', 'whitespace', 'umlaut', 'formatierung', 'reformat', '\\bstyle\\b', 'styling', 'polish',
  // Lint / technische Wartung / Referenz-Stabilisierung
  '\\blint\\b', '\\bfix(es|ed)?\\b broken', 'broken (internal |external |source)?(link|ref|code)',
  'sourceref', 'quotereference', 'reference tag', 'reference code', '\\breferences?\\b', 'stabili[sz]e',
  // SEO / Meta / A11y / Build (leserunabhaengig)
  '\\bseo\\b', 'meta[- ]?(titel|title|description)', 'descriptions? (ueber|über)arbeitet', 'snippet',
  'canonical', 'orphan', 'heading-hierarch', 'a11y', 'accessibility', 'security header',
  'font-display', 'sitemap', 'redirect', 'smoke[- ]?test', 'build-check', 'ssr', 'e2e',
  // Technische Infrastruktur / Frontmatter / Tooling
  'rss', 'feed', 'redesign', 'abh(ae|ä)ngigk', 'dependenc', 'upgrade', 'normalisier',
  'frontmatter', 'yaml', '\\bfeld\\b', 'umbenannt', 'authors-frontmatter', 'claim und claimauthor',
  'glossar eingebaut', 'technik', 'scan-links', 'summary cache', 'link-audit', 'linkcheck',
  // Redaktioneller Workflow / Frontmatter-Pflege
  'review-tag', 'research-done', 'lastscanned', 'rename', 'verschoben', 'moved', 'staging',
].join('|'), 'i')

interface Proposal {
  date: { y: number, m: number, d: number }
  iso: string
  note: string
  uncertain: boolean
  sha: string
}

async function git(gitArgs: string[]): Promise<string> {
  const { stdout } = await execFileAsync('git', gitArgs, {
    cwd: PROJECT_ROOT,
    maxBuffer: 64 * 1024 * 1024,
  })
  return stdout
}

async function collectMarkdownFiles(root: string): Promise<string[]> {
  const out: string[] = []
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const full = join(dir, e.name)
      if (e.isDirectory()) await walk(full)
      else if (e.name.endsWith('.md')) out.push(full)
    }
  }
  await walk(root)
  return out
}

function isFrontmatterFieldLine(line: string): boolean {
  // Entfernt das +/- Diff-Praefix bereits vom Aufrufer; hier reiner Inhalt.
  const t = line.trim()
  if (t === '' || t === '---') return true
  // YAML-Feld ("key:") oder Listenpunkt eines Feldes ("- wert") in Frontmatter-Naehe.
  if (/^[A-Za-z_][A-Za-z0-9_]*:/.test(t)) return true
  if (/^-\s+\S/.test(t) && !/^[-*]\s+\*\*/.test(t)) {
    // einfacher YAML-Listeneintrag (Tags, coSources, status) – kein Prosa-Bullet
    if (!/[.!?]/.test(t) && t.length < 80) return true
  }
  if (/^"[^"]*\d{4}-\d{2}-\d{2}/.test(t)) return true
  return false
}

function looksLikeProse(line: string): boolean {
  const t = line.trim()
  if (t === '') return false
  if (isFrontmatterFieldLine(t)) return false
  // Markdown-Strukturen, die inhaltlich zaehlen
  if (/^#{1,6}\s+\S/.test(t)) return true // Ueberschrift
  if (/\]\(https?:\/\//.test(t)) return true // Link
  if (/^>\s+\S/.test(t)) return true // Blockquote
  if (/^[-*]\s+\S/.test(t) && /[.!?:,]/.test(t)) return true // Prosa-Bullet
  // gewoehnlicher Satztext
  if (/\p{L}/u.test(t) && t.split(/\s+/).length >= 4) return true
  return false
}

async function classifyCommit(sha: string, file: string, subject: string): Promise<{ significant: boolean }> {
  if (TRIVIAL_PREFIX.test(subject) || TRIVIAL_KEYWORDS.test(subject)) {
    return { significant: false }
  }
  let diff = ''
  try {
    diff = await git(['show', '--format=', '--unified=0', sha, '--', file])
  } catch {
    return { significant: false }
  }
  let addedProse = 0
  let removedProse = 0
  for (const raw of diff.split('\n')) {
    if (raw.startsWith('+++') || raw.startsWith('---')) continue
    if (raw.startsWith('+')) {
      if (looksLikeProse(raw.slice(1))) addedProse++
    } else if (raw.startsWith('-')) {
      if (looksLikeProse(raw.slice(1))) removedProse++
    }
  }
  // Netto neu hinzugefuegte Prosa. Reines Umformatieren (Quotes/Dashes/Lint)
  // schreibt Zeilen um, addiert aber kaum NETTO neue Prosa und faellt damit raus.
  // Ein neuer Abschnitt o.ae. fuegt mehrere Zeilen netto hinzu.
  const netProse = addedProse - removedProse
  return { significant: netProse >= 3 }
}

function cleanSubject(subject: string): { note: string, uncertain: boolean } {
  // "type(scope): beschreibung" -> "beschreibung"
  let s = subject.replace(/^[a-z]+(\([^)]*\))?(!)?:\s*/i, '').trim()
  // Generische / unbrauchbare Messages markieren.
  const uncertain = s.length < 8 || /^(wip|fix|update|edit|aenderung|änderung|misc|stuff)$/i.test(s)
  if (s.length > 0) s = s.charAt(0).toUpperCase() + s.slice(1)
  if (!/[.!?]$/.test(s)) s += '.'
  return { note: s, uncertain }
}

function hasChangelogSection(text: string): boolean {
  return /^##[ \t]+Änderungshistorie[ \t]*$/m.test(text)
}

function formatEntry(p: Proposal): string {
  const datum = `${p.date.d}.${NBSP}${MONTHS_DE[p.date.m]} ${p.date.y}`
  const flag = p.uncertain ? ' [PRÜFEN]' : ''
  return `- **${datum}:**${flag} ${p.note}`
}

async function buildProposals(file: string): Promise<Proposal[]> {
  // Aelteste zuerst, damit der erste Commit (= Veroeffentlichung) ausgelassen wird.
  let log = ''
  try {
    log = await git(['log', '--follow', '--reverse', '--date=short', '--format=%H%x1f%ad%x1f%s', '--', file])
  } catch {
    return []
  }
  const rows = log.split('\n').filter(Boolean).map((l) => {
    const [sha, ad, subject] = l.split('\x1f')
    return { sha, ad, subject: subject ?? '' }
  })
  if (rows.length <= 1) return [] // nur Veroeffentlichung, keine Aenderung

  const proposals: Proposal[] = []
  for (let i = 1; i < rows.length; i++) {
    const { sha, ad, subject } = rows[i]
    const { significant } = await classifyCommit(sha, file, subject)
    if (!significant) continue
    const [y, m, d] = ad.split('-').map(Number)
    const { note, uncertain } = cleanSubject(subject)
    proposals.push({ date: { y, m: m - 1, d }, iso: ad, note, uncertain, sha })
  }
  // neueste zuerst
  proposals.sort((a, b) => b.iso.localeCompare(a.iso))
  return proposals
}

function appendChangelog(text: string, proposals: Proposal[]): string {
  const block = ['', '## Änderungshistorie', '', ...proposals.map(formatEntry), ''].join('\n')
  return text.replace(/\s*$/, '\n') + block
}

async function main() {
  const allFiles = await collectMarkdownFiles(CONTENT_ROOT)
  const files = pathFilters.length
    ? allFiles.filter(f => pathFilters.some(p => f.includes(p)))
    : allFiles

  let withProposals = 0
  let written = 0
  let skippedExisting = 0
  let uncertainCount = 0

  for (const file of files.sort()) {
    const proposals = await buildProposals(file)
    if (proposals.length === 0) continue
    withProposals++
    const rel = relative(PROJECT_ROOT, file)
    const text = await readFile(file, 'utf8')
    const exists = hasChangelogSection(text)

    console.log(`\n${rel}${exists ? '  (Abschnitt existiert bereits)' : ''}`)
    for (const p of proposals) {
      if (p.uncertain) uncertainCount++
      console.log(`  ${formatEntry(p)}`)
    }

    if (WRITE) {
      if (exists) {
        skippedExisting++
        console.log('  -> uebersprungen: bestehenden Abschnitt bitte manuell ergaenzen')
      } else {
        await writeFile(file, appendChangelog(text, proposals), 'utf8')
        written++
        console.log('  -> geschrieben')
      }
    }
  }

  console.log('\n----------------------------------------')
  console.log(`Dateien mit Vorschlaegen: ${withProposals}`)
  console.log(`Eintraege zur Pruefung markiert ([PRÜFEN]): ${uncertainCount}`)
  if (WRITE) {
    console.log(`Geschrieben: ${written}`)
    console.log(`Uebersprungen (Abschnitt existiert): ${skippedExisting}`)
  } else {
    console.log('Trockenlauf. Mit --write werden Abschnitte in Dateien ohne bestehenden Abschnitt geschrieben.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
