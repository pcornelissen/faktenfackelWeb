<script setup lang="ts">
import type { ReviewQueueItem } from '~/types/dev-review'

definePageMeta({
  layout: false,
})

const toast = useToast()

const selectedPath = ref<string | null>(null)

const { data: queue, refresh: refreshQueue, status: queueStatus } = await useFetch<ReviewQueueItem[]>(
  '/api/dev/review-queue',
  { default: () => [] },
)

const selectedItem = computed(() =>
  queue.value?.find(i => i.path === selectedPath.value) ?? null,
)

const projectRelPath = computed(() =>
  selectedItem.value ? `website/content/${selectedItem.value.path}` : null,
)

const renderPane = ref<{ jumpTo: (text: string) => void } | null>(null)

async function handleReviewDone() {
  const current = selectedPath.value
  await refreshQueue()
  const next = queue.value?.find(i => i.tagStatus === 'review-pending' && i.path !== current)
  selectedPath.value = next?.path ?? null
}

function handleJump(text: string) {
  renderPane.value?.jumpTo(text)
}

async function copy(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.add({ title: label, description: value.length > 80 ? value.slice(0, 80) + '…' : value, color: 'primary', icon: 'i-lucide-clipboard-check' })
  } catch {
    toast.add({ title: 'Kopieren fehlgeschlagen', color: 'orange' })
  }
}

function copyPath() {
  if (!projectRelPath.value) return
  copy(projectRelPath.value, 'Pfad kopiert')
}

// Comment modal
const commentOpen = ref(false)
const commentText = ref('')
const capturedSelection = ref('')
const capturedPane = ref<'diff' | 'render' | null>(null)

function getSelectionInfo(): { text: string, pane: 'diff' | 'render' | null } {
  const sel = window.getSelection()
  const text = sel?.toString().trim() ?? ''
  if (!text || !sel || sel.rangeCount === 0) return { text: '', pane: null }
  const node = sel.getRangeAt(0).commonAncestorContainer
  const el = (node.nodeType === 1 ? node : node.parentElement) as HTMLElement | null
  if (!el) return { text, pane: null }
  if (el.closest('.diff-wrap, pre')) return { text, pane: 'diff' }
  if (el.closest('[data-render-root]')) return { text, pane: 'render' }
  return { text, pane: null }
}

function openCommentDialog() {
  const { text, pane } = getSelectionInfo()
  capturedSelection.value = text
  capturedPane.value = pane
  commentText.value = ''
  commentOpen.value = true
}

function buildPrompt() {
  const path = projectRelPath.value ?? '(keine Datei ausgewählt)'
  const parts = [
    `Datei: ${path}`,
    '',
  ]
  if (capturedSelection.value) {
    const source = capturedPane.value === 'render'
      ? 'gerenderte Ansicht'
      : capturedPane.value === 'diff'
        ? 'Diff/Source-Ansicht'
        : 'Review-Tool'
    parts.push(`Markierte Stelle (${source}):`)
    parts.push('```')
    parts.push(capturedSelection.value)
    parts.push('```')
    parts.push('')
  }
  parts.push('Kommentar:')
  parts.push(commentText.value.trim() || '(kein Kommentar)')
  parts.push('')
  parts.push('Bitte die oben beschriebene Änderung in der Datei umsetzen.')
  return parts.join('\n')
}

async function submitComment() {
  const prompt = buildPrompt()
  await copy(prompt, 'Prompt kopiert — in Claude Code einfügen')
  commentOpen.value = false
}

// Context menu
const ctxOpen = ref(false)
const ctxX = ref(0)
const ctxY = ref(0)

function onContextMenu(ev: MouseEvent) {
  const info = getSelectionInfo()
  if (!info.text || !info.pane) return
  ev.preventDefault()
  capturedSelection.value = info.text
  capturedPane.value = info.pane
  ctxX.value = ev.clientX
  ctxY.value = ev.clientY
  ctxOpen.value = true
}

