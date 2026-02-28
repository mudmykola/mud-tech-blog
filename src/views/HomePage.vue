<script setup>
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import HomeHeader from '@/components/home/HomeHeaderComponent.vue'
  import ArticleFilters from '@/components/home/ArticleFiltersComponent.vue'
  import ArticleGrid from '@/components/home/ArticleGridComponent.vue'
  import HomeSidebarInsightsComponent from '@/components/home/HomeSidebarInsightsComponent.vue'
  import HomeQuickActionsComponent from '@/components/home/HomeQuickActionsComponent.vue'
  import DonationSection from '@/components/donation/DonationSection.vue'
  import RelatedPostsComponent from '@/components/related-posts/RelatedPostsComponent.vue'

  import { getBlogArticles } from '@/services/shopifyApi'
  import { useArticleFilters } from '@/composables/useArticleFilters'
  import { useMetaTags } from '@/composables/useMetaTags'
  import { useJsonLd } from '@/composables/useJsonLd'
  import {
    generateCollectionPageJsonLd,
    generateItemListJsonLd,
    generateOrganizationJsonLd,
    generateWebSiteJsonLd,
  } from '@/utils/jsonld'
  import { ANALYTICS_EVENTS, ANALYTICS_PARAMS } from '@/analytics/events'
  import { trackEvent } from '@/firebase'

  const uiText = {
    title: 'Технології, архітектура та продуктивність вебу',
    subtitle: 'Залишайся попереду. Читай, дізнавайся, впроваджуй',
    loading: 'Завантаження статей...',
    notFound: 'Статті не знайдено. Спробуй змінити фільтр або пошук.',
    showAll: 'Відкрити каталог статей',
    sectionTitle: 'Свіжі публікації',
    sectionHint: 'Гнучкий підбір контенту: пошук, сортування і швидкий перегляд.',
  }

  const sortLabels = {
    date_desc: 'Новіші спочатку',
    date_asc: 'Старіші спочатку',
    title_asc: 'Назва: А-Я',
    title_desc: 'Назва: Я-А',
  }

  const articles = ref([])
  const loading = ref(true)
  const searchQuery = ref('')
  const sortBy = ref('date_desc')
  let searchTrackTimeout = null

  const buildHomeSchemas = list => {
    const articleItems = list.slice(0, 12).map(item => ({
      name: item.title,
      url: `/blog/${item.handle}`,
    }))

    return [
      generateOrganizationJsonLd(),
      generateWebSiteJsonLd(),
      generateCollectionPageJsonLd({
        path: '/',
        name: 'Головна сторінка Mud Tech Blog',
        description:
          'Технологічний блог українською про frontend, AI, eCommerce та продуктивну веб-розробку.',
      }),
      generateItemListJsonLd({
        path: '/',
        items: articleItems,
      }),
    ]
  }

  onMounted(async () => {
    articles.value = await getBlogArticles()
    loading.value = false
    useMetaTags()
    useJsonLd(buildHomeSchemas(articles.value))
  })

  const filteredArticles = useArticleFilters(articles, searchQuery, sortBy)
  const filteredCount = computed(() => filteredArticles.value.length)
  const filteredShare = computed(() => {
    if (!articles.value.length) return '0%'
    return `${Math.round((filteredCount.value / articles.value.length) * 100)}%`
  })
  const activeSortLabel = computed(() => sortLabels[sortBy.value] || '-')
  const latestPublished = computed(() => {
    if (!articles.value.length) return '-'
    const latest = articles.value.reduce((acc, item) => {
      if (!acc) return item
      return new Date(item.publishedAt) > new Date(acc.publishedAt) ? item : acc
    }, null)
    return latest?.publishedAt ? new Date(latest.publishedAt).toLocaleDateString('uk-UA') : '-'
  })

  const uniqueTagsCount = computed(() => {
    const tags = new Set(
      articles.value.flatMap(item => (Array.isArray(item.tags) ? item.tags : [])).filter(Boolean)
    )
    return tags.size
  })

  const topTags = computed(() => {
    const counts = new Map()
    articles.value.forEach(item => {
      if (!Array.isArray(item.tags)) return
      item.tags.forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1))
    })

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, count]) => ({ label, count }))
  })

  watch(sortBy, value => {
    trackEvent(ANALYTICS_EVENTS.FILTER_CHANGED, {
      [ANALYTICS_PARAMS.ROUTE]: '/',
      [ANALYTICS_PARAMS.FILTER_TYPE]: 'sort',
      [ANALYTICS_PARAMS.FILTER_VALUE]: value,
      [ANALYTICS_PARAMS.RESULTS_COUNT]: filteredCount.value,
    })
  })

  watch(searchQuery, value => {
    if (searchTrackTimeout) clearTimeout(searchTrackTimeout)
    searchTrackTimeout = setTimeout(() => {
      trackEvent(ANALYTICS_EVENTS.SEARCH_USED, {
        [ANALYTICS_PARAMS.ROUTE]: '/',
        [ANALYTICS_PARAMS.SEARCH_QUERY_LENGTH]: String(value || '').trim().length,
        [ANALYTICS_PARAMS.RESULTS_COUNT]: filteredCount.value,
      })
    }, 450)
  })

  onBeforeUnmount(() => {
    if (searchTrackTimeout) clearTimeout(searchTrackTimeout)
  })
</script>

<template>
  <DefaultLayout>
    <div class="home mm-home">
      <HomeHeader
        :subtitle="uiText.subtitle"
        :title="uiText.title"
        :total-articles="articles.length"
        :filtered-articles="filteredCount"
        :active-sort-label="activeSortLabel"
        :latest-published="latestPublished"
        :filtered-share="filteredShare"
      />

      <div class="mm-home__content-grid">
        <section id="home-controls" class="mm-home__surface">
          <div class="mm-home__surface-head">
            <div class="mm-home__surface-title-wrap">
              <v-icon icon="mdi-view-grid-plus" size="22" />
              <h2 class="mm-home__surface-title">{{ uiText.sectionTitle }}</h2>
            </div>
            <p class="mm-home__surface-hint">{{ uiText.sectionHint }}</p>
          </div>

          <ArticleFilters
            :searchQuery="searchQuery"
            :sortBy="sortBy"
            @update:searchQuery="searchQuery = $event"
            @update:sortBy="sortBy = $event"
          />

          <div v-if="loading" class="mm-home__state mm-home__state--loading">
            <v-progress-circular indeterminate size="24" width="3" color="primary" />
            <span>{{ uiText.loading }}</span>
          </div>

          <div v-else-if="!filteredArticles.length" class="mm-home__state mm-home__state--empty">
            <v-icon icon="mdi-file-search-outline" size="22" />
            <span>{{ uiText.notFound }}</span>
          </div>

          <ArticleGrid :filteredArticles="filteredArticles" />

          <router-link class="mm-home__cta" to="/blog">
            <v-icon icon="mdi-arrow-top-right-bold-box-outline" size="20" />
            {{ uiText.showAll }}
          </router-link>
        </section>

        <aside class="mm-home__donation-wrap">
          <DonationSection />
          <HomeSidebarInsightsComponent
            :uniqueTagsCount="uniqueTagsCount"
            :filteredCount="filteredCount"
            :topTags="topTags"
          />
          <HomeQuickActionsComponent
            :latestPublished="latestPublished"
            :activeSortLabel="activeSortLabel"
          />
          <div class="related-post related-post--sidebar">
            <RelatedPostsComponent :all-articles="articles" :limit="6" />
          </div>
        </aside>
      </div>
    </div>
  </DefaultLayout>
</template>
