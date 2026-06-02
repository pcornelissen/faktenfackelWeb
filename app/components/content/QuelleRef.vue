<script setup lang="ts">
const props = defineProps<{
  name: string
}>()

const { data: quelleList } = await useFetch('/api/content/list', {
  query: { collection: 'quellen', scope: 'slug', value: props.name },
  key: 'quelle-' + props.name,
})

const source = computed(() =>
  ((quelleList.value ?? []) as Source[])[0] ?? null,
)
</script>

<template>
  <span
    v-if="!source"
    class="source-missing"
  >
    {{ props.name }}
    <icon
      name="i-lucide:bug"
      style="color: red"
      :title="`Quelle nicht gefunden! (${props.name})`"
    />
  </span>
  <a
    v-else
    :href="source.path"
    :title="`${source.name}: Quellenprofil auf Faktenfackel`"
    :aria-label="`Quellenprofil von ${source.name}`"
    class="source-ref"
  >{{ source.name }}</a>
</template>

<style scoped>
.source-ref {
  text-decoration: underline var(--flame);
  text-underline-offset: 2px;
  transition: color 0.2s ease;
}

.source-ref:hover {
  color: var(--flame);
}

.source-missing {
  display: inline;
}
</style>
