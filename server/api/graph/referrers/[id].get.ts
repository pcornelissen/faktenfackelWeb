import { useGraphDb } from '~~/server/utils/graphDb'

/**
 * Returns all nodes that reference the given node via references_link / references_quote.
 * Used to find articles/links/quotes that cite a particular source or content piece.
 *
 * Query params:
 *   - type: optional filter by node type (source | link | quote | article)
 *   - limit: optional, 1–200, default 50
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const { type, limit } = getQuery(event) as { type?: string, limit?: string }
  const safeLimit = Math.min(Math.max(Number.parseInt(limit ?? '50', 10) || 50, 1), 200)
  const validTypes = new Set(['source', 'link', 'quote', 'article'])
  const typeFilter = type && validTypes.has(type) ? type : null

  const db = useGraphDb(event)

  const sql = `
    SELECT n.id, n.type, n.name, n.group_, n.date, n.verdict, n.summary, n.uri, e.relation
    FROM edges e
    JOIN nodes n ON n.id = e.from_id
    WHERE e.to_id = ? AND e.relation IN ('references_link', 'references_quote')
    ${typeFilter ? 'AND n.type = ?' : ''}
    LIMIT ?
  `

  const stmt = typeFilter
    ? db.prepare(sql).bind(id, typeFilter, safeLimit)
    : db.prepare(sql).bind(id, safeLimit)

  const { results } = await stmt.all()
  return { id, count: results.length, results }
})
