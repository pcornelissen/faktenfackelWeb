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
  padding: 1.25rem 0.75rem;
  border-bottom: 1px solid var(--fackel-border);
  border-radius: 4px;
  transition: background 0.15s;
}

.quote-item:hover {
  background: #FAF6F0;
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
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.05rem;
  font-weight: 400;
  font-style: italic;
  color: var(--ink);
  line-height: 1.55;
  border-left: 3px solid var(--flame);
  padding-left: 0.75rem;
  margin-top: 0.2rem;
  transition: color 0.15s, border-color 0.15s;
}

.quote-teaser::before {
  content: '\201E';
  font-size: 1.4em;
  line-height: 0;
  vertical-align: -0.35em;
  color: var(--flame);
  margin-right: 0.1em;
  font-style: normal;
}

.quote-teaser::after {
  content: '\201C';
  font-size: 1.4em;
  line-height: 0;
  vertical-align: -0.35em;
  color: var(--flame);
  margin-left: 0.1em;
  font-style: normal;
}

.quote-link:hover .quote-teaser {
  color: var(--ember);
  border-color: var(--ember);
}
</style>
