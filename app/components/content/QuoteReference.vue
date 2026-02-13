<script setup lang="ts">
import { useSlots } from 'vue'

const props = defineProps<{
  code: string
}>()

const slots = useSlots()
const quote = computed(() => {
  return referencesStore.quoteByCode(props.code)
})
const source = computed(() => {
  return referencesStore.sourceByLinkPath(quote.value.path)
})
</script>

<template>
  <div
    v-if="!referencesStore.hasQuoteForCode(props.code)"
    class="bg-warning"
  >
    <slot />
    (Kein Zitat gefunden! <span class="source">{{ props.code }}</span>
    <icon
      name="i-lucide:bug"
      style="color: red"
      :title="`Zitat nicht gefunden! (${props.code})`"
    />
    )
  </div>
  <div
    v-else
    style="display: inline"
  >
    Zitat:
    <nuxt-link
      :to="quote.path"
      class="quote"
    >
      <slot v-if="slots.default" />
      <template v-else>
        &laquo; {{ quote.teaser }} &raquo;
        <span
          v-if="source"
          class="source"
        >({{ source.name || 'Lade Quellenname...' }})</span>
        <icon
          v-else
          name="i-lucide:bug"
          style="color: red"
          class="info-icon"
          :title="`Quelle nicht gefunden! (${quote.path.split('/')[2]})`"
        />
        <icon
          class="info-icon"
          name="i-lucide:book-marked"
        />
      </template>
    </nuxt-link>
  </div>
</template>

<style scoped>
:root {
  display: inline;
}

.quote {
  transition: ease all .5s;
}

.quote:hover {
  color: var(--color-tertiary);
  transition: ease all .5s;
}

.quote:hover .info-icon {
  color: var(--color-tertiary);
  transition: ease all .5s;
}

.quote:hover .source {
  color: black;
  transition: ease all .5s;
}

.source {
  color: gray;
  transition: ease all .5s;
}

.info-icon {
  color: var(--color-secondary);
  position: relative;
  top: 2px;
  margin-left: 3px;
  margin-right: 6px;
  transition: ease all .5s;
}

.info-icon:hover {
  color: var(--color-tertiary);
  transition: ease all .5s;
}
</style>
