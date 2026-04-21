<script setup lang="ts">
import type { ReviewQueueItem } from '~/types/dev-review'

const props = defineProps<{ item: ReviewQueueItem | null }>()
const emit = defineEmits<{ 'review-done': [] }>()

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
  return '/' + props.item.path.replace(/\.md$/, '')
})

const { data: page, status, refresh } = await useAsyncData(
  () => `review-render-${props.item?.path ?? 'none'}`,
  async () => {
    if (!props.item || !urlPath.value) return null
    // queryCollection's type is strict per collection, but we need dynamic dispatch here.
    const col = props.item.collection as 'faktenchecks'
    return await queryCollection(col).path(urlPath.value).first()
  },
  { watch: [() => props.item?.path] },
)

async function markReviewDone() {
  if (!props.item) return
  toggling.value = true
  try {
    await $fetch('/api/dev/toggle-review-tag', {
      method: 'POST',
      body: { path: props.item.path },
    })
    await refresh()
    emit('review-done')
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
      <UButton
        :disabled="!item || item.tagStatus !== 'review-pending' || toggling"
        :loading="toggling"
        size="sm"
        color="primary"
        icon="i-lucide-check"
        @click="markReviewDone"
      >
        Review abgeschlossen
      </UButton>
    </header>
    <div class="flex-1 overflow-auto p-4">
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
      <ContentRenderer
        v-else
        :value="page"
      />
    </div>
  </section>
</template>
