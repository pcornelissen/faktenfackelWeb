import type { GraphNode } from '~/utils/graphData'

export interface TagFilteredResponse {
  tags: string[]
  type: string
  group: string | null
  sort: 'date_desc' | 'date_asc'
  page: number
  limit: number
  total: number
  items: GraphNode[]
}

export interface TagFilteredOptions {
  type: 'link' | 'quote' | 'article' | 'source'
  group?: string | null
  tags: string[] | (() => string[])
  sort?: 'date_desc' | 'date_asc'
  limit?: number
  instanceKey?: string
}

/**
 * Fetch helper for the /api/graph/by-tags endpoint. Reads the current page from
 * the URL query param `<queryKey>_p` so each component instance has its own
 * pagination without collisions. `queryKey` defaults to a hash of the tag set.
 */
export function useTagFilteredNodes(opts: TagFilteredOptions) {
  const route = useRoute()

  const tagsRef = computed(() =>
    typeof opts.tags === 'function' ? opts.tags() : opts.tags,
  )

  const queryKey = computed(() => {
    if (opts.instanceKey) return opts.instanceKey
    const joined = [opts.type, opts.group ?? '', ...tagsRef.value].join('|')
    let hash = 0
    for (let i = 0; i < joined.length; i++) hash = (hash * 31 + joined.charCodeAt(i)) | 0
    return `tf${Math.abs(hash).toString(36)}`
  })

  const pageParam = computed(() => `${queryKey.value}_p`)

  const page = computed(() => {
    const raw = route.query[pageParam.value]
    const n = Number(Array.isArray(raw) ? raw[0] : raw)
    return Number.isFinite(n) && n >= 1 ? Math.trunc(n) : 1
  })

  const limit = opts.limit ?? 20
  const sort = opts.sort ?? 'date_desc'

  const params = computed(() => {
    const p: Record<string, string> = {
      type: opts.type,
      tags: tagsRef.value.join(','),
      sort,
      limit: String(limit),
      page: String(page.value),
    }
    if (opts.group) p.group = opts.group
    return p
  })

  const { data, pending, error, refresh } = useLazyFetch<TagFilteredResponse>(
    '/api/graph/by-tags',
    {
      key: () => `by-tags-${queryKey.value}-${page.value}`,
      query: params,
      default: () => ({
        tags: tagsRef.value,
        type: opts.type,
        group: opts.group ?? null,
        sort,
        page: page.value,
        limit,
        total: 0,
        items: [],
      }),
    },
  )

  const items = computed(() => data.value?.items ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))
  const isEmpty = computed(() => !pending.value && total.value === 0)

  return {
    items,
    total,
    page,
    totalPages,
    limit,
    pageParam,
    pending,
    error,
    isEmpty,
    refresh,
  }
}
