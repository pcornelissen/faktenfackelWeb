import Database from 'better-sqlite3'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

export interface SourceEntry {
  path: string
  slug: string
  group: string
  name: string
  description?: string
  tags: string[]
  date: string
  publishedOn?: string
  hasImage: boolean
  referenceCodes?: string[]
  quoteCodes?: string[]
}
export interface LinkEntry {
  path: string
  code: string
  source: string
  title: string
  uri?: string
  type: string
  tags: string[]
  date: string
  publishedOn?: string
  coSources?: string[]
  verdict?: string
  summary?: string
  referenceCodes?: string[]
  quoteCodes?: string[]
}
export interface QuoteEntry {
  path: string
  code: string
  source: string
  title: string
  teaser: string
  tags: string[]
  date: string
  publishedOn?: string
  referenceCodes?: string[]
  quoteCodes?: string[]
}
export interface ArticleEntry {
  path: string
  collection: string
  slug: string
  title: string
  tags: string[]
  date: string
  publishedOn?: string
  verdict?: string
  referenceCodes?: string[]
  quoteCodes?: string[]
}
export interface SourceIndex {
  sources: SourceEntry[]
  links: LinkEntry[]
  quotes: QuoteEntry[]
  articles?: ArticleEntry[]
}

interface NodeRow {
  id: string
  type: 'source' | 'link' | 'quote' | 'article' | 'tag'
  name: string | null
  path: string | null
  group_: string | null
  date: string | null
  published_on: string | null
  verdict: string | null
  summary: string | null
  uri: string | null
}
interface EdgeRow {
  from_id: string
  to_id: string
  relation: string
}

/**
 * Pure computation: derive nodes + edges from the SourceIndex.
 * Used by both the local SQLite build (for the MCP) and the D1 SQL dump (for the website).
 */
function computeGraph(index: SourceIndex): { nodes: NodeRow[], edges: EdgeRow[] } {
  const nodeMap = new Map<string, NodeRow>()
  const edges: EdgeRow[] = []
  const addNode = (n: NodeRow) => {
    if (!nodeMap.has(n.id)) nodeMap.set(n.id, n)
  }
  const addTag = (tag: string) => addNode({ id: tag, type: 'tag', name: tag, path: null, group_: null, date: null, published_on: null, verdict: null, summary: null, uri: null })

  const pending: { from: string, code: string, relation: 'references_link' | 'references_quote' }[] = []
  const queueRefs = (from: string, refs: string[] | undefined, relation: 'references_link' | 'references_quote') => {
    for (const code of refs ?? []) pending.push({ from, code, relation })
  }

  for (const s of index.sources) {
    addNode({ id: s.slug, type: 'source', name: s.name, path: s.path, group_: s.group, date: s.date, published_on: s.publishedOn ?? null, verdict: null, summary: s.description ?? null, uri: null })
    for (const tag of s.tags) {
      addTag(tag)
      edges.push({ from_id: s.slug, to_id: tag, relation: 'has_tag' })
    }
    queueRefs(s.slug, s.referenceCodes, 'references_link')
    queueRefs(s.slug, s.quoteCodes, 'references_quote')
  }

  for (const l of index.links) {
    // For link nodes we store the content-level type (article/youtube/pdf/…) in group_ so
    // the UI can pick the right icon without a second lookup.
    addNode({ id: l.code, type: 'link', name: l.title, path: l.path, group_: l.type || null, date: l.date, published_on: l.publishedOn ?? null, verdict: l.verdict ?? null, summary: l.summary ?? null, uri: l.uri ?? null })
    const parentSlug = l.source.split('/').pop()!
    if (nodeMap.has(parentSlug)) edges.push({ from_id: l.code, to_id: parentSlug, relation: 'from_source' })
    for (const cs of l.coSources ?? []) {
      const csSlug = cs.includes('/') ? cs.split('/').pop()! : cs
      edges.push({ from_id: l.code, to_id: csSlug, relation: 'co_source' })
    }
    for (const tag of l.tags) {
      addTag(tag)
      edges.push({ from_id: l.code, to_id: tag, relation: 'has_tag' })
    }
    queueRefs(l.code, l.referenceCodes, 'references_link')
    queueRefs(l.code, l.quoteCodes, 'references_quote')
  }

  for (const q of index.quotes) {
    addNode({ id: q.code, type: 'quote', name: q.title, path: q.path, group_: null, date: q.date, published_on: q.publishedOn ?? null, verdict: null, summary: q.teaser, uri: null })
    const parentSlug = q.source.split('/').pop()!
    if (nodeMap.has(parentSlug)) edges.push({ from_id: q.code, to_id: parentSlug, relation: 'from_source' })
    for (const tag of q.tags) {
      addTag(tag)
      edges.push({ from_id: q.code, to_id: tag, relation: 'has_tag' })
    }
    queueRefs(q.code, q.referenceCodes, 'references_link')
    queueRefs(q.code, q.quoteCodes, 'references_quote')
  }

  for (const a of index.articles ?? []) {
    // Article id = "faktenchecks/slug" etc. so it cannot collide with link/quote codes.
    const articleId = a.path
    addNode({ id: articleId, type: 'article', name: a.title, path: a.path, group_: a.collection, date: a.date, published_on: a.publishedOn ?? null, verdict: a.verdict ?? null, summary: null, uri: null })
    for (const tag of a.tags) {
      addTag(tag)
      edges.push({ from_id: articleId, to_id: tag, relation: 'has_tag' })
    }
    queueRefs(articleId, a.referenceCodes, 'references_link')
    queueRefs(articleId, a.quoteCodes, 'references_quote')
  }

  // Resolve reference edges only for targets that actually exist.
  for (const { from, code, relation } of pending) {
    if (from === code) continue
    if (nodeMap.has(code)) edges.push({ from_id: from, to_id: code, relation })
  }

  return { nodes: [...nodeMap.values()], edges }
}

