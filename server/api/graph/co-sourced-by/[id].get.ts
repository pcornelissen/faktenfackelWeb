import { nowIso, publishedNodeFilter, useGraphDb } from '~~/server/utils/graphDb'

/**
 * Returns all links that have the given source as a co_source.
 * Replaces `coSources LIKE '%"slug"%'` on the quelle index page.
 *
 * Query params:
 *   - limit: optional, 1–200, default 100
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const { limit } = getQuery(event) as { limit?: string }
  const safeLimit = Math.min(Math.max(Number.parseInt(limit ?? '100', 10) || 100, 1), 200)

  const db = useGraphDb(event)

  const sql = `
    SELECT
      n.id, n.type, n.name, n.path, n.group_, n.date, n.verdict, n.summary, n.uri,
      (SELECT json_group_array(e2.to_id)
         FROM edges e2
         WHERE e2.from_id = n.id AND e2.relation = 'has_tag') AS tags_json
    FROM edges e
    JOIN nodes n ON n.id = e.from_id
    WHERE e.to_id = ?
      AND e.relation = 'co_source'
      AND ${publishedNodeFilter}
    ORDER BY n.date DESC
    LIMIT ?
  `

  const { results } = await db.prepare(sql).bind(id, nowIso(), safeLimit).all<{
    id: string
    type: string
    name: string
    path: string | null
    group_: string | null
    date: string | null
    verdict: string | null
    summary: string | null
    uri: string | null
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
