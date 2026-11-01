<script setup>
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'

  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import HomeHeader from '@/components/home/HomeHeaderComponent.vue'
  import ArticleFilters from '@/components/home/ArticleFiltersComponent.vue'
  import ArticleGrid from '@/components/home/ArticleGridComponent.vue'
  import HomeFeaturedArticleComponent from '@/components/home/HomeFeaturedArticleComponent.vue'
  import DonationSection from '@/components/donation/DonationSection.vue'
  import RelatedPostsComponent from '@/components/related-posts/RelatedPostsComponent.vue'
  import ArticleCardsSkeleton from '@/components/skeleton/ArticleCardsSkeleton.vue'

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
  import { selectSurpriseArticle } from '@/utils/selectSurpriseArticle'
  import { filterHomeArticles } from '@/utils/filterHomeArticles'
  import {
    getHomeArticleBatch,
    HOME_ARTICLE_BATCH_SIZE,
    HOME_INITIAL_BATCH_SIZE,
  } from '@/utils/homeArticleBatch'
  import {
    estimateReadingMinutes,
    getLastReadArticle,
    getSavedArticleHandles,
    saveArticleHandles,
  } from '@/utils/homeReadingState'
  import discoveryText from '@/data/home-quick-actions.json'

  const uiText = {
    title: 'Технології, архітектура та продуктивність вебу',
    subtitle: 'Залишайся попереду. Читай, дізнавайся, впроваджуй',
    loading: 'Завантаження статей...',
    notFound: discoveryText.emptySearch,
    showAll: 'Відкрити каталог статей',
    sectionTitle: 'Свіжі публікації',
    articleCountLabel: 'матеріали',
    latestPublicationLabel: 'Оновлено',
  }

  const articles = ref([])
  const router = useRouter()
  const loading = ref(true)
  const searchQuery = ref('')
  const sortBy = ref('date_desc')
  const lastSurpriseHandle = ref('')
  const lastReadHandle = ref('')
  const savedArticleHandles = ref([])
  const selectedTopic = ref('')
  const activeHomeTab = ref('articles')
  const discoveryOpen = ref(false)
  const discoveryPanel = ref('search')
  const displayedArticleLimit = ref(HOME_INITIAL_BATCH_SIZE)
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
    lastReadHandle.value = getLastReadArticle()
    savedArticleHandles.value = getSavedArticleHandles()
    articles.value = await getBlogArticles()
    loading.value = false
    useMetaTags()
    useJsonLd(buildHomeSchemas(articles.value))
  })

  const filteredArticles = useArticleFilters(articles, searchQuery, sortBy, { limit: false })
  const visibleArticles = computed(() =>
    filterHomeArticles(filteredArticles.value, {
      topic: activeHomeTab.value === 'topics' ? selectedTopic.value : '',
      savedHandles: savedArticleHandles.value,
      savedOnly: activeHomeTab.value === 'library',
    })
  )
  const displayedArticles = computed(() =>
    getHomeArticleBatch(visibleArticles.value, displayedArticleLimit.value)
  )
  const stackCardCount = computed(() => {
    const count = displayedArticles.value.length
    return Math.min(count % 2 === 0 ? 2 : 3, count)
  })
  const remainingArticlesCount = computed(() =>
    Math.max(0, visibleArticles.value.length - displayedArticles.value.length)
  )
  const nextBatchCount = computed(() =>
    Math.min(HOME_ARTICLE_BATCH_SIZE, remainingArticlesCount.value)
  )
  const availableSavedCount = computed(
    () => articles.value.filter(item => savedArticleHandles.value.includes(item.handle)).length
  )
  const activeDiscoveryFilterCount = computed(
    () =>
      Number(Boolean(searchQuery.value.trim())) +
      Number(sortBy.value !== 'date_desc') +
      Number(activeHomeTab.value === 'library') +
      Number(activeHomeTab.value === 'topics' && Boolean(selectedTopic.value))
  )
  const latestArticle = computed(() => {
    if (!articles.value.length) return null
    return articles.value.reduce((latest, item) => {
      if (!latest) return item
      return new Date(item.publishedAt) > new Date(latest.publishedAt) ? item : latest
    }, null)
  })
  const latestPublished = computed(() => {
    const publishedAt = latestArticle.value?.publishedAt
    return publishedAt ? new Date(publishedAt).toLocaleDateString('uk-UA') : '-'
  })
  const continueArticle = computed(
    () => articles.value.find(item => item.handle === lastReadHandle.value) || null
  )
  const goToSurpriseArticle = () => {
    const article = selectSurpriseArticle(articles.value, {
      lastHandle: lastSurpriseHandle.value,
      latestHandle: latestArticle.value?.handle,
    })

    if (!article) return

    lastSurpriseHandle.value = article.handle
    router.push({ name: 'article', params: { slug: article.handle } })
  }

  const toggleSavedArticle = handle => {
    if (!handle) return
    savedArticleHandles.value = savedArticleHandles.value.includes(handle)
      ? savedArticleHandles.value.filter(savedHandle => savedHandle !== handle)
      : [...savedArticleHandles.value, handle]
    saveArticleHandles(savedArticleHandles.value)
    displayedArticleLimit.value = HOME_INITIAL_BATCH_SIZE
  }

  const selectHomeTab = tab => {
    activeHomeTab.value = tab
    if (tab !== 'topics') selectedTopic.value = ''
    displayedArticleLimit.value = HOME_INITIAL_BATCH_SIZE
  }

  const resetDiscoveryFilters = () => {
    searchQuery.value = ''
    sortBy.value = 'date_desc'
    selectedTopic.value = ''
    activeHomeTab.value = 'articles'
    displayedArticleLimit.value = HOME_INITIAL_BATCH_SIZE
  }

  const showMoreArticles = () => {
    displayedArticleLimit.value += HOME_ARTICLE_BATCH_SIZE
  }

  watch([searchQuery, sortBy], () => {
    displayedArticleLimit.value = HOME_INITIAL_BATCH_SIZE
  })

  const openDiscovery = () => {
    discoveryPanel.value =
      activeHomeTab.value === 'library'
        ? 'library'
        : activeHomeTab.value === 'topics'
          ? 'topics'
          : 'search'
    discoveryOpen.value = true
  }

  const selectDiscoveryPanel = panel => {
    discoveryPanel.value = panel
    if (panel === 'search') selectHomeTab('articles')
  }

  const applySavedFilter = () => {
    selectHomeTab('library')
    discoveryOpen.value = false
  }

  const selectDiscoveryTopic = topic => {
    selectedTopic.value = topic
    selectHomeTab('topics')
    discoveryOpen.value = false
  }

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

  const featuredTopic = computed(() => topTags.value[0]?.label || '')
  const featuredArticle = computed(() => {
    if (!featuredTopic.value) return null
    const matching = articles.value.filter(item =>
      (Array.isArray(item.tags) ? item.tags : []).some(
        tag => tag.toLocaleLowerCase() === featuredTopic.value.toLocaleLowerCase()
      )
    )
    return matching.at(-1) || null
  })
  const featuredReadingMinutes = computed(() =>
    featuredArticle.value ? estimateReadingMinutes(featuredArticle.value.contentHtml) : null
  )

  watch(sortBy, value => {
    trackEvent(ANALYTICS_EVENTS.FILTER_CHANGED, {
      [ANALYTICS_PARAMS.ROUTE]: '/',
      [ANALYTICS_PARAMS.FILTER_TYPE]: 'sort',
      [ANALYTICS_PARAMS.FILTER_VALUE]: value,
      [ANALYTICS_PARAMS.RESULTS_COUNT]: visibleArticles.value.length,
    })
  })

  watch(searchQuery, value => {
    if (searchTrackTimeout) clearTimeout(searchTrackTimeout)
    searchTrackTimeout = setTimeout(() => {
      trackEvent(ANALYTICS_EVENTS.SEARCH_USED, {
        [ANALYTICS_PARAMS.ROUTE]: '/',
        [ANALYTICS_PARAMS.SEARCH_QUERY_LENGTH]: String(value || '').trim().length,
        [ANALYTICS_PARAMS.RESULTS_COUNT]: visibleArticles.value.length,
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
      <HomeHeader :subtitle="uiText.subtitle" :title="uiText.title" />

      <div class="mm-home__content-grid">
        <section id="home-controls" class="mm-home__surface">
          <div class="mm-home__surface-head">
            <div class="mm-home__surface-title-row">
              <div class="mm-home__surface-title-wrap">
                <v-icon icon="mdi-view-grid-plus" size="22" />
                <h2 class="mm-home__surface-title">{{ uiText.sectionTitle }}</h2>
              </div>
              <div v-if="!loading" class="mm-home__surface-meta">
                <span class="mm-home__surface-count">
                  <strong>{{ articles.length }}</strong>
                  <span>{{ uiText.articleCountLabel }}</span>
                </span>
                <span v-if="articles.length" class="mm-home__surface-meta-divider" />
                <span v-if="articles.length" class="mm-home__surface-latest">
                  <v-icon icon="mdi-calendar-clock-outline" size="15" aria-hidden="true" />
                  <span class="mm-home__surface-latest-label">
                    {{ uiText.latestPublicationLabel }}
                  </span>
                  <span>{{ latestPublished }}</span>
                </span>
              </div>
              <button
                class="mm-home__filter-toggle"
                :class="{
                  'mm-home__filter-toggle--active': discoveryOpen || activeDiscoveryFilterCount,
                }"
                type="button"
                aria-haspopup="dialog"
                :aria-expanded="discoveryOpen"
                :aria-label="
                  activeDiscoveryFilterCount
                    ? `${discoveryText.openDiscovery}. Активних фільтрів: ${activeDiscoveryFilterCount}`
                    : discoveryText.openDiscovery
                "
                :title="discoveryText.openDiscovery"
                @click="openDiscovery"
              >
                <v-icon icon="mdi-tune-variant" size="19" aria-hidden="true" />
                <span
                  v-if="activeDiscoveryFilterCount"
                  class="mm-home__filter-count"
                  aria-hidden="true"
                >
                  {{ activeDiscoveryFilterCount }}
                </span>
              </button>
            </div>
          </div>

          <div
            v-if="loading"
            class="mm-home__state mm-home__state--loading mm-home__state--skeleton"
          >
            <ArticleCardsSkeleton :count="6" />
          </div>

          <div v-else-if="!visibleArticles.length" class="mm-home__state mm-home__state--empty">
            <v-icon icon="mdi-file-search-outline" size="22" />
            <span>
              {{
                activeHomeTab === 'library'
                  ? discoveryText.emptySaved
                  : activeHomeTab === 'topics' && selectedTopic
                    ? discoveryText.emptyTopic
                    : uiText.notFound
              }}
            </span>
          </div>

          <ArticleGrid
            v-if="displayedArticles.length"
            :filteredArticles="displayedArticles"
            :saved-handles="savedArticleHandles"
            :stack-count="stackCardCount"
            sticky-stack
            @toggle-saved="toggleSavedArticle"
          />

          <button
            v-if="remainingArticlesCount"
            class="mm-home__load-more"
            type="button"
            @click="showMoreArticles"
          >
            <v-icon icon="mdi-chevron-down" size="18" />
            {{ discoveryText.showMore }} {{ nextBatchCount }} {{ discoveryText.articlesUnit }}
          </button>

          <router-link class="mm-home__cta" to="/blog">
            <v-icon icon="mdi-arrow-top-right-bold-box-outline" size="20" />
            {{ uiText.showAll }}
          </router-link>
        </section>

        <aside class="mm-home__donation-wrap">
          <DonationSection compact />
          <div class="related-post related-post--sidebar">
            <RelatedPostsComponent :all-articles="articles" :limit="6" />
          </div>
        </aside>
      </div>

      <v-dialog v-model="discoveryOpen" class="mm-home-discovery-dialog" max-width="680" scrollable>
        <section class="mm-home-discovery" aria-labelledby="mm-home-discovery-title">
          <header class="mm-home-discovery__header">
            <div>
              <span class="mm-home-discovery__eyebrow">{{ discoveryText.articleDiscovery }}</span>
              <h2 id="mm-home-discovery-title">{{ discoveryText.modalTitle }}</h2>
            </div>
            <button
              class="mm-home-discovery__close"
              type="button"
              :aria-label="discoveryText.close"
              @click="discoveryOpen = false"
            >
              <v-icon icon="mdi-close" size="20" />
            </button>
          </header>

          <nav class="mm-home-discovery__tabs" :aria-label="discoveryText.articleDiscovery">
            <button
              :class="{ 'is-active': discoveryPanel === 'search' }"
              type="button"
              @click="selectDiscoveryPanel('search')"
            >
              <v-icon icon="mdi-magnify" size="17" />
              {{ discoveryText.tabSearch }}
            </button>
            <button
              :class="{ 'is-active': discoveryPanel === 'topics' }"
              type="button"
              @click="selectDiscoveryPanel('topics')"
            >
              <v-icon icon="mdi-tag-multiple-outline" size="17" />
              {{ discoveryText.tabTopics }}
            </button>
            <button
              :class="{ 'is-active': discoveryPanel === 'library' }"
              type="button"
              @click="selectDiscoveryPanel('library')"
            >
              <v-icon icon="mdi-bookmark-outline" size="17" />
              {{ discoveryText.tabLibrary }}
              <span>{{ availableSavedCount }}</span>
            </button>
          </nav>

          <div v-if="discoveryPanel === 'search'" class="mm-home-discovery__body">
            <ArticleFilters
              :searchQuery="searchQuery"
              :sortBy="sortBy"
              @update:searchQuery="searchQuery = $event"
              @update:sortBy="sortBy = $event"
            />
            <div class="mm-home-discovery__quick-actions">
              <router-link
                v-if="latestArticle?.handle"
                :to="{ name: 'article', params: { slug: latestArticle.handle } }"
                @click="discoveryOpen = false"
              >
                <v-icon icon="mdi-newspaper-variant-outline" size="18" />
                {{ discoveryText.latestArticle }}
              </router-link>
              <button type="button" :disabled="!latestArticle?.handle" @click="goToSurpriseArticle">
                <v-icon icon="mdi-shuffle-variant" size="18" />
                {{ discoveryText.surpriseMe }}
              </button>
            </div>
            <button class="mm-home-discovery__reset" type="button" @click="resetDiscoveryFilters">
              {{ discoveryText.resetFilters }}
            </button>
          </div>

          <div v-else-if="discoveryPanel === 'topics'" class="mm-home-discovery__body">
            <p class="mm-home-discovery__description">{{ discoveryText.topicsDescription }}</p>
            <div class="mm-home__topic-list" :aria-label="discoveryText.topicFilter">
              <button
                v-for="topic in topTags"
                :key="topic.label"
                class="mm-home__topic-chip"
                :class="{
                  'mm-home__topic-chip--active':
                    selectedTopic === topic.label && activeHomeTab === 'topics',
                }"
                type="button"
                :aria-pressed="selectedTopic === topic.label && activeHomeTab === 'topics'"
                @click="selectDiscoveryTopic(topic.label)"
              >
                {{ topic.label }}
                <strong>{{ topic.count }}</strong>
              </button>
            </div>
            <HomeFeaturedArticleComponent
              :article="featuredArticle"
              :topic="featuredTopic"
              :reading-minutes="featuredReadingMinutes"
            />
          </div>

          <div v-else class="mm-home-discovery__body mm-home-discovery__library">
            <router-link
              v-if="continueArticle"
              class="mm-home__library-resume"
              :to="{ name: 'article', params: { slug: continueArticle.handle } }"
              @click="discoveryOpen = false"
            >
              <v-icon icon="mdi-bookmark-play-outline" size="20" />
              <span>{{ discoveryText.continueReading }}</span>
              <strong>{{ continueArticle.title }}</strong>
              <v-icon icon="mdi-arrow-right" size="18" />
            </router-link>
            <div v-else class="mm-home-discovery__empty">
              <v-icon icon="mdi-bookmark-outline" size="24" />
              <span>{{ discoveryText.noContinueReading }}</span>
            </div>
            <div class="mm-home-discovery__saved-summary">
              <span>
                <v-icon icon="mdi-bookmark-multiple-outline" size="19" />
                {{ discoveryText.savedArticles }}
              </span>
              <strong>{{ availableSavedCount }}</strong>
            </div>
            <button
              class="mm-home-discovery__apply"
              type="button"
              :disabled="!availableSavedCount"
              @click="applySavedFilter"
            >
              {{ discoveryText.showSaved }}
              <v-icon icon="mdi-arrow-right" size="18" />
            </button>
          </div>
        </section>
      </v-dialog>
    </div>
  </DefaultLayout>
</template>
