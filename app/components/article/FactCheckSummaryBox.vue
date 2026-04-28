<script setup lang="ts">
import { dateString } from '~/utils/stringUtils'

type PrimarySource = {
  label: string
  code?: string
  url?: string
}

const props = defineProps<{
  claim: string
  verdict?: 'false' | 'misleading' | 'complex' | 'true'
  summary: string
  claimAuthor?: string
  claimAppearance?: string
  keyEvidence?: string[]
  primarySources?: PrimarySource[]
  dateModified?: string | Date | null
}>()

const modifiedLabel = computed(() => props.dateModified ? dateString(props.dateModified as string) : '')
</script>

<template>
  <aside
    class="fact-summary"
    aria-labelledby="fact-summary-title"
  >
    <div class="fact-summary__kicker">
      Faktencheck Kurzfassung
    </div>
    <h2
      id="fact-summary-title"
      class="fact-summary__title"
    >
      Das prüfen wir
    </h2>

    <div class="fact-summary__grid">
      <section class="fact-summary__section fact-summary__section--wide">
        <h3>Geprüfte Behauptung</h3>
        <p>
          "{{ claim }}"
        </p>
        <p
          v-if="claimAuthor || claimAppearance"
          class="fact-summary__meta"
        >
          <span v-if="claimAuthor">Quelle der Behauptung: {{ claimAuthor }}</span>
          <span v-if="claimAuthor && claimAppearance"> · </span>
          <a
            v-if="claimAppearance"
            :href="claimAppearance"
            rel="nofollow noopener noreferrer"
          >Ursprung ansehen</a>
        </p>
      </section>

      <section class="fact-summary__section">
        <h3>Kurzurteil</h3>
        <VerdictLabel
          v-if="verdict"
          :type="verdict"
          to="/bewertungsmasstab/"
          class="fact-summary__verdict"
        />
        <p v-else>
          Das Urteil steht im Artikel.
        </p>
      </section>

      <section class="fact-summary__section fact-summary__section--wide">
        <h3>Warum dieses Urteil?</h3>
        <p>{{ summary }}</p>
      </section>

      <section
        v-if="keyEvidence?.length"
        class="fact-summary__section"
      >
        <h3>Wichtigste Belege</h3>
        <ul>
          <li
            v-for="item in keyEvidence"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
      </section>

      <section
        v-if="primarySources?.length"
        class="fact-summary__section"
      >
        <h3>Primärquellen</h3>
        <ul>
          <li
            v-for="item in primarySources"
            :key="item.code || item.url || item.label"
          >
            <SourceRef
              v-if="item.code"
              :code="item.code"
            >
              {{ item.label }}
            </SourceRef>
            <a
              v-else-if="item.url"
              :href="item.url"
              rel="external noopener"
              target="_blank"
            >{{ item.label }}</a>
            <template v-else>
              {{ item.label }}
            </template>
          </li>
        </ul>
      </section>
    </div>

    <p class="fact-summary__footer">
      <span v-if="modifiedLabel">Stand: {{ modifiedLabel }}. </span>
      Hinweise und Korrekturen können über die <NuxtLink to="/kontakt/">Kontaktseite</NuxtLink> gemeldet werden.
    </p>
  </aside>
</template>

<style scoped>
.fact-summary {
  margin: 0 0 2rem;
  padding: 1.15rem 1.25rem;
  border: 1px solid color-mix(in srgb, var(--flame) 26%, var(--fackel-border));
  border-top: 2px solid color-mix(in srgb, var(--flame) 62%, var(--fackel-border));
  border-radius: 0.75rem;
  background: #FCF7F0;
}

.fact-summary__kicker {
  margin-bottom: 0.35rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--flame);
}

.fact-summary__title {
  margin: 0 0 1rem;
  font-size: 1.45rem;
  line-height: 1.1;
  letter-spacing: 0;
}

.fact-summary__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 0.65fr);
  gap: 1rem 1.25rem;
}

.fact-summary__section {
  min-width: 0;
}

.fact-summary__section--wide {
  grid-column: 1 / -1;
}

.fact-summary h3 {
  margin: 0 0 0.35rem;
  font-family: 'Ubuntu Mono', monospace;
  font-size: 0.82rem;
  line-height: 1.25;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.fact-summary p,
.fact-summary ul {
  margin: 0;
  line-height: 1.6;
}

.fact-summary ul {
  padding-left: 1.15rem;
}

.fact-summary li + li {
  margin-top: 0.35rem;
}

.fact-summary__meta,
.fact-summary__footer {
  color: var(--muted);
  font-size: 0.9rem;
}

.fact-summary__meta {
  margin-top: 0.45rem;
}

.fact-summary__verdict {
  display: inline-block;
  margin-top: 0.1rem;
}

.fact-summary__footer {
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--fackel-border);
}

@media screen and (max-width: 720px) {
  .fact-summary {
    padding: 1rem;
  }

  .fact-summary__grid {
    grid-template-columns: 1fr;
  }
}
</style>
