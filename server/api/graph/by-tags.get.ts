import { nowIso, publishedNodeFilter, useGraphDb } from '~~/server/utils/graphDb'

/**
 * Returns paginated nodes that carry ALL given tags (AND-logic), filtered by
 * node type and optionally by group_ (for articles: faktenchecks/lagerfeuer/glossar;
 * for links: article/youtube/pdf/...).
 *
 * Query params:
 *   tags=A,B,C   (comma-separated, at least one, exact casing)
 *   type=link|quote|article|source
 *   group=faktenchecks|lagerfeuer|glossar|...   (optional)
 *   sort=date_desc|date_asc   (default date_desc)
 *   limit=1..100                (default 20)
 *   page=1..                    (default 1)
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)

  const tagsParam = typeof q.tags === 'string' ? q.tags : ''
  const tags = tagsParam.split(',').map(t => t.trim()).filter(Boolean)
  if (tags.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Missing tags (comma-separated)' })
  }

  const type = typeof q.type === 'string' ? q.type : ''
  const allowedTypes = new Set(['link', 'quote', 'article', 'source'])
  if (!allowedTypes.has(type)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or missing type (link|quote|article|source)' })
  }

  const group = typeof q.group === 'string' && q.group ? q.group : null

  const sort = typeof q.sort === 'string' ? q.sort : 'date_desc'
  const orderBy = sort === 'date_asc' ? 'n.date ASC' : 'n.date DESC'

  const rawLimit = Number(q.limit ?? 20)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 100) : 20

  const rawPage = Number(q.page ?? 1)
  const page = Number.isFinite(rawPage) ? Math.max(Math.trunc(rawPage), 1) : 1
  const offset = (page - 1) * limit

  const db = useGraphDb(event)

  const tagPlaceholders = tags.map(() => '?').join(', ')
  const groupClause = group ? 'AND n.group_ = ?' : ''

  const baseWhere = `
    n.type = ?
    ${groupClause}
    AND ${publishedNodeFilter}
    AND n.id IN (
      SELECT from_id
      FROM edges
      WHERE relation = 'has_tag' AND to_id IN (${tagPlaceholders})
      GROUP BY from_id
      HAVING COUNT(DISTINCT to_id) = ?
    )
  `

  const baseBindings: unknown[] = [type]
  if (group) baseBindings.push(group)
  baseBindings.push(nowIso())
  baseBindings.push(...tags)
  baseBindings.push(tags.length)

  const countSql = `SELECT COUNT(*) AS total FROM nodes n WHERE ${baseWhere}`
  const countRow = await db.prepare(countSql).bind(...baseBindings).first<{ total: number }>()
  const total = countRow?.total ?? 0

  const listSql = `
    SELECT
      n.id, n.type, n.name, n.path, n.group_, n.date, n.verdict, n.summary, n.uri,
      (SELECT json_group_array(e2.to_id)
         FROM edges e2
         WHERE e2.from_id = n.id AND e2.relation = 'has_tag') AS tags_json,
      parent.id   AS parent_id,
      parent.name AS parent_name,
      parent.path AS parent_path
    FROM nodes n
    LEFT JOIN edges pe ON pe.from_id = n.id AND pe.relation = 'from_source'
    LEFT JOIN nodes parent ON parent.id = pe.to_id
    WHERE ${baseWhere}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `

  const { results } = await db.prepare(listSql).bind(...baseBindings, limit, offset).all<{
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

  const hydrated = results.map((r) => {
    let tagsOut: string[] = []
    try {
      tagsOut = r.tags_json ? (JSON.parse(r.tags_json) as string[]) : []
    } catch {
      tagsOut = []
    }
    const { tags_json: _omit, ...rest } = r
    return { ...rest, tags: tagsOut }
  })

  return {
    tags,
    type,
    group,
    sort: sort === 'date_asc' ? 'date_asc' : 'date_desc',
    page,
    limit,
    total,
    items: hydrated,
  }
})
