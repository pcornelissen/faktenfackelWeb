#!/usr/bin/env node
/**
 * generateSourceIndex.mjs
 *
 * Liest alle Quellen (index.md) und Quellenlinks (links/*.md) und
 * erzeugt _sourceindex.json als schnellen Lookup-Index.
 *
 * Usage:
 *   node scripts/generateSourceIndex.mjs
 *   pnpm sourceIndex
 *
 * Output: _sourceindex.json im website/-Root
 *
 * Struktur:
 *   sources[]       — alle Quelldateien mit Metadaten
 *   links[]         — alle Quellenlinks mit Metadaten
 *   codeIndex       — code → { linkPath, sourcePath }
 *   sourceByName    — lowercase name → sourcePath
 *   sourceLinks     — sourcePath → [codes]
 *   stats           — Anzahl Quellen, Links, Gruppen
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const QUELLEN_DIR = join(ROOT, 'content', 'quellen')
const OUTPUT_FILE = join(ROOT, '_sourceindex.json')

// ─── Frontmatter Parser ────────────────────────────────────────────────────

/**
 * Parst YAML-Frontmatter aus Markdown-Dateien.
 * Unterstützt: string, quoted string, inline array [ a, b, c ]
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}

  const result = {}
  const lines = match[1].split('\n')

  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (!kv) continue

    const key = kv[1]
    const raw = kv[2].trim()

    // Inline-Array: [ item1, item2 ] oder []
    if (raw.startsWith('[')) {
      const inner = raw.slice(1, raw.lastIndexOf(']'))
      result[key] = inner.trim()
        ? inner.split(',').map(s => s.trim()).filter(Boolean)
        : []
      continue
    }

    // Quoted string: "value" oder 'value'
    if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith('\'') && raw.endsWith('\''))) {
      result[key] = raw.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, '\'')
      continue
    }

    // Einfacher Wert (leere Strings als null)
    result[key] = raw || null
  }

  return result
}

// ─── Verzeichnis-Walker ────────────────────────────────────────────────────

function readDir(path) {
  try {
    return readdirSync(path, { withFileTypes: true })
  } catch {
    return []
  }
}

function readFile(path) {
  try {
    return readFileSync(path, 'utf-8')
  } catch {
    return null
  }
}

// ─── Index aufbauen ────────────────────────────────────────────────────────

const sources = []
const links = []
const codeIndex = {}
const sourceByName = {}
const sourceLinks = {}

const groups = readDir(QUELLEN_DIR)
  .filter(e => e.isDirectory())
  .map(e => e.name)

for (const group of groups) {
  const groupDir = join(QUELLEN_DIR, group)
  const sourceDirs = readDir(groupDir)
    .filter(e => e.isDirectory())
    .map(e => e.name)

  for (const sourceSlug of sourceDirs) {
    const sourcePath = `${group}/${sourceSlug}` // relativ zu quellen/
    const sourceDir = join(groupDir, sourceSlug)

    // ── Quelldatei (index.md) ──────────────────────────────────────────────
    const indexPath = join(sourceDir, 'index.md')
    if (existsSync(indexPath)) {
      const content = readFile(indexPath)
      if (content) {
        const fm = parseFrontmatter(content)
        const sourceEntry = {
          path: sourcePath,
          group,
          slug: sourceSlug,
          name: fm.name || sourceSlug,
          description: fm.description || null,
          tags: Array.isArray(fm.tags) ? fm.tags : [],
          date: fm.date || null,
          hasImage: fm.image != null,
        }
        sources.push(sourceEntry)
        sourceByName[(fm.name || sourceSlug).toLowerCase()] = sourcePath
        sourceLinks[sourcePath] = []
      }
    }

    // ── Links (links/*.md) ────────────────────────────────────────────────
    const linksDir = join(sourceDir, 'links')
    if (existsSync(linksDir)) {
      const linkFiles = readDir(linksDir)
        .filter(e => e.isFile() && e.name.endsWith('.md'))
        .map(e => e.name)

      for (const linkFile of linkFiles) {
        const content = readFile(join(linksDir, linkFile))
        if (!content) continue

        const fm = parseFrontmatter(content)
        if (!fm.code) continue

        // Dateiname ohne .md und Datumspräfix als Slug
        const fileSlug = linkFile.replace(/\.md$/, '')
        const linkPath = `${sourcePath}/links/${fileSlug}`

        const linkEntry = {
          path: linkPath,
          source: sourcePath,
          code: fm.code,
          title: fm.title || null,
          uri: fm.uri || null,
          type: fm.type || null,
          tags: Array.isArray(fm.tags) ? fm.tags : [],
          coSources: Array.isArray(fm.coSources) ? fm.coSources : [],
          date: fm.date || null,
          verdict: fm.verdict || null,
        }
        links.push(linkEntry)

        // codeIndex
        codeIndex[fm.code] = {
          linkPath,
          sourcePath,
        }

        // sourceLinks
        if (!sourceLinks[sourcePath]) sourceLinks[sourcePath] = []
        sourceLinks[sourcePath].push(fm.code)
      }
    }
  }
}

// ─── Sortierung ────────────────────────────────────────────────────────────

sources.sort((a, b) => a.path.localeCompare(b.path))
links.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

// ─── Output ────────────────────────────────────────────────────────────────

const index = {
  generatedAt: new Date().toISOString(),
  stats: {
    sources: sources.length,
    links: links.length,
    groups: groups.length,
    codes: Object.keys(codeIndex).length,
  },
  sources,
  links,
  codeIndex,
  sourceByName,
  sourceLinks,
}

writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf-8')

console.log(`✓ _sourceindex.json erstellt`)
console.log(`  ${sources.length} Quellen, ${links.length} Links, ${Object.keys(codeIndex).length} Codes`)
console.log(`  Gruppen: ${groups.join(', ')}`)
