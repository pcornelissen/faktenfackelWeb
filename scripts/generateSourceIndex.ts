#!/usr/bin/env npx tsx
/**
 * Generates _sourceindex.json — a compact index of all quellen and quellenlinks
 * for efficient lookup by Claude Code agents.
 *
 * Usage: cd website && npx tsx scripts/generateSourceIndex.ts
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildGraph, writeGraphD1Sql } from './buildGraph.ts'

const SUMMARIES_CACHE_FILE = join(import.meta.dirname, '..', '..', 'knowledge-mcp', '_summaries-cache.json')

const CONTENT_ROOT = join(import.meta.dirname, '..', 'content')
const CONTENT_DIR = join(CONTENT_ROOT, 'quellen')
const ARTICLE_COLLECTIONS = ['faktenchecks', 'lagerfeuer', 'glossar'] as const
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
  referenceCodes?: string[]
  quoteCodes?: string[]
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
  referenceCodes?: string[]
  quoteCodes?: string[]
}

interface Quote {
  path: string
  source: string
  code: string
  title: string
  teaser: string
  tags: string[]
  date: string
  referenceCodes?: string[]
  quoteCodes?: string[]
}

interface Article {
  path: string // e.g. "faktenchecks/category/slug"
  collection: string // "faktenchecks" | "lagerfeuer" | "glossar"
  slug: string // relative path inside the collection, no .md
  title: string
  tags: string[]
  date: string
  publishedOn?: string
  verdict?: string
  referenceCodes?: string[]
  quoteCodes?: string[]
}

type FrontmatterValue = string | string[] | boolean
type Frontmatter = Record<string, FrontmatterValue>

/**
 * Extract referenceCodes and quoteCodes from raw markdown body.
 * Mirrors the regexes used in nuxt.config.ts content:file:afterParse hook.
 */
function extractCodeReferences(content: string): { referenceCodes: string[], quoteCodes: string[] } {
  const referenceCodes = [
    ...[...content.matchAll(/<[Ss]ource[Rr]ef\b[^>]*\bcode="([^"]+)"/g)].map(m => m[1]),
    ...[...content.matchAll(/:source-ref\{[^}]*code="([^"]+)"/g)].map(m => m[1]),
  ]
  const quoteCodes = [
    ...[...content.matchAll(/<[Qq]uote[Rr]eference\b[^>]*\bcode="([^"]+)"/g)].map(m => m[1]),
    ...[...content.matchAll(/:quote-reference\{[^}]*code="([^"]+)"/g)].map(m => m[1]),
  ]
  return {
    referenceCodes: [...new Set(referenceCodes)],
    quoteCodes: [...new Set(quoteCodes)],
  }
}

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
      const srcRefs = extractCodeReferences(content)

      sources.push({
        path: `${group}/${slug}`,
        group,
        slug,
        name: fm.name || slug,
        ...(fm.description ? { description: fm.description } : {}),
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        date: fm.date || '',
        hasImage,
        ...(srcRefs.referenceCodes.length ? { referenceCodes: srcRefs.referenceCodes } : {}),
        ...(srcRefs.quoteCodes.length ? { quoteCodes: srcRefs.quoteCodes } : {}),
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
          const linkRefs = extractCodeReferences(linkContent)
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
            ...(linkRefs.referenceCodes.length ? { referenceCodes: linkRefs.referenceCodes } : {}),
            ...(linkRefs.quoteCodes.length ? { quoteCodes: linkRefs.quoteCodes } : {}),
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
          const quoteRefs = extractCodeReferences(quoteContent)
          quotes.push({
            path: `${group}/${slug}/zitate/${file.replace('.md', '')}`,
            source: `${group}/${slug}`,
            code: qfm.code || '',
            title: qfm.title || '',
            teaser: qfm.teaser || '',
            tags: Array.isArray(qfm.tags) ? qfm.tags : [],
            date: qfm.date || '',
            ...(quoteRefs.referenceCodes.length ? { referenceCodes: quoteRefs.referenceCodes } : {}),
            ...(quoteRefs.quoteCodes.length ? { quoteCodes: quoteRefs.quoteCodes } : {}),
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

async function walkMarkdown(dir: string, base = dir): Promise<string[]> {
  const files: string[] = []
  let entries: string[] = []
  try {
    entries = await readdir(dir)
  } catch {
    return files
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    const s = await stat(full)
    if (s.isDirectory()) {
      files.push(...await walkMarkdown(full, base))
    } else if (entry.endsWith('.md')) {
      files.push(full)
    }
  }
  return files
}

async function collectArticles(): Promise<Article[]> {
  const articles: Article[] = []
  for (const collection of ARTICLE_COLLECTIONS) {
    const collectionDir = join(CONTENT_ROOT, collection)
    if (!await exists(collectionDir)) continue
    const files = await walkMarkdown(collectionDir)
    for (const filePath of files) {
      const content = await readFile(filePath, 'utf-8')
      const fm = parseFrontmatter(content)
      const refs = extractCodeReferences(content)
      const relative = filePath.substring(collectionDir.length + 1).replace(/\.md$/, '')
      articles.push({
        path: `${collection}/${relative}`,
        collection,
        slug: relative,
        title: fm.title || relative,
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        date: fm.date || '',
        ...(fm.publishedOn ? { publishedOn: fm.publishedOn } : {}),
        ...(fm.verdict ? { verdict: fm.verdict } : {}),
        ...(refs.referenceCodes.length ? { referenceCodes: refs.referenceCodes } : {}),
        ...(refs.quoteCodes.length ? { quoteCodes: refs.quoteCodes } : {}),
      })
    }
  }
  articles.sort((a, b) => a.path.localeCompare(b.path))
  return articles
}

async function main() {
  const [{ sources, links, quotes }, articles] = await Promise.all([
    collectSources(),
    collectArticles(),
  ])
  const codes = new Set([...links.map(l => l.code), ...quotes.map(q => q.code)])

  const index = {
    generatedAt: new Date().toISOString(),
    stats: {
      sources: sources.length,
      links: links.length,
      quotes: quotes.length,
      articles: articles.length,
      groups: new Set(sources.map(s => s.group)).size,
      codes: codes.size,
    },
    sources,
    links,
    quotes,
    articles,
  }

  await writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2) + '\n')
  console.log(`Generated ${OUTPUT_FILE}`)
  console.log(`  ${sources.length} sources, ${links.length} links, ${quotes.length} quotes, ${articles.length} articles in ${index.stats.groups} groups`)
  const withSummary = links.filter(l => l.summary).length
  console.log(`  ${withSummary} links with summary (cached where date unchanged)`)
  const graphDbPath = process.env.GRAPH_DB
    ?? join(import.meta.dirname, '..', '..', 'knowledge-mcp', 'graph.sqlite')
  buildGraph({ sources, links, quotes, articles }, graphDbPath)
  console.log(`  Graph written to ${graphDbPath}`)

  const d1SqlPath = join(import.meta.dirname, '..', '.graph-d1.sql')
  const d1Stats = writeGraphD1Sql({ sources, links, quotes, articles }, d1SqlPath)
  console.log(`  D1 SQL dump written to ${d1SqlPath} (${d1Stats.nodes} nodes, ${d1Stats.edges} edges)`)
}

main().catch(console.error)
