<script setup lang="ts">
const props = defineProps<{
  src: string
  title?: string
}>()

const loaded = ref(false)

// Build the nocookie embed URL, preserving any query parameters
const embedSrc = computed(() => {
  if (!props.src) return ''
  // Replace youtube.com or youtube-nocookie.com with youtube-nocookie.com
  return props.src.replace(
    /^https?:\/\/(www\.)?youtube(?:-nocookie)?\.com/,
    'https://www.youtube-nocookie.com',
  )
})

const displayTitle = computed(() => props.title || 'YouTube-Video')
</script>

<template>
  <div class="yt-embed">
    <div
      v-if="!loaded"
      class="yt-consent"
    >
      <div class="yt-overlay">
        <div
          class="yt-icon"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 90 63"
            xmlns="http://www.w3.org/2000/svg"
            width="72"
            height="50"
          >
            <path
              d="M88.1 9.9C87.1 6.2 84.2 3.3 80.5 2.2 73.5 0 45 0 45 0S16.5 0 9.5 2.2C5.8 3.3 2.9 6.2 1.9 9.9 0 16.9 0 31.5 0 31.5s0 14.6 1.9 21.6c1 3.7 3.9 6.6 7.6 7.7C16.5 63 45 63 45 63s28.5 0 35.5-2.2c3.7-1.1 6.6-4 7.6-7.7C90 46.1 90 31.5 90 31.5S90 16.9 88.1 9.9z"
              fill="#ff0000"
            />
            <path
              d="M36 45L59.3 31.5 36 18z"
              fill="#fff"
            />
          </svg>
        </div>
        <p class="yt-notice">
          Dieses Video wird von YouTube bereitgestellt.
          Beim Laden werden Daten an Google übertragen.
        </p>
        <button
          class="yt-load-btn"
          type="button"
          :aria-label="`${displayTitle} laden`"
          @click="loaded = true"
        >
          Video laden
        </button>
        <p class="yt-policy-hint">
          Weitere Informationen in unserer
          <a
            href="/datenschutz#m328"
            target="_blank"
          >Datenschutzerklärung</a>.
        </p>
      </div>
    </div>
    <iframe
      v-else
      :src="embedSrc"
      :title="displayTitle"
      style="aspect-ratio: 16 / 9; width: 100%; border: 0;"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    />
  </div>
</template>

<style scoped>
.yt-embed {
  margin: 1.25rem 0;
}

.yt-consent {
  position: relative;
  aspect-ratio: 16 / 9;
  width: 100%;
  background-color: var(--ash);
  border-radius: 4px;
  overflow: hidden;
}

.yt-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1.5rem;
  text-align: center;
}

.yt-icon {
  margin-bottom: 0.25rem;
  opacity: 0.9;
}

.yt-notice {
  color: var(--paper);
  font-size: 0.9rem;
  max-width: 36ch;
  margin: 0;
  line-height: 1.45;
}

.yt-load-btn {
  margin-top: 0.25rem;
  padding: 0.5rem 1.4rem;
  background: var(--flame);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s;
}

.yt-load-btn:hover {
  background: var(--ember);
}

.yt-policy-hint {
  font-size: 0.75rem;
  color: var(--muted);
  margin: 0;
}

.yt-policy-hint a {
  color: var(--muted);
  text-decoration: underline;
}
</style>
