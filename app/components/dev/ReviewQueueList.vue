<script setup lang="ts">
import type { CollectionName, ReviewQueueItem } from '~/types/dev-review'

const props = defineProps<{
  items: ReviewQueueItem[]
  selectedPath: string | null
}>()

const emit = defineEmits<{ select: [path: string] }>()

const collectionOrder: CollectionName[] = ['faktenchecks', 'lagerfeuer', 'themen', 'glossar', 'zitate', 'quellen', 'quellenlinks']

const showReviewTag = ref(true)
const showGitWip = ref(true)

const filtered = computed(() =>
  props.items.filter((i) => {
    const hasReviewTag = i.tagStatus === 'review-pending'
    const isGitWip = i.gitStatus !== 'clean'
    return (showReviewTag.value && hasReviewTag) || (showGitWip.value && isGitWip)
  }),
)

const grouped = computed(() => {
  const groups = new Map<CollectionName, ReviewQueueItem[]>()
  for (const item of filtered.value) {
    const list = groups.get(item.collection) ?? []
    list.push(item)
    groups.set(item.collection, list)
  }
  return collectionOrder
    .filter(c => groups.has(c))
    .map(c => ({ collection: c, items: groups.get(c)! }))
})

function signalClasses(item: ReviewQueueItem): string {
  if (item.tagStatus === 'review-pending') return 'bg-[--flame] text-[--ink]'
  if (item.gitStatus !== 'clean') return 'bg-amber-600/80 text-white'
  return 'bg-[--muted]/30 text-[--muted]'
}

function signalLabel(item: ReviewQueueItem): string {
  const parts: string[] = []
  if (item.tagStatus === 'review-pending') parts.push('review')
  if (item.gitStatus !== 'clean') parts.push(item.gitStatus)
  return parts.join(' + ') || 'clean'
}

const collectionsWithPublishedOn: CollectionName[] = ['faktenchecks', 'lagerfeuer', 'themen', 'glossar', 'zitate']

function expectsPublishedOn(item: ReviewQueueItem): boolean {
  return collectionsWithPublishedOn.includes(item.collection)
}

function formatPublishedOn(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const now = new Date()
  const future = d.getTime() > now.getTime()
  const formatted = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  return future ? `${formatted} (geplant)` : formatted
}
</script>

<template>
  <aside class="flex h-full flex-col overflow-hidden">
    <div class="border-b border-[--fackel-border]/20 p-3 text-xs">
      <div class="mb-1 font-mono uppercase text-[--muted]">
        Zeige
      </div>
      <div class="flex flex-wrap gap-1">
        <button
          class="rounded px-2 py-0.5 font-mono"
          :class="showReviewTag ? 'bg-[--flame] text-[--ink]' : 'bg-transparent text-[--muted] ring-1 ring-[--fackel-border]/30'"
          @click="showReviewTag = !showReviewTag"
        >
          Review-Tag
        </button>
        <button
          class="rounded px-2 py-0.5 font-mono"
          :class="showGitWip ? 'bg-amber-600/80 text-white' : 'bg-transparent text-[--muted] ring-1 ring-[--fackel-border]/30'"
          @click="showGitWip = !showGitWip"
        >
          Git WIP
        </button>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="group in grouped"
        :key="group.collection"
      >
        <div class="sticky top-0 z-10 flex items-center justify-between border-b border-[--fackel-border]/20 bg-[--ash] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-[--paper]">
          <span>{{ group.collection }}</span>
          <span class="text-[--muted]">{{ group.items.length }}</span>
        </div>
        <ul>
          <li
            v-for="item in group.items"
            :key="item.path"
            class="cursor-pointer border-l-4 border-transparent px-3 py-2 text-sm hover:bg-white/5"
            :class="item.path === selectedPath ? 'border-[--flame] bg-white/5' : ''"
            @click="emit('select', item.path)"
          >
            <div class="mb-1 flex flex-wrap items-center gap-1 font-mono text-[10px] uppercase">
              <span
                class="rounded px-1"
                :class="signalClasses(item)"
              >{{ signalLabel(item) }}</span>
              <span
                v-if="item.publishedOn"
                class="rounded bg-emerald-700/40 px-1 text-emerald-100"
              >📅 {{ formatPublishedOn(item.publishedOn) }}</span>
              <span
                v-else-if="expectsPublishedOn(item)"
                class="rounded bg-red-700 px-1 font-bold text-white"
                title="publishedOn fehlt im Frontmatter — Beitrag wird nicht veröffentlicht"
              >⚠ KEIN PUBLISHED-ON</span>
            </div>
            <div class="line-clamp-2 font-serif">
              {{ item.title }}
            </div>
            <div
              v-if="item.code"
              class="font-mono text-[10px] text-[--muted]"
            >
              {{ item.code }}
            </div>
          </li>
        </ul>
      </div>
      <div
        v-if="filtered.length === 0"
        class="p-6 text-center text-xs text-[--muted]"
      >
        Keine Dateien im aktuellen Filter.
      </div>
    </div>
  </aside>
</template>
