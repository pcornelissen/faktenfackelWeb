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
            width="40"
            height="40"
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
  gap: 0.8rem;
}

.icon-wrap {
  flex-shrink: 0;
}

.heading-el {
  margin: 0.25rem 0 0.15rem;
  font-weight: 700;
  line-height: 0.98;
  letter-spacing: -0.04em;
}

h1.heading-el {
  font-size: clamp(2.2rem, 4.2vw, 3.7rem);
}

h2.heading-el,
h3.heading-el {
  font-size: clamp(1.5rem, 2vw, 2.1rem);
}

img {
  height: 3rem;
  opacity: 0.92;
}

.subtitle {
  font-size: 0.86rem;
  color: var(--muted);
  margin-bottom: 0.8rem;
  font-family: 'Ubuntu Mono', monospace;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

@media screen and (max-width: 560px) {
  .heading-row {
    align-items: flex-start;
  }

  img {
    height: 2.5rem;
  }

  .subtitle {
    font-size: 0.8rem;
    margin-bottom: 0.65rem;
  }
}
</style>
