<script setup lang="ts">
import { capitalize } from '~/utils/stringUtils'
import { useAsyncData } from '#app'
import { definePageData } from '~/utils/contentUtils'

const route = useRoute()

const tag = route.params.tag as string

await definePageData({
  title: 'Quellen mit Schlagwort: ' + capitalize(tag),
  pageHeading: 'Quellen mit Schlagwort: ' + capitalize(tag),
})

const { data: sourcesByTagRaw } = await useAsyncData(route.path, () => {
  return queryCollection('quellen')
    .where('tags', 'LIKE', '%"' + tag + '"%')
    .order('name', 'ASC')
    .all()
})
const sourcesByTag = sourcesByTagRaw.value as Source[]

const { data: sourceLinksByTagRaw } = await useAsyncData('sourceLinksByTag', () => {
  return queryCollection('quellenlinks')
    .where('tags', 'LIKE', '%"' + tag + '"%')
    .order('path', 'ASC')
    .all()
})
const sourceLinksByTag = sourceLinksByTagRaw.value as SourceLink[]

const { data: sourcesByLinksRaw }
  = (sourceLinksByTag == null || sourceLinksByTag.length == 0)
    ? { data: { value: [] } }
    : await useAsyncData('sourcelink-sources', () => {
        const builder = queryCollection('quellen').orWhere(
          (query) => {
            new Set(sourceLinksByTag.map(l => l.path)).forEach(s => query = query.where('path', '=', '/quellen/' + s.split('/')[2]))
            return query
          },
        )
        return builder
          .all()
      })
const sourcesByLinks = sourcesByLinksRaw.value as Source[]

const sourcesMap = new Map<string, { source: Source, links: SourceLink[] }>()

function findLinks(sourceLinks: SourceLink[], source: Source) {
  return sourceLinks.filter(l => l.path.startsWith(source.path + '/'))
}

for (const source of sourcesByLinks as Source[]) {
  sourcesMap.set(source.path.split('/').pop() || source.path, {
    source: source,
    links: findLinks(sourceLinksByTag, source),
  })
}
</script>

<template>
  <div v-if="sourcesByTag">
    <NuxtLink
      to="/quellen"
      style="display: inline-flex;
    vertical-align: middle;"
    >
      <icon
        name="i-lucide:arrow-left"
        style="margin-right: 0.5rem;"
      />
      Zurück zur Quellenliste
    </NuxtLink>

    <div class="flex groups">
      <div
        v-if="sourcesByTag.length > 0"
        class="results ml-2 mr-4"
      >
        <h3>Quellen</h3>
        <ul class="list-disc ml-4">
          <li
            v-for="source in sourcesByTag"
            :key="source.path"
          >
            <NuxtLink
              :to="source.path"
            >
              {{ source.name }}
              <span class="description">({{ source.description }})</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
      <div
        v-if="sourceLinksByTag.length > 0"
        class="results ml-2 mr-4"
      >
        <h3>Quellenlinks</h3>
        <ul class="list-disc ml-4">
          <li
            v-for="sourceLink in sourcesMap.values()"
            :key="sourceLink.source.path"
          >
            <NuxtLink
              :to="sourceLink.source.path"
            >
              {{ sourceLink.source.name }}
              <span class="description">({{ sourceLink.source.description }})</span>
            </NuxtLink>
            <br>
            <ul class="list-['-_'] ml-4">
              <li
                v-for="link in sourceLink.links"
                :key="link.path"
              >
                <NuxtLink
                  :to="link.path"
                >
                  {{ link.title }}
                </NuxtLink>
                <br>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div
        v-if="sourceLinksByTag.length + sourcesByTag.length== 0"
        class="ml-4 mr-4"
      >
        <h2>Oh nein!</h2>
        Ich habe keine Quelle oder keinen Quellenlink mit dem Schlagwort "{{ tag }}" gefunden.
      </div>
    </div>
  </div>
</template>

<style scoped>
.results {
  max-width: 40%;
  transition: ease all .5s;
}

.description {
  font-size: 0.8rem;
  font-weight: 200;
  color: #999;
}

.groups {
  @apply flex-row
}

@media screen and (max-width: 650px) {
  .results {
    max-width: 100%;
    transition: ease all .5s;
  }

  .groups {
    @apply flex-col;
    transition: ease all .5s;
  }

}
</style>
