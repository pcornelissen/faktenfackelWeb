import type { H3Event } from 'h3'

// Minimal D1 interface — matches the subset of bindings we use across the
// /api/graph/* handlers. Avoids depending on @cloudflare/workers-types in
// type-check environments and lets the Node-runtime path expose the same
// shape on top of better-sqlite3.
export interface D1PreparedStatement {
  bind: (...values: unknown[]) => D1PreparedStatement
  all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>
  first: <T = Record<string, unknown>>() => Promise<T | null>
  run: () => Promise<{ success: boolean }>
}
export interface D1Database {
  prepare: (query: string) => D1PreparedStatement
}

export interface GraphNode {
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

export type GraphRelation = 'has_tag' | 'from_source' | 'co_source' | 'references_link' | 'references_quote'
export type GraphNodeType = GraphNode['type']

// Lazy singleton for the Node-runtime graph DB. The dynamic import keeps
// `better-sqlite3` out of the Workers bundle (the binding path is taken
// before the import is ever reached on Cloudflare).
let nodeGraphDbPromise: Promise<D1Database> | null = null

async function ensureNodeGraphDb(): Promise<D1Database> {
  if (!nodeGraphDbPromise) {
    nodeGraphDbPromise = import('./graphDb.node').then(m => m.openLocalGraphDb())
  }
  return nodeGraphDbPromise
}

/**
 * Resolve the GRAPHDB driver for the current request.
 *
 *   - On Cloudflare: returns the GRAPHDB D1 binding from the Worker env.
 *   - On Node (Hetzner): opens a local better-sqlite3 connection backed
 *     by the SQLite file at GRAPH_DB_PATH (defaults to .data/graph.sqlite).
 *
 * Throws a 500 if neither path is available.
 */
export async function useGraphDb(event: H3Event): Promise<D1Database> {
  const env = (event.context.cloudflare?.env ?? {}) as { GRAPHDB?: D1Database }
  if (env.GRAPHDB) return env.GRAPHDB

  try {
    return await ensureNodeGraphDb()
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GRAPHDB binding not available',
      data: { cause: err instanceof Error ? err.message : String(err) },
    })
  }
}

/** Return "now" as ISO string — matches contentUtils.nowIso() used on the client. */
export function nowIso(): string {
  return new Date().toISOString()
}

/**
 * SQL snippet that restricts nodes to published content only.
 * Tags have no publishedOn; they always pass. Non-tag nodes need a
 * published_on <= now to be visible.
 */
export const publishedNodeFilter = `(n.type = 'tag' OR (n.published_on IS NOT NULL AND n.published_on <= ?))`
