import { nowIso, publishedNodeFilter, useGraphDb } from '~~/server/utils/graphDb'

/**
 * Returns all nodes that reference the given node via references_link / references_quote.
 * Used to find articles/links/quotes that cite a particular source or content piece.
 *
 * Query params:
 *   - type: optional filter by node type (source | link | quote | article)
 *   - limit: optional, 1–500, default 200
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const { type, limit } = getQuery(event) as { type?: string, limit?: string }
  const safeLimit = Math.min(Math.max(Number.parseInt(limit ?? '200', 10) || 200, 1), 500)
  const validTypes = new Set(['source', 'link', 'quote', 'article'])
  const typeFilter = type && validTypes.has(type) ? type : null

  const db = await useGraphDb(event)

  const sql = `
    SELECT
      n.id, n.type, n.name, n.path, n.group_, n.date, n.verdict, n.summary, n.uri, e.relation,
      (SELECT json_group_array(e2.to_id)
         FROM edges e2
         WHERE e2.from_id = n.id AND e2.relation = 'has_tag') AS tags_json
    FROM edges e
    JOIN nodes n ON n.id = e.from_id
    WHERE e.to_id = ?
      AND e.relation IN ('references_link', 'references_quote')
      AND ${publishedNodeFilter}
      ${typeFilter ? 'AND n.type = ?' : ''}
    ORDER BY n.date DESC
    LIMIT ?
  `

  const bindings: unknown[] = [id, nowIso()]
  if (typeFilter) bindings.push(typeFilter)
  bindings.push(safeLimit)

  const { results } = await db.prepare(sql).bind(...bindings).all<{
    id: string
    type: string
    name: string
    path: string | null
    group_: string | null
    date: string | null
    verdict: string | null
    summary: string | null
    uri: string | null
    relation: string
    tags_json: string
  }>()

  const hydrated = results.map((r) => {
    let tags: string[] = []
    try {
      tags = r.tags_json ? (JSON.parse(r.tags_json) as string[]) : []
    } catch {
      tags = []
    }
    const { tags_json: _omit, ...rest } = r
    return { ...rest, tags }
  })

  return { id, count: hydrated.length, results: hydrated }
})
