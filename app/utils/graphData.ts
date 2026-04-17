/**
 * Client-side helpers for working with GRAPHDB API responses.
 * Maps raw node rows into Post / link / source shapes used by our UI components.
 */

export interface GraphNode {
  id: string
  type: 'source' | 'link' | 'quote' | 'article' | 'tag'
  name: string | null
  path: string | null
  group_: string | null
  date: string | null
  verdict: string | null
  summary: string | null
  uri: string | null
  tags?: string[]
  relation?: string
  parent_id?: string | null
  parent_name?: string | null
  parent_path?: string | null
}

/**
 * Turn a graph node's stored `path` into the public site URL.
 *   source   → /quellen/{path}
 *   link     → /quellen/{path}
 *   quote    → /quellen/{path}
 *   article  → /{path}          (already collection-prefixed)
 */
export function nodeToHref(node: Pick<GraphNode, 'type' | 'path'>): string {
  if (!node.path) return '#'
  if (node.type === 'article') return '/' + node.path.replace(/^\/+/, '')
  return '/quellen/' + node.path.replace(/^\/+/, '')
}

/**
 * Map a graph node into a Post-compatible shape for `<PostsList>`.
 */
export function nodeToPost(node: GraphNode) {
  return {
    title: node.name ?? '',
    subtitle: node.summary ?? undefined,
    path: nodeToHref(node),
    date: node.date ?? '',
    tags: node.tags ?? [],
    verdict: (node.verdict ?? undefined) as 'false' | 'misleading' | 'complex' | 'true' | undefined,
  }
}

/**
 * Map a link-type graph node into a SourceLink-compatible shape for `<SourceLinksList>`.
 * Only valid for nodes of type "link".
 */
export function nodeToSourceLink(node: GraphNode) {
  return {
    title: node.name ?? '',
    path: nodeToHref(node),
    uri: node.uri ?? '',
    // For link nodes, group_ holds the content type (article/youtube/pdf/…)
    type: node.group_ ?? '',
    tags: node.tags ?? [],
    date: node.date ?? '',
    sourceDate: node.date ?? '',
    publishedOn: null as string | null,
    code: node.id,
    coSources: [] as string[],
  }
}
