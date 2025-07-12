<script setup>
  import { computed } from 'vue'

  const props = defineProps({ article: Object })

  const getPlainText = html => {
    if (!html) return ''
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }

  const truncatedExcerpt = computed(() => {
    const text = props.article.excerpt || getPlainText(props.article.contentHtml)
    if (!text) return 'Опис відсутній'
    const words = text.split(' ')
    return words.length > 20 ? words.slice(0, 20).join(' ') + '...' : text
  })
</script>

<template>
  <div class="article-card" v-if="article">
    <span v-if="article.tags?.length" class="article-tag">{{ article.tags[0] }}</span>
    <img
      v-if="article.image?.url"
      :src="article.image.url"
      :alt="article.title"
      class="article-image"
    />
    <div class="article-content">
      <h2>{{ article.title }}</h2>
      <p class="excerpt">{{ truncatedExcerpt }}</p>
      <router-link :to="'/blog/' + article.handle" class="read-more">Читати далі</router-link>
    </div>
  </div>
</template>
