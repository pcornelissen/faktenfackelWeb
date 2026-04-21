<script setup lang="ts">
import 'diff2html/bundles/css/diff2html.min.css'
import { html as diff2htmlRender } from 'diff2html'
import type { FileDetail, ReviewQueueItem } from '~/types/dev-review'

const props = defineProps<{ item: ReviewQueueItem | null }>()

const { data: detail, status } = await useFetch<FileDetail | null>(
  () => props.item ? '/api/dev/file' : '',
  {
    query: computed(() => ({ path: props.item?.path ?? '' })),
    immediate: false,
    watch: [() => props.item?.path],
    default: () => null,
  },
)

const mode = ref<'diff' | 'source'>('source')

watch(() => props.item, (i) => {
  if (!i) return
  const hasDiff = i.gitStatus === 'modified' || i.gitStatus === 'staged'
  mode.value = hasDiff ? 'diff' : 'source'
}, { immediate: true })

const diffHtml = computed(() => {
  if (!detail.value?.diff) return ''
  return diff2htmlRender(detail.value.diff, {
    drawFileList: false,
    matching: 'lines',
    outputFormat: 'line-by-line',
  })
})

const frontmatterJson = computed(() => {
  if (!detail.value) return ''
  return JSON.stringify(detail.value.frontmatter, null, 2)
})
</script>

<template>
  <section class="flex h-full flex-col overflow-hidden bg-[--smoke]">
    <header class="flex items-center justify-between border-b border-[--fackel-border]/20 px-3 py-2 text-xs">
      <div class="truncate font-mono text-[--muted]">
        {{ item?.path ?? '—' }}
      </div>
      <div
        v-if="detail?.diff"
        class="flex gap-1"
      >
        <button
          class="rounded px-2 py-0.5 font-mono"
          :class="mode === 'diff' ? 'bg-[--flame] text-[--ink]' : 'text-[--muted] ring-1 ring-[--fackel-border]/30'"
          @click="mode = 'diff'"
        >
          Diff
        </button>
        <button
          class="rounded px-2 py-0.5 font-mono"
          :class="mode === 'source' ? 'bg-[--flame] text-[--ink]' : 'text-[--muted] ring-1 ring-[--fackel-border]/30'"
          @click="mode = 'source'"
        >
          Source
        </button>
      </div>
    </header>
    <div class="flex-1 overflow-auto p-3 text-xs">
      <div
        v-if="!item"
        class="p-6 text-center text-[--muted]"
      >
        Wähle eine Datei links aus.
      </div>
      <div
        v-else-if="status === 'pending'"
        class="text-[--muted]"
      >
        Lädt …
      </div>
      <template v-else-if="detail">
        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="mode === 'diff' && detail.diff"
          v-html="diffHtml"
        />
        <!-- eslint-enable vue/no-v-html -->
        <template v-else>
          <details class="mb-3 rounded border border-[--fackel-border]/20 bg-black/30 p-2">
            <summary class="cursor-pointer font-mono text-[--muted]">
              Frontmatter
            </summary>
            <pre class="mt-2 whitespace-pre-wrap text-[11px]">{{ frontmatterJson }}</pre>
          </details>
          <pre class="whitespace-pre-wrap font-mono">{{ detail.body }}</pre>
        </template>
      </template>
    </div>
  </section>
</template>
