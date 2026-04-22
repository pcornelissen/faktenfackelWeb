<script setup lang="ts">
import 'diff2html/bundles/css/diff2html.min.css'
import { html as diff2htmlRender } from 'diff2html'
import type { FileDetail, ReviewQueueItem } from '~/types/dev-review'

const props = defineProps<{ item: ReviewQueueItem | null }>()
const emit = defineEmits<{ jump: [text: string] }>()

function extractPlainText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#>~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function handleDiffClick(ev: MouseEvent) {
  const target = (ev.target as HTMLElement).closest('.d2h-code-line, .d2h-code-side-line') as HTMLElement | null
  if (!target) return
  const ctn = target.querySelector('.d2h-code-line-ctn')
  const raw = (ctn?.textContent ?? target.textContent ?? '').replace(/^[-+\s]+/, '')
  const plain = extractPlainText(raw)
  if (plain.length < 3) return
  const snippet = plain.split(/\s+/).slice(0, 8).join(' ')
  emit('jump', snippet)
}

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

const isNewFile = computed(() => {
  if (!props.item) return false
  if (props.item.gitStatus === 'untracked') return true
  return !!detail.value?.diff?.includes('new file mode')
})

const hasUsefulDiff = computed(() =>
  !!detail.value?.diff && !isNewFile.value,
)

watch([() => props.item?.path, () => detail.value?.diff], () => {
  mode.value = hasUsefulDiff.value ? 'diff' : 'source'
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
        v-if="hasUsefulDiff"
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
          class="diff-wrap"
          @click="handleDiffClick"
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

<style scoped>
.diff-wrap :deep(.d2h-diff-table) {
  width: 100%;
  table-layout: fixed;
}
.diff-wrap :deep(td.d2h-code-linenumber),
.diff-wrap :deep(td.d2h-code-side-linenumber) {
  position: static;
  width: 4.5rem;
  min-width: 4.5rem;
  max-width: 4.5rem;
  box-sizing: border-box;
  direction: ltr;
  padding: 0 0.25rem;
  display: table-cell;
  text-align: right;
}
.diff-wrap :deep(.line-num1),
.diff-wrap :deep(.line-num2) {
  display: inline-block;
  width: 1.75rem;
  text-align: right;
}
.diff-wrap :deep(.d2h-code-line),
.diff-wrap :deep(.d2h-code-side-line) {
  display: block;
  width: auto;
  padding: 0 0.25rem 0 2rem;
  white-space: normal;
  position: relative;
  cursor: pointer;
}
.diff-wrap :deep(.d2h-code-line:hover),
.diff-wrap :deep(.d2h-code-side-line:hover) {
  outline: 1px solid var(--flame);
}
.diff-wrap :deep(.d2h-code-line-prefix) {
  position: absolute;
  left: 0.25rem;
  top: 0;
  width: 1.5rem;
  white-space: pre;
}
.diff-wrap :deep(.d2h-code-line-ctn) {
  display: block;
  width: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
