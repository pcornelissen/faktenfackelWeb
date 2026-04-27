<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  source?: string
  verdict?: 'false' | 'misleading' | 'complex' | 'true' | ''
}>(), {
  title: 'Quellenlink',
  source: '',
  verdict: '',
})

const verdictColors: Record<string, string> = {
  false: '#C81E1E',
  misleading: '#DC5A0A',
  complex: '#BE8204',
  true: '#149444',
}

const verdictLabels: Record<string, string> = {
  false: 'FALSCH',
  misleading: 'IRREFUEHREND',
  complex: 'KOMPLEX',
  true: 'KORREKT',
}

const hasVerdict = !!props.verdict && props.verdict in verdictLabels
const badgeColor = hasVerdict ? verdictColors[props.verdict] : ''
const badgeLabel = hasVerdict ? verdictLabels[props.verdict] : ''
</script>

<template>
  <div style="display: flex; width: 1200px; height: 630px; background-color: #F5F0E8; position: relative;">
    <!-- Top stripe -->
    <div style="position: absolute; top: 0; left: 0; width: 1200px; height: 6px; background-color: #F98C35;" />

    <!-- Left text panel -->
    <div style="display: flex; flex-direction: column; width: 741px; height: 630px; padding: 32px 56px 24px 56px;">
      <!-- Top row: label + verdict badge -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px;">
        <!-- Category label + underline -->
        <div style="display: flex; flex-direction: column;">
          <span style="font-family: 'Ubuntu Mono'; font-weight: 700; font-size: 22px; color: #F98C35; letter-spacing: 0.05em;">
            QUELLENLINK
          </span>
          <div style="width: 96px; height: 2px; background-color: #F98C35; margin-top: 6px;" />
        </div>

        <!-- Verdict badge (optional) -->
        <div
          v-if="hasVerdict"
          :style="{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 22px',
            borderRadius: '6px',
            backgroundColor: badgeColor,
          }"
        >
          <span style="font-family: 'Ubuntu Mono'; font-weight: 700; font-size: 26px; color: #FFFFFF;">
            {{ badgeLabel }}
          </span>
        </div>
      </div>

      <!-- Title -->
      <div style="display: flex; flex: 1; align-items: flex-start;">
        <h1 style="font-family: 'Playfair Display'; font-weight: 700; font-size: 60px; color: #1C1917; line-height: 1.12; margin: 0; max-width: 100%;">
          {{ title }}
        </h1>
      </div>

      <!-- Bottom plinth -->
      <div style="display: flex; flex-direction: column;">
        <div style="height: 1px; background-color: #78716C; margin-bottom: 14px;" />
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: 'Ubuntu Mono'; font-weight: 400; font-size: 20px; color: #78716C;">
            {{ source ? 'Quelle: ' + source : 'faktenfackel.de' }}
          </span>
          <div style="display: flex;">
            <span style="font-family: 'Ubuntu Mono'; font-weight: 700; font-size: 22px; color: #1C1917;">FAKTEN</span>
            <span style="font-family: 'Ubuntu Mono'; font-weight: 700; font-size: 22px; color: #F98C35;">FACKEL</span>
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
