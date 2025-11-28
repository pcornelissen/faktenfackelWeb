<script setup lang="ts">
const props = defineProps<{
  title: string
  subTitle?: string
  href?: string
}>()

function click() {
  const href = props.href
  if (href) {
    window.location.href = href
  }
}
</script>

<template>
  <div
    class="section"
    :class="[href ? 'clickable' : '']"
    @click="click"
  >
    <h2>{{ title }}</h2>
    <div
      v-if="subTitle"
      class="subtitle"
    >
      {{ subTitle }}
    </div>
    <div
      v-else
      class="subtitle"
    >
&nbsp;
    </div>
    <slot />
  </div>
</template>

<style scoped>
h2 {
  margin: 0;
}

.subtitle {
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.section {
  display: inline-flex;
  flex: content;
  flex-direction: column;
  margin: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  max-width: 30%;
  min-width: 20rem;
  min-height: 15rem;
}

.clickable:hover {
  background-color: #F5F5F5;
  border: 1px dot-dash #d5d5d5;
  cursor: pointer;
}
</style>
