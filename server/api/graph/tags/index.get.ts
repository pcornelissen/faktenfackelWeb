import { nowIso, useGraphDb } from '~~/server/utils/graphDb'

const META_TAGS = new Set(['more-research-needed', 'research-done-review-pending'])

/**
 * Returns tag frequencies across all published content.
 * Replaces the 6-collection scan on /tags.
 */
export default defineEventHandler(async (event) => {
  const db = useGraphDb(event)

  // Count has_tag edges where the source node is published.
  const sql = `
    SELECT e.to_id AS tag, count(*) AS count
    FROM edges e
    JOIN nodes n ON n.id = e.from_id
    WHERE e.relation = 'has_tag'
      AND (n.type = 'tag' OR (n.published_on IS NOT NULL AND n.published_on <= ?))
    GROUP BY e.to_id
    ORDER BY count DESC
  `
  const { results } = await db.prepare(sql).bind(nowIso()).all<{ tag: string, count: number }>()
  const filtered = results.filter(r => !META_TAGS.has(r.tag.toLowerCase()))
  return { count: filtered.length, results: filtered }
})
