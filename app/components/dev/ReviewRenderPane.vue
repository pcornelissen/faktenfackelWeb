<script setup lang="ts">
import type { ReviewQueueItem } from '~/types/dev-review'
import { useReferencesStore } from '~/utils/referenceData'

const props = defineProps<{ item: ReviewQueueItem | null }>()
const emit = defineEmits<{ 'review-done': [] }>()
const referencesStore = useReferencesStore()

const renderError = ref<string | null>(null)
const renderErrorStack = ref<string | null>(null)
const toggling = ref(false)

onErrorCaptured((err) => {
  renderError.value = (err as Error).message ?? String(err)
  renderErrorStack.value = (err as Error).stack ?? null
  return false
})

watch(() => props.item?.path, () => {
  renderError.value = null
  renderErrorStack.value = null
})

const urlPath = computed(() => {
  if (!props.item) return null
  const segments = props.item.path.replace(/\.md$/, '').split('/')
  // Nuxt Content strips leading numeric sort prefixes (e.g. `20260422.slug` → `slug`, `01.foo` → `foo`) from URL segments.
  const cleaned = segments.map(s => s.replace(/^\d+\./, ''))
  // `index.md` maps to its parent path.
  if (cleaned[cleaned.length - 1] === 'index') cleaned.pop()
  return '/' + cleaned.join('/')
})

const profileImage = computed(() => {
  if (!props.item || props.item.collection !== 'quellen') return null
  const [, group, source] = props.item.path.split('/')
  if (!group || !source) return null
  return `/quellen-img/${group}/${source}/profile.webp`
})

const retrying = ref(false)
let retryToken = 0
const scrollRoot = ref<HTMLElement | null>(null)

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

function findTextNode(root: HTMLElement, needle: string): { node: Text, index: number } | null {
  const target = normalize(needle)
  if (!target) return null
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = (node as Text).textContent ?? ''
    const idx = normalize(text).indexOf(target)
    if (idx >= 0) return { node: node as Text, index: idx }
  }
  const words = target.split(' ')
  if (words.length > 3) return findTextNode(root, words.slice(0, Math.floor(words.length / 2)).join(' '))
  return null
}

function jumpTo(text: string) {
  if (!scrollRoot.value) return
  const hit = findTextNode(scrollRoot.value, text)
  if (!hit) return
  const range = document.createRange()
  const end = Math.min(hit.index + text.length, hit.node.length)
  try {
    range.setStart(hit.node, hit.index)
    range.setEnd(hit.node, end)
  } catch {
    return
  }
  const rect = range.getBoundingClientRect()
  const container = scrollRoot.value
  const cRect = container.getBoundingClientRect()
  container.scrollBy({ top: rect.top - cRect.top - 80, behavior: 'smooth' })

  const mark = document.createElement('mark')
  mark.style.background = 'var(--flame)'
  mark.style.color = 'var(--ink)'
  mark.style.padding = '0 2px'
  mark.style.borderRadius = '2px'
  try {
    range.surroundContents(mark)
    setTimeout(() => {
      const parent = mark.parentNode
      if (!parent) return
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
      parent.removeChild(mark)
      parent.normalize()
    }, 1800)
  } catch {
    // range crosses element boundaries
  }
}

defineExpose({ jumpTo })

const { data: page, status, refresh } = await useAsyncData(
  () => `review-render-${props.item?.path ?? 'none'}`,
  async () => {
    if (!props.item || !urlPath.value) return null
    // queryCollection's type is strict per collection, but we need dynamic dispatch here.
    const col = props.item.collection as 'faktenchecks'
    const page = await queryCollection(col).path(urlPath.value).first()
    if (page) await referencesStore.fetchFor(page as Parameters<typeof referencesStore.fetchFor>[0])
    return page
  },
  { watch: [() => props.item?.path] },
)

