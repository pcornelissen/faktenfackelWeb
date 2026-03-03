<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
  icon?: string
  iconTxt?: string
  as?: 'h1' | 'h2' | 'h3'
}>()
</script>

<template>
  <div>
    <div class="heading-row">
      <div
        v-if="props.icon"
        class="icon-wrap"
      >
        <picture>
          <source
            type="image/webp"
            :srcset="`/img/categories/opt/${props.icon}-64.webp 64w, /img/categories/opt/${props.icon}-128.webp 128w`"
            sizes="40px"
          >
          <img
            :src="`/img/categories/${props.icon}.png`"
            :alt="`Bild für ${props.title}`"
            :title="props.iconTxt"
          >
        </picture>
      </div>
      <h1
        v-if="props.as === 'h1'"
        class="heading-el"
      >
        {{ props.title }}
      </h1>
      <h3
        v-else-if="props.as === 'h3'"
        class="heading-el"
      >
        {{ props.title }}
      </h3>
      <h2
        v-else
        class="heading-el"
      >
        {{ props.title }}
      </h2>
    </div>
    <div
      v-if="props.subtitle"
      class="subtitle"
    >
      {{ props.subtitle }}
    </div>
    <div
      v-else
      class="subtitle"
    >
      &nbsp;
    </div>
  </div>
</template>

<style scoped>
  .heading-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon-wrap {
    flex-shrink: 0;
  }

  .heading-el {
    margin: 0.4rem 0 0.2rem;
    font-weight: 700;
  }

  h2.heading-el,
  h3.heading-el {
    font-size: 1.2rem;
  }

  img {
    height: 2.5rem;
    opacity: 0.9;
  }

  .subtitle {
    font-size: 0.82rem;
    color: var(--muted);
    margin-bottom: 0.5rem;
    font-family: 'Ubuntu Mono', monospace;
    letter-spacing: 0.04em;
  }
</style>
