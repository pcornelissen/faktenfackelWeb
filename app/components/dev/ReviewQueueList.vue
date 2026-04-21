<script setup lang="ts">
import type { GitStatus, ReviewQueueItem, TagStatus } from '~/types/dev-review'

const props = defineProps<{
  items: ReviewQueueItem[]
  selectedPath: string | null
}>()

const emit = defineEmits<{ select: [path: string] }>()

const allTagStatuses: TagStatus[] = ['needs-research', 'review-pending', 'clean']
const allGitStatuses: GitStatus[] = ['untracked', 'modified', 'staged', 'clean']

const tagFilter = ref<Set<TagStatus>>(new Set(['needs-research', 'review-pending']))
const gitFilter = ref<Set<GitStatus>>(new Set(['untracked', 'modified', 'staged']))

function toggleTag(value: TagStatus) {
  const next = new Set(tagFilter.value)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  tagFilter.value = next
}

function toggleGit(value: GitStatus) {
  const next = new Set(gitFilter.value)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  gitFilter.value = next
}

const filtered = computed(() =>
  props.items.filter(i =>
    tagFilter.value.has(i.tagStatus) || gitFilter.value.has(i.gitStatus),
  ),
)

const tagBadgeColor: Record<TagStatus, string> = {
  'needs-research': 'bg-[--ember] text-white',
  'review-pending': 'bg-[--flame] text-[--ink]',
  'clean': 'bg-[--muted]/30 text-[--muted]',
}

const gitBadgeColor: Record<GitStatus, string> = {
  untracked: 'bg-emerald-600/80 text-white',
  modified: 'bg-amber-600/80 text-white',
  staged: 'bg-sky-600/80 text-white',
  clean: 'bg-[--muted]/20 text-[--muted]',
}
</script>

<template>
  <aside class="flex h-full flex-col overflow-hidden">
    <div class="space-y-2 border-b border-[--fackel-border]/20 p-3 text-xs">
      <div>
        <div class="mb-1 font-mono uppercase text-[--muted]">
          Tag
        </div>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="s in allTagStatuses"
            :key="s"
            class="rounded px-2 py-0.5 font-mono"
            :class="tagFilter.has(s) ? tagBadgeColor[s] : 'bg-transparent text-[--muted] ring-1 ring-[--fackel-border]/30'"
            @click="toggleTag(s)"
          >
            {{ s }}
          </button>
        </div>
      </div>
      <div>
        <div class="mb-1 font-mono uppercase text-[--muted]">
          Git
        </div>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="s in allGitStatuses"
            :key="s"
            class="rounded px-2 py-0.5 font-mono"
            :class="gitFilter.has(s) ? gitBadgeColor[s] : 'bg-transparent text-[--muted] ring-1 ring-[--fackel-border]/30'"
            @click="toggleGit(s)"
          >
            {{ s }}
          </button>
        </div>
      </div>
    </div>
    <ul class="flex-1 overflow-y-auto">
      <li
        v-for="item in filtered"
        :key="item.path"
        class="cursor-pointer border-l-4 border-transparent px-3 py-2 text-sm hover:bg-white/5"
        :class="item.path === selectedPath ? 'border-[--flame] bg-white/5' : ''"
        @click="emit('select', item.path)"
      >
        <div class="mb-1 flex flex-wrap items-center gap-1 font-mono text-[10px] uppercase">
          <span class="rounded bg-white/10 px-1">{{ item.collection }}</span>
          <span
            class="rounded px-1"
            :class="tagBadgeColor[item.tagStatus]"
          >{{ item.tagStatus }}</span>
          <span
            class="rounded px-1"
            :class="gitBadgeColor[item.gitStatus]"
          >{{ item.gitStatus }}</span>
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
      <li
        v-if="filtered.length === 0"
        class="p-6 text-center text-xs text-[--muted]"
      >
        Keine Dateien im aktuellen Filter.
      </li>
    </ul>
  </aside>
</template>
