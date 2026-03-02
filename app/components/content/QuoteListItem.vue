<script setup lang="ts">
import type { Quote } from '~/utils/contentUtils'
import Tags from '~/components/sources/Tags.vue'

const props = defineProps<{
  quote: Quote
}>()
</script>

<template>
  <li class="quote-item">
    <slot name="pre" />
    <div class="quote-body">
      <NuxtLink
        :to="props.quote.path"
        class="quote-link"
      >
        <div class="quote-title">
          {{ props.quote.title }}
        </div>
        <div
          v-if="props.quote.teaser"
          class="quote-teaser"
        >
          {{ props.quote.teaser }}
        </div>
        <slot />
      </NuxtLink>
      <Tags
        :tags="props.quote.tags"
        base-path="/zitate"
      />
      <slot name="post" />
    </div>
  </li>
</template>

<style scoped>
.quote-item {
  list-style: none;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid var(--fackel-border);
  transition: background 0.15s;
}

.quote-item:last-child {
  border-bottom: none;
}

.quote-body {
  flex: 1;
  min-width: 0;
}

.quote-link {
  display: block;
  text-decoration: none;
  margin-bottom: 0.5rem;
}

.quote-title {
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--flame);
  margin-bottom: 0.3rem;
}

.quote-teaser {
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 1rem;
  font-weight: 400;
  color: var(--ink);
  line-height: 1.5;
  transition: color 0.15s;
}

.quote-link:hover .quote-teaser {
  color: var(--ember);
}
</style>
