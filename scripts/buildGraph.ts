import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

export interface SourceEntry {
  slug: string
  group: string
  name: string
  description?: string
  tags: string[]
  date: string
  hasImage: boolean
}
export interface LinkEntry {
  code: string
  source: string
  title: string
  uri?: string
  type: string
  tags: string[]
  date: string
  coSources?: string[]
  verdict?: string
  summary?: string
}
export interface QuoteEntry {
  code: string
  source: string
  title: string
  teaser: string
  tags: string[]
  date: string
}
export interface SourceIndex {
  sources: SourceEntry[]
  links: LinkEntry[]
  quotes: QuoteEntry[]
}

export function buildGraph(index: SourceIndex, dbPath: string): void {
  if (!existsSync(dirname(dbPath))) mkdirSync(dirname(dbPath), { recursive: true })

  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    DROP TABLE IF EXISTS fts;
    DROP TABLE IF EXISTS edges;
    DROP TABLE IF EXISTS nodes;

    CREATE TABLE nodes (
      id      TEXT PRIMARY KEY,
      type    TEXT NOT NULL,
      name    TEXT,
      group_  TEXT,
      date    TEXT,
      verdict TEXT,
      summary TEXT,
      uri     TEXT
    );

    CREATE TABLE edges (
      from_id  TEXT NOT NULL,
      to_id    TEXT NOT NULL,
      relation TEXT NOT NULL
    );
    CREATE INDEX idx_edges_from ON edges(from_id);
    CREATE INDEX idx_edges_to   ON edges(to_id);

    CREATE VIRTUAL TABLE fts USING fts5(
      id UNINDEXED,
      name,
      summary,
      content=nodes,
      content_rowid=rowid
    );
  `)

  const insertNode = db.prepare(
    `INSERT OR IGNORE INTO nodes(id, type, name, group_, date, verdict, summary, uri)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
  const insertEdge = db.prepare(
    `INSERT INTO edges(from_id, to_id, relation) VALUES (?, ?, ?)`,
  )
  const hasNode = db.prepare('SELECT 1 FROM nodes WHERE id = ?')

  const ensureTag = (tag: string) =>
    insertNode.run(tag, 'tag', tag, null, null, null, null, null)

  const run = db.transaction(() => {
    for (const s of index.sources) {
      insertNode.run(s.slug, 'source', s.name, s.group, s.date, null, s.description ?? null, null)
      for (const tag of s.tags) {
        ensureTag(tag)
        insertEdge.run(s.slug, tag, 'has_tag')
      }
    }

    for (const l of index.links) {
      insertNode.run(l.code, 'link', l.title, null, l.date, l.verdict ?? null, l.summary ?? null, l.uri ?? null)
      const parentSlug = l.source.split('/').pop()!
      if (hasNode.get(parentSlug)) insertEdge.run(l.code, parentSlug, 'from_source')
      for (const cs of l.coSources ?? []) {
        const csSlug = cs.includes('/') ? cs.split('/').pop()! : cs
        insertEdge.run(l.code, csSlug, 'co_source')
      }
      for (const tag of l.tags) {
        ensureTag(tag)
        insertEdge.run(l.code, tag, 'has_tag')
      }
    }

    for (const q of index.quotes) {
      insertNode.run(q.code, 'quote', q.title, null, q.date, null, q.teaser, null)
      const parentSlug = q.source.split('/').pop()!
      if (hasNode.get(parentSlug)) insertEdge.run(q.code, parentSlug, 'from_source')
      for (const tag of q.tags) {
        ensureTag(tag)
        insertEdge.run(q.code, tag, 'has_tag')
      }
    }

    db.exec(`INSERT INTO fts(fts) VALUES('rebuild')`)
  })

  run()
  db.close()
}
