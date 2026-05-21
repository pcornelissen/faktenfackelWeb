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

// Hinweis: Signifikanz wird ausschliesslich am konsolidierten Cluster-Diff
// gemessen (siehe analyzeCluster), nicht mehr an Commit-Messages. Damit fallen
// Batch-Wartungs-Commits automatisch raus, wenn sie an dieser Datei nichts
// inhaltlich Substanzielles geaendert haben.

interface Proposal {
  date: { y: number, m: number, d: number }
  iso: string
  note: string
  uncertain: boolean
  sha: string
  messages: string[] // Commit-Messages des Clusters (Hinweis)
  added: string[] // hinzugefuegte Prosa-Zeilen aus dem konsolidierten Cluster-Diff (zum Lesen)
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

// Analysiert den KONSOLIDIERTEN Diff eines Clusters (Netto-Effekt base..head).
// Signifikanz wird am tatsaechlich geaenderten Inhalt gemessen, NICHT an der
// Commit-Message. So entlarvt der Diff Batch-Messages: ein "Research 200+"-Commit,
// der an dieser Datei nur ein Status-Banner ergaenzt, faellt durch.
async function analyzeCluster(base: string, head: string, file: string): Promise<{ significant: boolean, added: string[] }> {
  let diff = ''
  try {
    diff = await git(['diff', '--unified=0', `${base}..${head}`, '--', file])
  } catch {
    return { significant: false, added: [] }
  }
  const added: string[] = []
  let removedProse = 0
  for (const raw of diff.split('\n')) {
    if (raw.startsWith('+++') || raw.startsWith('---')) continue
    if (raw.startsWith('+')) {
      const content = raw.slice(1)
      if (looksLikeProse(content)) added.push(content.trim())
    } else if (raw.startsWith('-')) {
      if (looksLikeProse(raw.slice(1))) removedProse++
    }
  }
  const netProse = added.length - removedProse
  return { significant: netProse >= 3, added }
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

// Cluster-Grenze: Liegen zwischen zwei Commits mehr als 30 Stunden, beginnt ein
// neues Bearbeitungs-Ereignis. Commits dichter beieinander (import/research/
// reviewer/scan-links/linkcheck in einem Schwung) gehoeren zu EINEM Ereignis.
const CLUSTER_GAP_SECONDS = 30 * 3600

interface CommitRow { sha: string, at: number, ad: string, subject: string }

async function buildProposals(file: string): Promise<Proposal[]> {
  // Aelteste zuerst, damit das erste Cluster (= Anlage/Veroeffentlichung) ausgelassen wird.
  let log = ''
  try {
    log = await git(['log', '--follow', '--reverse', '--date=short', '--format=%H%x1f%at%x1f%ad%x1f%s', '--', file])
  } catch {
    return []
  }
  const rows: CommitRow[] = log.split('\n').filter(Boolean).map((l) => {
    const [sha, at, ad, subject] = l.split('\x1f')
    return { sha, at: Number(at), ad, subject: subject ?? '' }
  })
  if (rows.length === 0) return []

  // In zeitliche Cluster gruppieren.
  const clusters: CommitRow[][] = []
  for (const row of rows) {
    const last = clusters[clusters.length - 1]
    if (!last || row.at - last[last.length - 1].at > CLUSTER_GAP_SECONDS) {
      clusters.push([row])
    } else {
      last.push(row)
    }
  }
  if (clusters.length <= 1) return [] // nur das Anlage-Cluster, keine spaetere Aenderung

  // Anker bestimmen: das Cluster, in dem die Anlage/Fertigstellung abgeschlossen ist.
  // Signal: erstes Cluster, dessen End-Zustand "research-done-review-pending" traegt
  // (= Quelle/Artikel fertig recherchiert/veroeffentlicht). Import-Stub (more-research-
  // needed) + spaeteres Research zaehlen damit BEIDE noch zur Anlage.
  // Faellt das Tag-Signal aus (z.B. Faktenchecks ohne dieses Tag), bleibt der Anker bei 0,
  // d.h. nur das erste Cluster gilt als Anlage.
  const relPath = relative(PROJECT_ROOT, file)
  let anchor = 0
  for (let c = 0; c < clusters.length; c++) {
    const endSha = clusters[c][clusters[c].length - 1].sha
    let content: string | null = null
    try {
      content = await git(['show', `${endSha}:${relPath}`])
    } catch {
      content = null
    }
    if (content && /research-done-review-pending/.test(content)) {
      anchor = c
      break
    }
  }

  const proposals: Proposal[] = []
  // Alle Cluster bis einschliesslich Anker (Anlage/Fertigstellung) ueberspringen.
  for (let c = anchor + 1; c < clusters.length; c++) {
    const cluster = clusters[c]
    const base = clusters[c - 1][clusters[c - 1].length - 1].sha // Ende des Vorgaenger-Clusters
    const head = cluster[cluster.length - 1].sha // Ende dieses Clusters
    const { significant, added } = await analyzeCluster(base, head, file)
    if (!significant) continue
    // Hinweis-Note aus der aussagekraeftigsten Message des Clusters (final schreibe ICH aus dem Diff).
    let best = cluster[0]
    let bestLen = cleanSubject(best.subject).note.length
    for (const row of cluster.slice(1)) {
      const len = cleanSubject(row.subject).note.length
      if (len > bestLen) {
        best = row
        bestLen = len
      }
    }
    const { note, uncertain } = cleanSubject(best.subject)
    const [y, m, d] = best.ad.split('-').map(Number)
    proposals.push({
      date: { y, m: m - 1, d },
      iso: best.ad,
      note,
      uncertain,
      sha: best.sha,
      messages: cluster.map(r => r.subject),
      added,
    })
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
      const datum = `${p.date.d}.${NBSP}${MONTHS_DE[p.date.m]} ${p.date.y}`
      console.log(`  [${datum}] Commit-Hinweis: ${p.messages.join(' | ')}`)
      const sample = p.added.slice(0, 8)
      for (const line of sample) console.log(`      + ${line.slice(0, 160)}`)
      if (p.added.length > sample.length) console.log(`      … (+${p.added.length - sample.length} weitere Prosa-Zeilen)`)
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
