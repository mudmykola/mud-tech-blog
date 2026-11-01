<script setup>
  import { computed } from 'vue'
  import { useOptimizedImage } from '@/composables/useOptimizedImage.js'
  import { estimateReadingMinutes } from '@/utils/homeReadingState.js'
  import discoveryText from '@/data/home-quick-actions.json'

  const props = defineProps({
    article: { type: Object, required: true },
    saved: { type: Boolean, default: null },
    compact: { type: Boolean, default: false },
  })
  const emit = defineEmits(['toggle-saved'])

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
  const readingMinutes = computed(() => estimateReadingMinutes(props.article.contentHtml))

  const img = useOptimizedImage(props.article?.image?.url, props.article?.title, 1200, {
    sizes: '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw',
  })
</script>

<template>
  <article
    class="mm-article2"
    :class="{
      'mm-article2--saveable': saved !== null,
      'mm-article2--compact': compact,
    }"
  >
    <router-link :to="'/blog/' + article.handle" class="mm-article2__link">
      <div class="mm-article2__halo" />

      <div class="mm-article2__top">
        <div v-if="tag" class="mm-article2__tag">
          <v-icon icon="mdi-tag-outline" size="14" />
          {{ tag }}
        </div>
        <div class="mm-article2__quick" aria-hidden="true">
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
            <v-icon icon="mdi-calendar-month-outline" size="16" />
            <span>{{ publishDate }}</span>
          </div>

          <div v-if="readingMinutes" class="mm-article2__readmore">
            <v-icon icon="mdi-clock-outline" size="15" />
            {{ readingMinutes }} хв читання
          </div>
        </div>
      </div>
    </router-link>

    <button
      v-if="saved !== null"
      class="mm-article2__save"
      type="button"
      :aria-label="`${saved ? discoveryText.removeSavedArticle : discoveryText.saveArticle}: ${article.title}`"
      :aria-pressed="saved"
      @click="emit('toggle-saved', article.handle)"
    >
      <v-icon :icon="saved ? 'mdi-bookmark' : 'mdi-bookmark-outline'" size="17" />
    </button>
  </article>
</template>