// Auto-retry for untracked files that the content watcher hasn't indexed yet.
watch([page, () => props.item?.path], async ([p, path]) => {
  if (p || !path || !props.item || props.item.gitStatus !== 'untracked') return
  const token = ++retryToken
  retrying.value = true
  for (const delay of [800, 1500, 2500, 4000]) {
    await new Promise(r => setTimeout(r, delay))
    if (token !== retryToken) return
    await refresh()
    if (page.value) break
  }
  retrying.value = false
}, { immediate: true })

const toast = useToast()

async function markReviewDone() {
  if (!props.item) return
  const path = props.item.path
  toggling.value = true
  try {
    const res = await $fetch<{ removed: boolean }>('/api/dev/toggle-review-tag', {
      method: 'POST',
      body: { path },
    })
    if (res.removed) {
      toast.add({ title: 'Review abgeschlossen', description: path, color: 'primary', icon: 'i-lucide-check-circle' })
    } else {
      toast.add({ title: 'Tag nicht gefunden', description: 'Keine Änderung', color: 'orange' })
    }
    await refresh()
    emit('review-done')
  } catch (err) {
    toast.add({ title: 'Fehler', description: (err as Error).message, color: 'orange' })
  } finally {
    toggling.value = false
  }
}
</script>

<template>
  <section class="flex h-full flex-col overflow-hidden bg-[--paper] text-[--ink]">
    <header class="flex items-center justify-between border-b border-[--fackel-border] px-3 py-2">
      <div class="font-mono text-xs text-[--muted]">
        Rendered
      </div>
      <div class="flex items-center gap-2">
        <span
          v-if="item && item.tagStatus !== 'review-pending'"
          class="font-mono text-[10px] uppercase text-[--muted]"
        >
          Kein review-pending Tag
        </span>
        <UButton
          :disabled="!item || item.tagStatus !== 'review-pending' || toggling"
          :loading="toggling"
          size="sm"
          color="primary"
          icon="i-lucide-check"
          :title="!item ? 'Kein Item gewählt' : (item.tagStatus !== 'review-pending' ? `Button nur aktiv für Items mit research-done-review-pending Tag (aktueller Tag-Status: ${item.tagStatus})` : 'research-done-review-pending Tag entfernen')"
          @click="markReviewDone"
        >
          Review abgeschlossen
        </UButton>
      </div>
    </header>
    <div
      ref="scrollRoot"
      data-render-root
      class="flex-1 overflow-auto p-4"
    >
      <div
        v-if="!item"
        class="p-6 text-center text-[--muted]"
      >
        Wähle eine Datei links aus.
      </div>
      <div
        v-else-if="renderError"
        class="rounded border-2 border-red-500 bg-red-50 p-3 text-sm text-red-900"
      >
        <div class="mb-2 font-mono font-bold">
          Render-Fehler
        </div>
        <div class="mb-2">
          {{ renderError }}
        </div>
        <details
          v-if="renderErrorStack"
          class="text-xs"
        >
          <summary class="cursor-pointer">
            Stack-Trace
          </summary>
          <pre class="mt-2 whitespace-pre-wrap">{{ renderErrorStack }}</pre>
        </details>
      </div>
      <div
        v-else-if="status === 'pending'"
        class="text-[--muted]"
      >
        Rendert …
      </div>
      <div
        v-else-if="!page"
        class="text-sm text-[--muted]"
      >
        Datei ist untracked und noch nicht im Content-Index. Rendern ist erst verfügbar, wenn der Content-Build die Datei erfasst hat (passiert automatisch nach kurzer Zeit im Dev-Modus; ggf. Dev-Server neu starten).
      </div>
      <template v-else>
        <figure
          v-if="profileImage"
          class="mb-4 flex items-start gap-4"
        >
          <img
            :src="profileImage"
            :alt="(page as any)?.name ?? 'Profilbild'"
            class="h-32 w-32 flex-shrink-0 rounded object-cover ring-1 ring-[--fackel-border]"
            @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
          >
          <figcaption
            v-if="(page as any)?.imageAuthor"
            class="text-xs text-[--muted]"
          >
            ©{{ (page as any).imageAuthor }}
          </figcaption>
        </figure>
        <ContentRenderer :value="page" />
      </template>
    </div>
  </section>
</template>
