import { nowIso, publishedNodeFilter, useGraphDb } from '~~/server/utils/graphDb'

/**
 * Returns all nodes tagged with the given tag (filtered by published_on),
 * including each node's full tag list and parent-source info for links/quotes.
 *
 * Used to back /tags/[tag].vue.
 */
export default defineEventHandler(async (event) => {
  const tag = getRouterParam(event, 'tag')
  if (!tag) throw createError({ statusCode: 400, statusMessage: 'Missing tag' })

  const db = useGraphDb(event)

  const sql = `
    SELECT
      n.id, n.type, n.name, n.path, n.group_, n.date, n.verdict, n.summary, n.uri,
      (SELECT json_group_array(e2.to_id)
         FROM edges e2
         WHERE e2.from_id = n.id AND e2.relation = 'has_tag') AS tags_json,
      parent.id   AS parent_id,
      parent.name AS parent_name,
      parent.path AS parent_path
    FROM edges e
    JOIN nodes n ON n.id = e.from_id
    LEFT JOIN edges pe ON pe.from_id = n.id AND pe.relation = 'from_source'
    LEFT JOIN nodes parent ON parent.id = pe.to_id
    WHERE e.to_id = ?
      AND e.relation = 'has_tag'
      AND ${publishedNodeFilter}
    ORDER BY n.date DESC
  `

  const { results } = await db.prepare(sql).bind(tag, nowIso()).all<{
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
    parent_id: string | null
    parent_name: string | null
    parent_path: string | null
  }>()

  // Parse tags_json into a proper array.
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

  return { tag, count: hydrated.length, results: hydrated }
})
