<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'Lagerfeuer',
})
</script>

<template>
  <div style="display: flex; width: 1200px; height: 630px; background-color: #F5F0E8; position: relative;">
    <!-- Top stripe -->
    <div style="position: absolute; top: 0; left: 0; width: 1200px; height: 6px; background-color: #F98C35;" />

    <!-- Left text panel -->
    <div style="display: flex; flex-direction: column; width: 741px; height: 630px; padding: 32px 56px 24px 56px;">
      <!-- Category label + underline -->
      <div style="display: flex; flex-direction: column; margin-bottom: 12px;">
        <span style="font-family: 'Ubuntu Mono'; font-weight: 700; font-size: 15px; color: #F98C35; letter-spacing: 0.05em;">
          LAGERFEUER
        </span>
        <div style="width: 80px; height: 1px; background-color: #F98C35; margin-top: 4px;" />
      </div>

      <!-- Title -->
      <div style="display: flex; flex: 1; align-items: flex-start;">
        <h1 style="font-family: 'Playfair Display'; font-weight: 700; font-size: 52px; color: #1C1917; line-height: 1.15; margin: 0;">
          {{ title }}
        </h1>
      </div>

      <!-- Bottom plinth -->
      <div style="display: flex; flex-direction: column;">
        <div style="height: 1px; background-color: #78716C; margin-bottom: 12px;" />
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: 'Ubuntu Mono'; font-weight: 400; font-size: 14px; color: #78716C;">
            faktenfackel.de
          </span>
          <div style="display: flex;">
            <span style="font-family: 'Ubuntu Mono'; font-weight: 700; font-size: 15px; color: #1C1917;">FAKTEN</span>
            <span style="font-family: 'Ubuntu Mono'; font-weight: 700; font-size: 15px; color: #F98C35;">FACKEL</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Boundary line -->
    <div style="position: absolute; left: 739px; top: 0; width: 2px; height: 630px; background-color: #F98C35;" />

    <!-- Right dark panel with flame -->
    <div style="display: flex; align-items: center; justify-content: center; width: 459px; height: 630px; background-color: #1A1612;">
      <img
        src="/img/flame-light.svg"
        alt=""
        width="220"
        height="500"
        style="opacity: 0.9;"
      >
    </div>
  </div>
</template>
