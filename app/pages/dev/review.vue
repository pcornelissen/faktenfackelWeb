<script setup lang="ts">
import type { ReviewQueueItem } from '~/types/dev-review'

definePageMeta({
  layout: false,
})

const selectedPath = ref<string | null>(null)

const { data: queue, refresh: refreshQueue, status: queueStatus } = await useFetch<ReviewQueueItem[]>(
  '/api/dev/review-queue',
  { default: () => [] },
)

const selectedItem = computed(() =>
  queue.value?.find(i => i.path === selectedPath.value) ?? null,
)

async function handleReviewDone() {
  await refreshQueue()
}
</script>

<template>
  <div class="flex h-screen flex-col bg-[--ash] text-[--paper]">
    <header class="flex items-center justify-between border-b border-[--fackel-border]/20 px-4 py-2">
      <h1 class="font-mono text-sm uppercase tracking-wide">
        Artikel-Review
      </h1>
      <div class="flex items-center gap-3 text-xs text-[--muted]">
        <span v-if="queueStatus === 'pending'">Lädt …</span>
        <span v-else>{{ queue?.length ?? 0 }} Dateien</span>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          @click="refreshQueue()"
        >
          Neu laden
        </UButton>
      </div>
    </header>

    <div class="grid flex-1 grid-cols-[320px_1fr_1fr] overflow-hidden">
      <ReviewQueueList
        :items="queue ?? []"
        :selected-path="selectedPath"
        class="border-r border-[--fackel-border]/20"
        @select="selectedPath = $event"
      />
      <ReviewSourcePane
        :item="selectedItem"
        class="border-r border-[--fackel-border]/20"
      />
      <ReviewRenderPane
        :item="selectedItem"
        @review-done="handleReviewDone"
      />
    </div>
  </div>
</template>
