import type { H3Event } from 'h3'

// Minimal D1 interface — matches the subset we use. Avoids the
// @cloudflare/workers-types dependency for type-check environments.
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

/**
 * Access the GRAPHDB D1 binding. Throws if the binding is not available
 * (e.g. when running in environments without Cloudflare bindings).
 */
export function useGraphDb(event: H3Event): D1Database {
  const env = (event.context.cloudflare?.env ?? {}) as { GRAPHDB?: D1Database }
  const db = env.GRAPHDB
  if (!db) throw createError({ statusCode: 500, statusMessage: 'GRAPHDB binding not available' })
  return db
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
