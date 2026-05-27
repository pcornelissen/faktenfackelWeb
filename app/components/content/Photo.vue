<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  src: string
  alt: string
  credit: string
  source: string
  sourceUrl: string
  license: string
  caption?: string
  licenseUrl?: string
  width?: string
  height?: string
  symbolbild?: boolean
}>(), {
  caption: '',
  licenseUrl: '',
  width: '',
  height: '',
  symbolbild: false,
})

// Volltext für den Desktop-Hover-Tooltip (sichtbarer Credit ist ohnehin vollständig).
const creditTitle = computed(
  () => `Foto: ${props.credit} via ${props.source}, Lizenz ${props.license}`,
)
</script>

<template>
  <figure class="ff-photo">
    <img
      :src="src"
      :alt="alt"
      :width="width || undefined"
      :height="height || undefined"
      loading="lazy"
      decoding="async"
    >
    <figcaption class="ff-photo-caption">
      <span
        v-if="caption"
        class="ff-photo-text"
      >{{ caption }}</span>
      <span
        class="ff-photo-credit"
        :title="creditTitle"
      >
        <span v-if="symbolbild">Symbolbild&nbsp;·&nbsp;</span>
        <span>Foto:&nbsp;</span>
        <a
          :href="sourceUrl"
          target="_blank"
          rel="noopener nofollow"
        >{{ credit }} / {{ source }}</a>
        <span>&nbsp;·&nbsp;</span>
        <a
          v-if="licenseUrl"
          :href="licenseUrl"
          target="_blank"
          rel="noopener nofollow"
        >{{ license }}</a>
        <span v-else>{{ license }}</span>
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.ff-photo {
  margin: 1.5rem 0;
}

.ff-photo img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
  border: 1px solid var(--fackel-border);
  border-radius: 4px;
}

.ff-photo-caption {
  margin-top: 0.5rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: var(--muted);
  text-align: center;
  line-height: 1.45;
}

.ff-photo-text {
  display: block;
}

.ff-photo-credit {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.72rem;
}

.ff-photo-credit a {
  color: var(--muted);
  text-decoration: underline;
}
</style>
