<script setup>
  import ArticleCard from '@/components/article/ArticleCardComponent.vue'

  defineProps({
    filteredArticles: {
      type: Array,
      default: () => [],
    },
  })
</script>

<template>
  <section class="articles-grid" aria-label="Сітка статей">
    <ArticleCard v-for="article in filteredArticles" :key="article.handle" :article="article" />
  </section>
</template>
