#!/usr/bin/env npx tsx
/**
 * Generates _sourceindex.json — a compact index of all quellen and quellenlinks
 * for efficient lookup by Claude Code agents.
 *
 * Usage: cd website && npx tsx scripts/generateSourceIndex.ts
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildGraph } from './buildGraph.ts'

const SUMMARIES_CACHE_FILE = join(import.meta.dirname, '..', '..', 'knowledge-mcp', '_summaries-cache.json')

const CONTENT_DIR = join(import.meta.dirname, '..', 'content', 'quellen')
const OUTPUT_FILE = join(import.meta.dirname, '..', '..', 'knowledge-mcp', '_sourceindex.json')

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
  summary?: string
  uri: string
  type?: string
  tags: string[]
  date: string
  lastScanned?: string
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

function extractSummary(content: string): string | undefined {
  // Body starts after the closing ---
  const parts = content.split(/^---$/m)
  if (parts.length < 3) return undefined
  const body = parts.slice(2).join('---').trim()

  // Take text before the first ## heading or first blank line after content starts
  const beforeHeading = body.split(/^##\s/m)[0].trim()
  const firstParagraph = beforeHeading.split(/\n\n/)[0].trim()
  if (!firstParagraph) return undefined

  // Strip MDC inline tags: :quelle-ref{name="..."}, :source-ref{...}, etc.
  let summary = firstParagraph.replace(/:[a-z-]+\{[^}]*\}/g, (match) => {
    const nameMatch = match.match(/name="([^"]+)"/)
    return nameMatch ? nameMatch[1] : ''
  })

  // Strip block MDC components: <SourceRef ...>text</SourceRef> or self-closing
  summary = summary.replace(/<[A-Z][a-zA-Z]*\b[^>]*>.*?<\/[A-Z][a-zA-Z]*>/gs, '')
  summary = summary.replace(/<[A-Z][a-zA-Z]*\b[^/]*/g, '')

  // Strip markdown links [text](url) → text
  summary = summary.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Strip remaining HTML tags
  summary = summary.replace(/<[^>]+>/g, '')

  // Collapse whitespace
  summary = summary.replace(/\s+/g, ' ').trim()

  if (!summary) return undefined

  // Cap at 250 chars
  if (summary.length > 250) {
    summary = summary.slice(0, 247) + '...'
  }

  return summary
}

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

type SummariesCache = Record<string, { date: string, summary: string }>

async function loadSummariesCache(): Promise<SummariesCache> {
  try {
    const raw = await readFile(SUMMARIES_CACHE_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function collectSources(): Promise<{ sources: Source[], links: Link[], quotes: Quote[] }> {
  const sources: Source[] = []
  const links: Link[] = []
  const quotes: Quote[] = []
  const summariesCache = await loadSummariesCache()
  const updatedCache: SummariesCache = {}

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
          const linkPath = join(linksDir, file)
          const cacheKey = `${group}/${slug}/links/${file}`
          // Read frontmatter first (lightweight) to check if date changed
          const linkContent = await readFile(linkPath, 'utf-8')
          const lfm = parseFrontmatter(linkContent)
          const fileDate = lfm.date || ''
          // Use cached summary if date hasn't changed, otherwise extract fresh
          let summary: string | undefined
          const cached = summariesCache[cacheKey]
          if (cached && cached.date === fileDate) {
            summary = cached.summary
          } else {
            summary = extractSummary(linkContent)
          }
          if (summary) {
            updatedCache[cacheKey] = { date: fileDate, summary }
          }
          links.push({
            path: `${group}/${slug}/links/${file.replace('.md', '')}`,
            source: `${group}/${slug}`,
            code: lfm.code || '',
            title: lfm.title || '',
            ...(summary ? { summary } : {}),
            uri: lfm.uri || '',
            ...(lfm.type ? { type: lfm.type } : {}),
            tags: Array.isArray(lfm.tags) ? lfm.tags : [],
            date: lfm.date || '',
            ...(lfm.lastScanned ? { lastScanned: lfm.lastScanned } : {}),
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

  // Persist updated cache (only entries that still exist)
  await writeFile(SUMMARIES_CACHE_FILE, JSON.stringify(updatedCache, null, 2) + '\n')

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
  const withSummary = links.filter(l => l.summary).length
  console.log(`  ${withSummary} links with summary (cached where date unchanged)`)
  const graphDbPath = process.env.GRAPH_DB
    ?? join(import.meta.dirname, '..', '..', 'knowledge-mcp', 'graph.sqlite')
  buildGraph({ sources, links, quotes }, graphDbPath)
  console.log(`  Graph written to ${graphDbPath}`)
}

main().catch(console.error)