const SCHEMA_SQL = `
CREATE TABLE nodes (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  name         TEXT,
  path         TEXT,
  group_       TEXT,
  date         TEXT,
  published_on TEXT,
  verdict      TEXT,
  summary      TEXT,
  uri          TEXT
);

CREATE TABLE edges (
  from_id  TEXT NOT NULL,
  to_id    TEXT NOT NULL,
  relation TEXT NOT NULL
);
CREATE INDEX idx_edges_from     ON edges(from_id);
CREATE INDEX idx_edges_to       ON edges(to_id);
CREATE INDEX idx_edges_relation ON edges(relation);
CREATE INDEX idx_edges_to_rel   ON edges(to_id, relation);
CREATE INDEX idx_nodes_type     ON nodes(type);
CREATE INDEX idx_nodes_pub      ON nodes(published_on);

CREATE VIRTUAL TABLE fts USING fts5(
  id UNINDEXED,
  name,
  summary,
  content=nodes,
  content_rowid=rowid
);
`.trim()

export function buildGraph(index: SourceIndex, dbPath: string): void {
  if (!existsSync(dirname(dbPath))) mkdirSync(dirname(dbPath), { recursive: true })

  const { nodes, edges } = computeGraph(index)

  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    DROP TABLE IF EXISTS fts;
    DROP TABLE IF EXISTS edges;
    DROP TABLE IF EXISTS nodes;
    ${SCHEMA_SQL}
  `)

  const insertNode = db.prepare(
    `INSERT INTO nodes(id, type, name, path, group_, date, published_on, verdict, summary, uri) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  const insertEdge = db.prepare(
    `INSERT INTO edges(from_id, to_id, relation) VALUES (?, ?, ?)`,
  )

  const run = db.transaction(() => {
    for (const n of nodes) insertNode.run(n.id, n.type, n.name, n.path, n.group_, n.date, n.published_on, n.verdict, n.summary, n.uri)
    for (const e of edges) insertEdge.run(e.from_id, e.to_id, e.relation)
    db.exec(`INSERT INTO fts(fts) VALUES('rebuild')`)
  })

  run()
  db.close()
}

function sqlEscape(value: string | null): string {
  if (value === null) return 'NULL'
  return `'${value.replace(/'/g, '\'\'')}'`
}

/**
 * Emits a D1-compatible SQL file that fully rebuilds the graph schema and data.
 * Designed for `wrangler d1 execute GRAPHDB --file=...`
 *
 * - Drops+recreates tables (idempotent)
 * - No PRAGMA or transactions (wrangler wraps in its own)
 * - INSERTs are batched into multi-row statements to stay under D1's statement limits
 */
export function writeGraphD1Sql(index: SourceIndex, outPath: string): { nodes: number, edges: number } {
  const { nodes, edges } = computeGraph(index)

  const lines: string[] = []
  lines.push('-- Auto-generated by scripts/buildGraph.ts — do not edit by hand.')
  lines.push('-- Fully rebuilds the GRAPHDB schema and data. Safe to run repeatedly.')
  lines.push('')
  lines.push('DROP TABLE IF EXISTS fts;')
  lines.push('DROP TABLE IF EXISTS edges;')
  lines.push('DROP TABLE IF EXISTS nodes;')
  lines.push('')
  lines.push(SCHEMA_SQL)
  lines.push('')

  const BATCH = 200

  for (let i = 0; i < nodes.length; i += BATCH) {
    const chunk = nodes.slice(i, i + BATCH)
    lines.push('INSERT INTO nodes(id, type, name, path, group_, date, published_on, verdict, summary, uri) VALUES')
    lines.push(chunk.map(n =>
      `  (${sqlEscape(n.id)}, ${sqlEscape(n.type)}, ${sqlEscape(n.name)}, ${sqlEscape(n.path)}, ${sqlEscape(n.group_)}, ${sqlEscape(n.date)}, ${sqlEscape(n.published_on)}, ${sqlEscape(n.verdict)}, ${sqlEscape(n.summary)}, ${sqlEscape(n.uri)})`,
    ).join(',\n') + ';')
  }

  lines.push('')

  for (let i = 0; i < edges.length; i += BATCH) {
    const chunk = edges.slice(i, i + BATCH)
    lines.push('INSERT INTO edges(from_id, to_id, relation) VALUES')
    lines.push(chunk.map(e =>
      `  (${sqlEscape(e.from_id)}, ${sqlEscape(e.to_id)}, ${sqlEscape(e.relation)})`,
    ).join(',\n') + ';')
  }

  lines.push('')
  lines.push(`INSERT INTO fts(fts) VALUES('rebuild');`)
  lines.push('')

  if (!existsSync(dirname(outPath))) mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, lines.join('\n'))
  return { nodes: nodes.length, edges: edges.length }
}
