#!/usr/bin/env npx tsx
/**
 * Generates _sourceindex.json — a compact index of all quellen and quellenlinks
 * for efficient lookup by Claude Code agents.
 *
 * Usage: cd website && npx tsx scripts/generateSourceIndex.ts
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const CONTENT_DIR = join(import.meta.dirname, '..', 'content', 'quellen')
const OUTPUT_FILE = join(import.meta.dirname, '..', '_sourceindex.json')

interface Source {
  path: string
  group: string
  slug: string
  name: string
  description?: string
  tags: string[]
  date: string
  hasImage: boolean
}

interface Link {
  path: string
  source: string
  code: string
  title: string
  uri: string
  type?: string
  tags: string[]
  sourceDate?: string
  verdict?: string
  coSources: string[]
}

interface Quote {
  path: string
  source: string
  code: string
  title: string
  teaser: string
  tags: string[]
  date: string
}

type FrontmatterValue = string | string[] | boolean
type Frontmatter = Record<string, FrontmatterValue>

function parseFrontmatter(content: string): Frontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const fm: Frontmatter = {}
  let currentKey = ''
  let inArray = false
  const lines = match[1].split('\n')
  for (const line of lines) {
    if (inArray) {
      const itemMatch = line.match(/^\s+-\s+(.+)/)
      if (itemMatch) {
        if (!Array.isArray(fm[currentKey])) fm[currentKey] = []
        fm[currentKey].push(itemMatch[1].replace(/^["']|["']$/g, ''))
        continue
      }
      inArray = false
    }
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/)
    if (kvMatch) {
      currentKey = kvMatch[1]
      const val = kvMatch[2].trim()
      if (val === '' || val === '[]') {
        fm[currentKey] = val === '[]' ? [] : ''
        inArray = val === ''
      } else if (val.startsWith('[') && val.endsWith(']')) {
        fm[currentKey] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''))
      } else {
        fm[currentKey] = val.replace(/^["']|["']$/g, '')
      }
    }
  }
  return fm
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function collectSources(): Promise<{ sources: Source[], links: Link[], quotes: Quote[] }> {
  const sources: Source[] = []
  const links: Link[] = []
  const quotes: Quote[] = []

  const groups = await readdir(CONTENT_DIR)
  for (const group of groups) {
    const groupDir = join(CONTENT_DIR, group)
    const groupStat = await stat(groupDir)
    if (!groupStat.isDirectory()) continue

    const slugs = await readdir(groupDir)
    for (const slug of slugs) {
      const sourceDir = join(groupDir, slug)
      const sourceStat = await stat(sourceDir)
      if (!sourceStat.isDirectory()) continue

      const indexPath = join(sourceDir, 'index.md')
      if (!await exists(indexPath)) continue

      const content = await readFile(indexPath, 'utf-8')
      const fm = parseFrontmatter(content)
      const hasImage = await exists(join(sourceDir, 'profile.webp'))

      sources.push({
        path: `${group}/${slug}`,
        group,
        slug,
        name: fm.name || slug,
        ...(fm.description ? { description: fm.description } : {}),
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        date: fm.date || '',
        hasImage,
      })

      // Links
      const linksDir = join(sourceDir, 'links')
      if (await exists(linksDir)) {
        const linkFiles = (await readdir(linksDir)).filter(f => f.endsWith('.md'))
        for (const file of linkFiles) {
          const linkContent = await readFile(join(linksDir, file), 'utf-8')
          const lfm = parseFrontmatter(linkContent)
          links.push({
            path: `${group}/${slug}/links/${file.replace('.md', '')}`,
            source: `${group}/${slug}`,
            code: lfm.code || '',
            title: lfm.title || '',
            uri: lfm.uri || '',
            ...(lfm.type ? { type: lfm.type } : {}),
            tags: Array.isArray(lfm.tags) ? lfm.tags : [],
            ...(lfm.sourceDate ? { sourceDate: lfm.sourceDate } : {}),
            ...(lfm.verdict ? { verdict: lfm.verdict } : {}),
            coSources: Array.isArray(lfm.coSources) ? lfm.coSources : [],
          })
        }
      }

      // Quotes
      const zitateDir = join(sourceDir, 'zitate')
      if (await exists(zitateDir)) {
        const quoteFiles = (await readdir(zitateDir)).filter(f => f.endsWith('.md'))
        for (const file of quoteFiles) {
          const quoteContent = await readFile(join(zitateDir, file), 'utf-8')
          const qfm = parseFrontmatter(quoteContent)
          quotes.push({
            path: `${group}/${slug}/zitate/${file.replace('.md', '')}`,
            source: `${group}/${slug}`,
            code: qfm.code || '',
            title: qfm.title || '',
            teaser: qfm.teaser || '',
            tags: Array.isArray(qfm.tags) ? qfm.tags : [],
            date: qfm.date || '',
          })
        }
      }
    }
  }

  sources.sort((a, b) => a.path.localeCompare(b.path))
  links.sort((a, b) => a.code.localeCompare(b.code))
  quotes.sort((a, b) => a.code.localeCompare(b.code))

  return { sources, links, quotes }
}

async function main() {
  const { sources, links, quotes } = await collectSources()
  const codes = new Set([...links.map(l => l.code), ...quotes.map(q => q.code)])

  const index = {
    generatedAt: new Date().toISOString(),
    stats: {
      sources: sources.length,
      links: links.length,
      quotes: quotes.length,
      groups: new Set(sources.map(s => s.group)).size,
      codes: codes.size,
    },
    sources,
    links,
    quotes,
  }

  await writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2) + '\n')
  console.log(`Generated ${OUTPUT_FILE}`)
  console.log(`  ${sources.length} sources, ${links.length} links, ${quotes.length} quotes in ${index.stats.groups} groups`)
}

main().catch(console.error)
