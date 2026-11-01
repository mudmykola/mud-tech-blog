<script setup>
  import discoveryText from '@/data/home-quick-actions.json'

  defineProps({
    article: {
      type: Object,
      default: null,
    },
    topic: {
      type: String,
      default: '',
    },
    readingMinutes: {
      type: Number,
      default: null,
    },
  })
</script>

<template>
  <section v-if="article?.handle" class="mm-home-feature" :aria-label="discoveryText.featured">
    <div class="mm-home-feature__copy">
      <span class="mm-home-feature__eyebrow">
        <v-icon icon="mdi-compass-outline" size="15" />
        {{ discoveryText.featured }}
      </span>
      <span v-if="topic" class="mm-home-feature__topic">{{ topic }}</span>
      <h2 class="mm-home-feature__title">{{ article.title }}</h2>
      <span v-if="readingMinutes" class="mm-home-feature__time">
        <v-icon icon="mdi-clock-outline" size="14" />
        {{ readingMinutes }} {{ discoveryText.readingMinutes }}
      </span>
    </div>
    <router-link
      class="mm-home-feature__link"
      :to="{ name: 'article', params: { slug: article.handle } }"
      :aria-label="`${discoveryText.readArticle}: ${article.title}`"
    >
      <v-icon icon="mdi-arrow-top-right" size="20" />
    </router-link>
  </section>
</template>
