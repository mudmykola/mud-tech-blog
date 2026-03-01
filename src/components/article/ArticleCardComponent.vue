<script setup>
  import { computed } from 'vue'
  import { useOptimizedImage } from '@/composables/useOptimizedImage.js'

  const props = defineProps({
    article: { type: Object, required: true },
  })

  const getPlainText = html => {
    if (!html) return ''
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }

  const truncatedExcerpt = computed(() => {
    const src = props.article.excerpt || getPlainText(props.article.contentHtml)
    if (!src) return 'Опис відсутній'

    return src.split(' ').slice(0, 16).join(' ') + '...'
  })

  const tag = computed(() => props.article.tags?.[0] || null)
  const publishDate = computed(() => {
    if (!props.article.publishedAt) return '-'
    return new Date(props.article.publishedAt).toLocaleDateString('uk-UA')
  })

  const img = useOptimizedImage(props.article?.image?.url, props.article?.title, 1200, {
    sizes: '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw',
  })
</script>

<template>
  <router-link :to="'/blog/' + article.handle" class="mm-article2">
    <div class="mm-article2__halo" />

    <div class="mm-article2__top">
      <div v-if="tag" class="mm-article2__tag">
        <v-icon icon="mdi-tag-outline" size="14" />
        {{ tag }}
      </div>
      <div class="mm-article2__quick">
        <v-icon icon="mdi-open-in-new" size="16" />
      </div>
    </div>

    <div class="mm-article2__image-wrapper">
      <img class="mm-article2__image" v-bind="img.attributes" />
    </div>

    <div class="mm-article2__content">
      <h2 class="mm-article2__title">{{ article.title }}</h2>

      <p class="mm-article2__excerpt">
        {{ truncatedExcerpt }}
      </p>

      <div class="mm-article2__meta">
        <div class="mm-article2__meta-left">
          <v-icon icon="mdi-calendar-month-outline" size="18" />
          <span>{{ publishDate }}</span>
        </div>

        <div class="mm-article2__readmore">
          <v-icon icon="mdi-book-open-page-variant-outline" size="16" />
          Читати
        </div>
      </div>
    </div>
  </router-link>
</template>
