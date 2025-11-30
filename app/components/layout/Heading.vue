<script setup lang="ts">
const props = defineProps<{
  title: string
  subTitle?: string
  icon?: string
  iconTxt?: string
}>()
</script>

<template>
  <div class="flex">
    <div
      v-if="props.icon"
      class="flex-shrink-0 mr-2"
    >
      <img
        :src="`/img/categories/${props.icon}.png`"
        alt="Bild für ${title}`"
      >
      <div
        v-if="props.iconTxt"
        class="text-gray-500 iconTxt"
        v-html="props.iconTxt"
      />
    </div>
    <div class="flex-auto">
      <h2>{{ props.title }}</h2>
      <div
        v-if="props.subTitle"
        class="subtitle"
      >
        {{ props.subTitle }}
      </div>
      <div
        v-else
        class="subtitle"
      >
        &nbsp;
      </div>
    </div>
  </div>
</template>

<style scoped>
  h2 {
    margin: 0.4rem 0 0;
  }

  img {
    height: 2.5rem;
  }

  .subtitle {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }

  .iconTxt {
    font-size: 0.4rem;
    line-height: 0.4rem;
  }
</style>
