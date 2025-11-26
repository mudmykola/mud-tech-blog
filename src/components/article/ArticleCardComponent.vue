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

    return src.split(' ').slice(0, 14).join(' ') + '…'
  })

  const tag = computed(() => props.article.tags?.[0] || null)
  const img = useOptimizedImage(props.article?.image?.url, props.article?.title, 300)
</script>

<template>
  <router-link :to="'/blog/' + article.handle" class="mm-article2">
    <div class="mm-article2__glow"></div>

    <div v-if="tag" class="mm-article2__tag">
      <v-icon icon="mdi-label" size="14" />
      {{ tag }}
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
          <v-icon icon="mdi-clock-outline" size="18" />
          <span>{{ article.publishedAt?.slice(0, 10) || '—' }}</span>
        </div>

        <div class="mm-article2__readmore">
          Читати
          <v-icon icon="mdi-arrow-right" size="18" />
        </div>
      </div>
    </div>
  </router-link>
</template>
