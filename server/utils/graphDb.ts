import type { H3Event } from 'h3'

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

let graphDbPromise: Promise<D1Database> | null = null

async function ensureGraphDb(): Promise<D1Database> {
  if (!graphDbPromise) {
    graphDbPromise = import('./graphDb.node').then(m => m.openLocalGraphDb())
  }
  return graphDbPromise
}

export async function useGraphDb(_event: H3Event): Promise<D1Database> {
  try {
    return await ensureGraphDb()
  } catch (err) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GraphDB not available',
      data: { cause: err instanceof Error ? err.message : String(err) },
    })
  }
}

export function nowIso(): string {
  return new Date().toISOString()
}

export const publishedNodeFilter = `(n.type = 'tag' OR (n.published_on IS NOT NULL AND n.published_on <= ?))`