function ctxCopySelection() {
  copy(capturedSelection.value, 'Markierung kopiert')
  ctxOpen.value = false
}

function ctxOpenComment() {
  ctxOpen.value = false
  commentText.value = ''
  commentOpen.value = true
}

function closeCtx() {
  ctxOpen.value = false
}

onMounted(() => {
  window.addEventListener('click', closeCtx)
  window.addEventListener('scroll', closeCtx, true)
})
onUnmounted(() => {
  window.removeEventListener('click', closeCtx)
  window.removeEventListener('scroll', closeCtx, true)
})
</script>

<template>
  <div
    class="full-bleed flex h-screen flex-col bg-[--ash] text-[--paper]"
    @contextmenu="onContextMenu"
  >
    <header class="flex items-center justify-between border-b border-[--fackel-border]/20 px-4 py-2">
      <h1 class="font-mono text-sm uppercase tracking-wide">
        Artikel-Review
      </h1>
      <div class="flex items-center gap-3 text-xs text-[--muted]">
        <span v-if="queueStatus === 'pending'">Lädt …</span>
        <span v-else>{{ queue?.length ?? 0 }} Dateien</span>
        <UButton
          :disabled="!projectRelPath"
          size="xs"
          variant="ghost"
          icon="i-lucide-copy"
          title="Datei-Pfad kopieren (relativ zum Projekt)"
          @click="copyPath"
        >
          Pfad
        </UButton>
        <UButton
          :disabled="!selectedItem"
          size="xs"
          variant="ghost"
          icon="i-lucide-message-square-plus"
          title="Markierte Stelle + Kommentar als Claude-Prompt in die Zwischenablage"
          @click="openCommentDialog"
        >
          Kommentar
        </UButton>
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
        @jump="handleJump"
      />
      <ReviewRenderPane
        ref="renderPane"
        :item="selectedItem"
        @review-done="handleReviewDone"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="ctxOpen"
        class="fixed z-50 min-w-[220px] rounded border border-[--fackel-border] py-1 text-sm shadow-lg"
        style="background: var(--smoke); color: var(--paper);"
        :style="{ left: ctxX + 'px', top: ctxY + 'px' }"
        @click.stop
        @contextmenu.prevent
      >
        <button
          class="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5"
          @click="ctxOpenComment"
        >
          <UIcon name="i-lucide-message-square-plus" />
          Kommentar zu Markierung
        </button>
        <button
          class="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5"
          @click="ctxCopySelection"
        >
          <UIcon name="i-lucide-copy" />
          Markierung kopieren
        </button>
      </div>
    </Teleport>

    <UModal v-model:open="commentOpen">
      <template #content>
        <div class="space-y-3 p-5">
          <div class="font-mono text-xs text-[--muted]">
            Datei: {{ projectRelPath ?? '—' }}
          </div>
          <div
            v-if="capturedSelection"
            class="max-h-40 overflow-auto rounded border border-[--fackel-border] bg-[--paper]/60 p-2 font-mono text-xs"
          >
            <div class="mb-1 text-[--muted]">
              Markiert aus {{ capturedPane === 'render' ? 'Rendering' : capturedPane === 'diff' ? 'Diff/Source' : 'Auswahl' }}:
            </div>
            <div class="whitespace-pre-wrap">
              {{ capturedSelection }}
            </div>
          </div>
          <div
            v-else
            class="rounded border border-[--fackel-border] bg-amber-100/40 p-2 text-xs text-[--muted]"
          >
            Keine Textmarkierung erkannt — du kannst den Prompt trotzdem nur mit Kommentar generieren.
          </div>
          <UTextarea
            v-model="commentText"
            :rows="6"
            autofocus
            placeholder="Was soll Claude Code an dieser Stelle ändern?"
            class="w-full"
          />
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              @click="commentOpen = false"
            >
              Abbrechen
            </UButton>
            <UButton
              color="primary"
              icon="i-lucide-clipboard-copy"
              :disabled="!commentText.trim()"
              @click="submitComment"
            >
              Prompt kopieren
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
