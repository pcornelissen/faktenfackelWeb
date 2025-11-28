<script setup>
const props = defineProps("content");

</script>
<template>
  <UCollapsible class="flex flex-col mt-8">
    <UButton
      label="Open DEBUG INFO"
      color="neutral"
      variant="subtle"
      trailing-icon="i-lucide-chevron-down"
      block
    />

    <template #content>
      <pre>{{ props.content }}</pre>
    </template>
  </UCollapsible>
</template>
