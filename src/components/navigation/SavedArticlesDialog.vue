<script setup>
  import { computed, ref, watch } from 'vue'
  import { getBlogArticles } from '@/services/shopifyApi'
  import { useOptimizedImage } from '@/composables/useOptimizedImage'
  import { useSavedArticles } from '@/composables/useSavedArticles'
  import { estimateReadingMinutes } from '@/utils/homeReadingState'
  import savedArticlesText from '@/data/saved-articles.json'

  const {
    savedArticleHandles,
    savedLibraryOpen,
    closeSavedLibrary,
    removeSavedArticle,
    clearSavedArticles,
  } = useSavedArticles()

  const articles = ref([])
  const isLoading = ref(false)
  const hasLoadError = ref(false)
  const catalogLoaded = ref(false)

  const savedArticles = computed(() => {
    const saved = new Set(savedArticleHandles.value)
    return articles.value.filter(article => saved.has(article.handle))
  })
  const unavailableCount = computed(() =>
    Math.max(0, savedArticleHandles.value.length - savedArticles.value.length)
  )

  const loadArticles = async () => {
    if (isLoading.value || catalogLoaded.value || !savedArticleHandles.value.length) return

    isLoading.value = true
    hasLoadError.value = false

    try {
      const result = await getBlogArticles()
      if (!result.length) {
        hasLoadError.value = true
        return
      }

      articles.value = result
      catalogLoaded.value = true
    } catch {
      hasLoadError.value = true
    } finally {
      isLoading.value = false
    }
  }

  watch([savedLibraryOpen, savedArticleHandles], ([isOpen, handles]) => {
    if (isOpen && handles.length) loadArticles()
  })

  const retryLoading = () => {
    hasLoadError.value = false
    loadArticles()
  }

  const clearUnavailableArticles = () => {
    const availableHandles = new Set(articles.value.map(article => article.handle))
    savedArticleHandles.value
      .filter(handle => !availableHandles.has(handle))
      .forEach(removeSavedArticle)
  }

  const imageAttrs = article => {
    const imageUrl = article.image?.url || ''
    return useOptimizedImage(imageUrl, article.image?.altText || article.title, 760, {
      sizes: '(max-width: 600px) 76px, 100px',
      style: 'width:100%;height:100%;display:block;object-fit:cover;border-radius:inherit;',
    }).attributes
  }

  const readTime = article => estimateReadingMinutes(article.contentHtml)
</script>

<template>
  <v-dialog v-model="savedLibraryOpen" class="mm-saved-articles-dialog" max-width="760" scrollable>
    <section
      id="mm-saved-library"
      class="mm-saved-library"
      aria-labelledby="mm-saved-library-title"
    >
      <header class="mm-saved-library__header">
        <div>
          <span class="mm-saved-library__eyebrow">
            <v-icon icon="mdi-bookmark-multiple-outline" size="16" aria-hidden="true" />
            {{ savedArticlesText.navLabel }}
          </span>
          <h2 id="mm-saved-library-title">{{ savedArticlesText.title }}</h2>
          <p>{{ savedArticlesText.subtitle }}</p>
        </div>
        <div class="mm-saved-library__header-actions">
          <span class="mm-saved-library__count" aria-live="polite">
            <strong>{{ savedArticleHandles.length }}</strong>
            {{ savedArticlesText.savedCount }}
          </span>
          <button
            class="mm-saved-library__close"
            type="button"
            :aria-label="savedArticlesText.close"
            :title="savedArticlesText.close"
            @click="closeSavedLibrary"
          >
            <v-icon icon="mdi-close" size="20" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div v-if="isLoading" class="mm-saved-library__state" role="status">
        <v-progress-circular indeterminate color="primary" size="28" />
        <span>{{ savedArticlesText.loading }}</span>
      </div>

      <div v-else-if="hasLoadError" class="mm-saved-library__state" role="alert">
        <v-icon icon="mdi-cloud-alert-outline" size="28" aria-hidden="true" />
        <p>{{ savedArticlesText.loadError }}</p>
        <button class="mm-saved-library__action" type="button" @click="retryLoading">
          <v-icon icon="mdi-refresh" size="17" aria-hidden="true" />
          {{ savedArticlesText.retry }}
        </button>
      </div>

      <div
        v-else-if="!savedArticleHandles.length"
        class="mm-saved-library__state mm-saved-library__state--empty"
      >
        <span class="mm-saved-library__empty-icon">
          <v-icon icon="mdi-bookmark-outline" size="28" aria-hidden="true" />
        </span>
        <h3>{{ savedArticlesText.emptyTitle }}</h3>
        <p>{{ savedArticlesText.emptyDescription }}</p>
        <router-link class="mm-saved-library__action" to="/blog" @click="closeSavedLibrary">
          <v-icon icon="mdi-magnify" size="17" aria-hidden="true" />
          {{ savedArticlesText.browseArticles }}
        </router-link>
      </div>

      <div
        v-else-if="!savedArticles.length"
        class="mm-saved-library__state mm-saved-library__state--empty"
      >
        <v-icon icon="mdi-bookmark-off-outline" size="28" aria-hidden="true" />
        <p>{{ savedArticlesText.unavailable }}</p>
        <button class="mm-saved-library__action" type="button" @click="clearSavedArticles">
          {{ savedArticlesText.clearUnavailable }}
        </button>
      </div>

      <div v-else class="mm-saved-library__content">
        <p v-if="unavailableCount" class="mm-saved-library__notice">
          {{ savedArticlesText.availableOf }} {{ savedArticles.length }} /
          {{ savedArticleHandles.length }}
        </p>

        <div class="mm-saved-library__list" role="list" :aria-label="savedArticlesText.navLabel">
          <article
            v-for="article in savedArticles"
            :key="article.handle"
            class="mm-saved-library__item"
            role="listitem"
          >
            <router-link
              class="mm-saved-library__item-link"
              :to="{ name: 'article', params: { slug: article.handle } }"
              @click="closeSavedLibrary"
            >
              <div class="mm-saved-library__image">
                <img v-if="article.image?.url" v-bind="imageAttrs(article)" alt="" />
                <v-icon v-else icon="mdi-text-box-outline" size="24" aria-hidden="true" />
              </div>
              <div class="mm-saved-library__details">
                <span class="mm-saved-library__tag">
                  {{ article.tags?.[0] || savedArticlesText.articleLabel }}
                </span>
                <h3>{{ article.title }}</h3>
                <span class="mm-saved-library__read-time" v-if="readTime(article)">
                  <v-icon icon="mdi-clock-outline" size="14" aria-hidden="true" />
                  {{ readTime(article) }} {{ savedArticlesText.readMinutes }}
                </span>
              </div>
            </router-link>
            <button
              class="mm-saved-library__remove"
              type="button"
              :aria-label="`${savedArticlesText.remove}: ${article.title}`"
              :title="savedArticlesText.remove"
              @click="removeSavedArticle(article.handle)"
            >
              <v-icon icon="mdi-bookmark-remove-outline" size="19" aria-hidden="true" />
            </button>
          </article>
        </div>
      </div>
    </section>
  </v-dialog>
</template>
