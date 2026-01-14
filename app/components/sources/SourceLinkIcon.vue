<script setup lang="ts">
const props = defineProps<{
  type: string
}>()

function typeToIcon(typeStr: string) {
  switch (typeStr) {
    case 'facebook':
      return 'i-lucide:facebook'
    case 'youtube':
      return 'i-lucide:youtube'
    case 'article':
      return 'i-lucide:file-text'
    case 'video':
      return 'i-lucide:video'
    case 'audio':
      return 'i-lucide:headphones'
    case 'book':
      return 'i-lucide:book-open'
    case 'excel':
      return 'i-lucide:file-spreadsheet'
    default:
      return 'i-lucide:link'
  }
}
</script>

<template>
  <icon
    :name="typeToIcon(props.type)"
    :title="capitalize(props.type)"
    style="margin-right: 0.5rem;"
    class=" "
  />
</template>

<style scoped>

</style>
