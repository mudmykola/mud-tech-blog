<template>
  <div class="articles-grid">
    <ArticleCard v-for="article in filteredArticles" :key="article.handle" :article="article" />
  </div>
</template>

<script setup>
  import ArticleCard from '@/components/article/ArticleCardComponent.vue'
  defineProps(['filteredArticles'])
</script>
