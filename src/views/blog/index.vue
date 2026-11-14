<script setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useHead } from '@vueuse/head'
  import { getBlogArticles } from '@/services/shopifyApi'
  import ArticleCard from '@/components/article/ArticleCardComponent.vue'
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import ArticleCardsSkeleton from '@/components/skeleton/ArticleCardsSkeleton.vue'
  import BlogSidebarSkeleton from '@/components/skeleton/BlogSidebarSkeleton.vue'
  import blogPageText from '@/data/blog-page.json'
  import { buildCanonicalUrl } from '@/utils/canonical'
  import {
    generateBlogIndexJsonLd,
    generateCollectionPageJsonLd,
    generateItemListJsonLd,
    generateOrganizationJsonLd,
    generateWebSiteJsonLd,
  } from '@/utils/jsonld'
  import { useJsonLd } from '@/composables/useJsonLd'
  import { ANALYTICS_EVENTS, ANALYTICS_PARAMS } from '@/analytics/events'
  import { trackEvent } from '@/firebase'
  import { useFollowedTopics } from '@/composables/useFollowedTopics'
  import { useSavedArticles } from '@/composables/useSavedArticles'
  import { estimateReadingMinutes, getLastReadArticle } from '@/utils/homeReadingState'
  import { BLOG_READING_HISTORY_KEY, getReadArticleHandles } from '@/utils/blogReadingHistory'
  import {
    deleteBlogFilterPreset,
    getBlogFilterPresets,
    saveBlogFilterPreset,
  } from '@/utils/blogFilterPresets'
  import {
    BLOG_FILTER_QUERY_KEYS,
    filterBlogArticles,
    getBlogTopicStats,
    getPersonalizedTopics,
    getRelatedTopics,
    normalizeTopic,
    parseBlogQuery,
    serializeBlogQuery,
  } from '@/utils/blogTopicDiscovery'

  const PAGE_SIZE = 9

  const route = useRoute()
  const router = useRouter()
  const initialQuery = parseBlogQuery(route.query)
  const articles = ref([])
  const loading = ref(true)
  const searchQuery = ref(initialQuery.searchQuery)
  const selectedTopics = ref(initialQuery.selectedTopics)
  const topicMatchMode = ref(initialQuery.topicMatchMode)
  const multiTopicEnabled = ref(initialQuery.multiTopicEnabled)
  const sortBy = ref(initialQuery.sortBy)
  const currentPage = ref(initialQuery.currentPage)
  const periodDays = ref(initialQuery.recentDays)
  const authorFilter = ref(initialQuery.author)
  const readingTimeFilter = ref(initialQuery.readingTime)
  const onlySaved = ref(false)
  const readState = ref('all')
  const readArticleHandles = ref([])
  const mobileFiltersOpen = ref(false)
  const isFilterSheet = ref(false)
  const filterToggleRef = ref(null)
  const filterSidebarRef = ref(null)
  const topicExplorerOpen = ref(false)
  const topicExplorerTab = ref('all')
  const topicSearch = ref('')
  const topicOrder = ref('popular')
  const showAllSidebarTopics = ref(false)
  const lastReadHandle = ref('')
  const filterPresets = ref([])
  const presetName = ref('')
  const selectedPresetId = ref('')
  const filterFeedback = ref('')
  let searchTrackTimeout = null
  let resetFeedbackTimeout = null
  let previousBodyOverflow = ''
  let filterMediaQuery = null
  let isActive = true
  const { savedArticleHandles } = useSavedArticles()
  const { followedTopics, isFollowedTopic, toggleFollowedTopic } = useFollowedTopics()
  let applyingRouteState = false
  let routeUpdateMode = 'replace'

  const sortOptions = [
    { value: 'date_desc', label: 'Спочатку новіші' },
    { value: 'date_asc', label: 'Спочатку старіші' },
    { value: 'title_asc', label: 'Назва: А-Я' },
    { value: 'title_desc', label: 'Назва: Я-А' },
  ]

  const canonicalBlogUrl = buildCanonicalUrl('/blog')

  useHead({
    title: 'Блог статей про Frontend, Vue та eCommerce | Mud Tech Blog',
    meta: [
      {
        name: 'description',
        content:
          'У розділі блогу зібрані практичні статті про frontend, Vue, Shopify, eCommerce архітектуру та оптимізацію продуктивності. Читай покрокові матеріали з реальними прикладами впровадження.',
      },
    ],
    link: [{ rel: 'canonical', href: canonicalBlogUrl }],
  })

  onMounted(async () => {
    lastReadHandle.value = getLastReadArticle()
    readArticleHandles.value = getReadArticleHandles()
    filterPresets.value = getBlogFilterPresets()
    const fetchedArticles = await getBlogArticles()
    if (!isActive) return
    articles.value = fetchedArticles.map(article => ({
      ...article,
      readingMinutes: estimateReadingMinutes(article.contentHtml),
    }))
    loading.value = false

    filterMediaQuery = window.matchMedia('(max-width: 959px)')
    isFilterSheet.value = filterMediaQuery.matches
    filterMediaQuery.addEventListener('change', handleFilterBreakpoint)
    window.addEventListener('storage', handleBlogStorageChange)

    updateJsonLdSchemas()
  })

  const updateJsonLdSchemas = () => {
    const listItems = articles.value.slice(0, 20).map(item => ({
      name: item.title,
      url: `/blog/${item.handle}`,
    }))

    useJsonLd([
      generateOrganizationJsonLd(),
      generateWebSiteJsonLd(),
      generateBlogIndexJsonLd(),
      generateCollectionPageJsonLd({
        path: '/blog',
        name: 'Каталог статей Mud Tech Blog',
        description:
          'Список статей про frontend, Vue, AI та eCommerce з практичними технічними прикладами.',
      }),
      generateItemListJsonLd({
        path: '/blog',
        items: listItems,
      }),
    ])
  }

  const tagStats = computed(() => getBlogTopicStats(articles.value))
  const mobileHeroOpen = ref(false)
  const heroDetailsOpen = computed(() => !isFilterSheet.value || mobileHeroOpen.value)
  const formatUkCount = (count, forms) => {
    const lastTwoDigits = count % 100
    const lastDigit = count % 10
    const formIndex =
      lastTwoDigits >= 11 && lastTwoDigits <= 14
        ? 2
        : lastDigit === 1
          ? 0
          : lastDigit >= 2 && lastDigit <= 4
            ? 1
            : 2

    return `${count} ${forms[formIndex]}`
  }
  const mobileHeroSummary = computed(() => {
    if (loading.value) return blogPageText.hero.overviewLoading

    return [
      formatUkCount(articles.value.length, blogPageText.hero.overviewArticleForms),
      formatUkCount(tagStats.value.length, blogPageText.hero.overviewTopicForms),
    ].join(' · ')
  })
  const handleHeroDetailsToggle = event => {
    if (isFilterSheet.value) mobileHeroOpen.value = event.currentTarget.open
  }
  const authorStats = computed(() => {
    const counts = new Map()
    articles.value.forEach(article => {
      const name = String(article.authorV2?.name || '').trim()
      if (name) counts.set(name, (counts.get(name) || 0) + 1)
    })
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
  })
  const sortedSidebarTopics = computed(() => {
    const topics = [...tagStats.value]
    if (topicOrder.value === 'trending') {
      return topics.sort((a, b) => b.trendDelta - a.trendDelta || b.count - a.count)
    }
    if (topicOrder.value === 'alphabetical') {
      return topics.sort((a, b) => a.label.localeCompare(b.label, 'uk'))
    }
    return topics.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'uk'))
  })
  const visibleSidebarTopics = computed(() =>
    showAllSidebarTopics.value ? sortedSidebarTopics.value : sortedSidebarTopics.value.slice(0, 7)
  )
  const hasMoreSidebarTopics = computed(() => sortedSidebarTopics.value.length > 7)
  const filteredArticles = computed(() =>
    filterBlogArticles(articles.value, {
      searchQuery: searchQuery.value,
      selectedTopics: selectedTopics.value,
      topicMatchMode: topicMatchMode.value,
      sortBy: sortBy.value,
      recentDays: periodDays.value,
      author: authorFilter.value,
      readingTime: readingTimeFilter.value,
      onlySaved: onlySaved.value,
      savedHandles: savedArticleHandles.value,
      readState: readState.value,
      readHandles: readArticleHandles.value,
    })
  )
  const recentArticleCount = computed(
    () => filterBlogArticles(articles.value, { recentDays: 30 }).length
  )

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredArticles.value.length / PAGE_SIZE))
  )
  const paginatedArticles = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredArticles.value.slice(start, start + PAGE_SIZE)
  })

  const topTagsPreview = computed(() => {
    const topTags = tagStats.value.slice(0, 4)
    const selectedStats = selectedTopics.value
      .map(topic => tagStats.value.find(item => item.key === normalizeTopic(topic)))
      .filter(Boolean)
    const merged = [...selectedStats, ...topTags]
    return [...new Map(merged.map(item => [item.key, item])).values()].slice(0, 4)
  })
  const topTagMaxCount = computed(() =>
    Math.max(1, ...topTagsPreview.value.map(item => item.count))
  )
  const topicShareStyle = count => ({
    '--topic-share': `${Math.max(12, Math.round((count / topTagMaxCount.value) * 100))}%`,
  })
  const lastPublishedDate = computed(() => {
    if (!articles.value.length) return '-'
    return new Date(articles.value[0].publishedAt).toLocaleDateString('uk-UA')
  })

  const personalizedTopics = computed(() =>
    getPersonalizedTopics(
      articles.value,
      savedArticleHandles.value,
      lastReadHandle.value,
      tagStats.value
    )
  )
  const explorerTopics = computed(() => {
    let topics = tagStats.value
    if (topicExplorerTab.value === 'for-you') topics = personalizedTopics.value
    if (topicExplorerTab.value === 'followed') {
      topics = tagStats.value.filter(topic => isFollowedTopic(topic.label))
    }

    const query = normalizeTopic(topicSearch.value)
    return query ? topics.filter(topic => normalizeTopic(topic.label).includes(query)) : topics
  })
  const relatedTopics = computed(() => getRelatedTopics(articles.value, selectedTopics.value))
  const hasSelectedTopics = computed(() => selectedTopics.value.length > 0)
  const activeFilterChips = computed(() => {
    const chips = []
    if (searchQuery.value.trim())
      chips.push({
        key: 'search',
        label: `${blogPageText.sidebar.search}: ${searchQuery.value.trim()}`,
      })
    selectedTopics.value.forEach(topic => chips.push({ key: `topic:${topic}`, label: topic }))
    if (authorFilter.value)
      chips.push({ key: 'author', label: `${blogPageText.sidebar.author}: ${authorFilter.value}` })
    if (periodDays.value)
      chips.push({
        key: 'period',
        label: `${blogPageText.sidebar.period}: ${periodDays.value} ${blogPageText.sidebar.days}`,
      })
    if (readingTimeFilter.value !== 'all')
      chips.push({
        key: 'readingTime',
        label: blogPageText.sidebar.readingTimes[readingTimeFilter.value],
      })
    if (onlySaved.value) chips.push({ key: 'saved', label: blogPageText.sidebar.savedOnly })
    if (readState.value !== 'all')
      chips.push({ key: 'readState', label: blogPageText.sidebar.readStates[readState.value] })
    return chips
  })
  const activeFilterCount = computed(() => activeFilterChips.value.length)

  const isTopicSelected = topic =>
    selectedTopics.value.some(selected => normalizeTopic(selected) === normalizeTopic(topic))

  const setSelectedTopics = topics => {
    selectedTopics.value = [...new Set(topics.map(topic => String(topic).trim()).filter(Boolean))]
  }

  const showFilterFeedback = message => {
    filterFeedback.value = message
    if (resetFeedbackTimeout) clearTimeout(resetFeedbackTimeout)
    resetFeedbackTimeout = setTimeout(() => (filterFeedback.value = ''), 1400)
  }

  const filterSnapshot = () => ({
    searchQuery: searchQuery.value,
    selectedTopics: [...selectedTopics.value],
    topicMatchMode: topicMatchMode.value,
    multiTopicEnabled: multiTopicEnabled.value,
    sortBy: sortBy.value,
    currentPage: 1,
    recentDays: periodDays.value,
    author: authorFilter.value,
    readingTime: readingTimeFilter.value,
    onlySaved: onlySaved.value,
    readState: readState.value,
  })

  const applyFilterSnapshot = state => {
    const parsed = parseBlogQuery({
      q: state.searchQuery,
      topics: Array.isArray(state.selectedTopics) ? state.selectedTopics.join(',') : '',
      match: state.topicMatchMode,
      multi: state.multiTopicEnabled ? '1' : '0',
      sort: state.sortBy,
      page: '1',
      recent: state.recentDays === 30 ? '30' : undefined,
      period: state.recentDays === 30 ? undefined : String(state.recentDays || ''),
      author: state.author,
      readtime: state.readingTime,
    })
    routeUpdateMode = 'push'
    searchQuery.value = parsed.searchQuery
    setSelectedTopics(parsed.selectedTopics)
    topicMatchMode.value = parsed.topicMatchMode
    multiTopicEnabled.value = parsed.multiTopicEnabled
    sortBy.value = parsed.sortBy
    currentPage.value = 1
    periodDays.value = parsed.recentDays
    authorFilter.value = parsed.author
    readingTimeFilter.value = parsed.readingTime
    onlySaved.value = state.onlySaved === true
    readState.value = ['read', 'unread'].includes(state.readState) ? state.readState : 'all'
  }

  const saveCurrentPreset = () => {
    const result = saveBlogFilterPreset(presetName.value, filterSnapshot())
    if (!result.saved) return
    filterPresets.value = result.presets
    selectedPresetId.value = result.presets[0]?.id || ''
    presetName.value = ''
    showFilterFeedback(blogPageText.sidebar.presetSaved)
  }

  const applySelectedPreset = () => {
    const preset = filterPresets.value.find(item => item.id === selectedPresetId.value)
    if (preset) applyFilterSnapshot(preset.state)
  }

  const removeSelectedPreset = () => {
    if (!selectedPresetId.value) return
    const result = deleteBlogFilterPreset(selectedPresetId.value)
    filterPresets.value = result.presets
    selectedPresetId.value = ''
  }

  const clearOneFilter = key => {
    routeUpdateMode = 'push'
    if (key === 'search') searchQuery.value = ''
    else if (key.startsWith('topic:')) {
      const topic = key.slice(6)
      setSelectedTopics(selectedTopics.value.filter(item => item !== topic))
    } else if (key === 'author') authorFilter.value = ''
    else if (key === 'period') periodDays.value = 0
    else if (key === 'readingTime') readingTimeFilter.value = 'all'
    else if (key === 'saved') onlySaved.value = false
    else if (key === 'readState') readState.value = 'all'
    currentPage.value = 1
  }

  const selectTag = tag => {
    routeUpdateMode = 'push'
    if (tag === 'all') {
      setSelectedTopics([])
    } else if (multiTopicEnabled.value) {
      setSelectedTopics(
        isTopicSelected(tag)
          ? selectedTopics.value.filter(item => normalizeTopic(item) !== normalizeTopic(tag))
          : [...selectedTopics.value, tag]
      )
    } else {
      setSelectedTopics([tag])
    }

    currentPage.value = 1
    trackEvent(ANALYTICS_EVENTS.FILTER_CHANGED, {
      [ANALYTICS_PARAMS.ROUTE]: '/blog',
      [ANALYTICS_PARAMS.FILTER_TYPE]: 'tag',
      [ANALYTICS_PARAMS.FILTER_VALUE]: selectedTopics.value.join('|') || 'all',
      [ANALYTICS_PARAMS.RESULTS_COUNT]: filteredArticles.value.length,
    })
  }

  const trackArticleOpen = event => {
    const link = event.target?.closest?.('.mm-article2__link')
    if (!link) return

    const handle = link.getAttribute('href')?.split('?')[0].split('/').filter(Boolean).at(-1)
    if (!handle) return

    trackEvent(ANALYTICS_EVENTS.BLOG_TOPIC_ARTICLE_OPEN, {
      [ANALYTICS_PARAMS.ROUTE]: '/blog',
      [ANALYTICS_PARAMS.ARTICLE_HANDLE]: handle,
      [ANALYTICS_PARAMS.TOPIC_LIST]: selectedTopics.value.join('|') || 'all',
      [ANALYTICS_PARAMS.RESULTS_COUNT]: filteredArticles.value.length,
    })
  }

  const toggleMultiTopic = () => {
    routeUpdateMode = 'push'
    multiTopicEnabled.value = !multiTopicEnabled.value
    if (!multiTopicEnabled.value && selectedTopics.value.length > 1) {
      setSelectedTopics(selectedTopics.value.slice(0, 1))
    }
    currentPage.value = 1
  }

  const setTopicMatchMode = mode => {
    routeUpdateMode = 'push'
    topicMatchMode.value = mode
    currentPage.value = 1
  }

  const toggleRecentFilter = () => {
    setPublicationPeriod(periodDays.value === 30 ? 0 : 30)
  }

  const setPublicationPeriod = value => {
    routeUpdateMode = 'push'
    periodDays.value = [0, 7, 30, 90, 365].includes(Number(value)) ? Number(value) : 0
    currentPage.value = 1
  }

  const setAuthorFilter = value => {
    routeUpdateMode = 'push'
    authorFilter.value = value
    currentPage.value = 1
  }

  const setReadingTimeFilter = value => {
    routeUpdateMode = 'push'
    readingTimeFilter.value = value
    currentPage.value = 1
  }

  const setOnlySaved = value => {
    onlySaved.value = value
    currentPage.value = 1
  }

  const setReadState = value => {
    readState.value = value
    currentPage.value = 1
  }

  const widenFilters = () => {
    routeUpdateMode = 'push'
    searchQuery.value = ''
    authorFilter.value = ''
    periodDays.value = 0
    readingTimeFilter.value = 'all'
    onlySaved.value = false
    readState.value = 'all'
    currentPage.value = 1
  }

  const unlockFilterSheet = () => {
    document.body.style.overflow = previousBodyOverflow
    document.removeEventListener('keydown', handleFilterSheetKeydown)
  }

  const openMobileFilters = async () => {
    mobileFiltersOpen.value = true
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleFilterSheetKeydown)
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 250))
    filterSidebarRef.value
      ?.querySelector('.mm-blog__sidebar-head button')
      ?.focus({ preventScroll: true })
  }

  const closeMobileFilters = (restoreFocus = true) => {
    const wasOpen = mobileFiltersOpen.value
    mobileFiltersOpen.value = false
    if (wasOpen) unlockFilterSheet()
    if (wasOpen && restoreFocus) nextTick(() => filterToggleRef.value?.focus())
  }

  const toggleMobileFilters = () =>
    mobileFiltersOpen.value ? closeMobileFilters() : openMobileFilters()

  const handleFilterSheetKeydown = event => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMobileFilters()
      return
    }
    if (event.key !== 'Tab' || !filterSidebarRef.value) return
    const focusable = [
      ...filterSidebarRef.value.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]'
      ),
    ].filter(element => element.offsetParent !== null)
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const handleFilterBreakpoint = event => {
    isFilterSheet.value = event.matches
    if (!event.matches && mobileFiltersOpen.value) closeMobileFilters(false)
  }

  const handleBlogStorageChange = event => {
    if (event.key === BLOG_READING_HISTORY_KEY || event.key === null) {
      readArticleHandles.value = getReadArticleHandles()
    }
  }

  const openTopicExplorer = tab => {
    topicExplorerTab.value = tab || 'all'
    topicSearch.value = ''
    topicExplorerOpen.value = true
  }

  const hydrateFromRoute = query => {
    applyingRouteState = true
    const parsed = parseBlogQuery(query)
    searchQuery.value = parsed.searchQuery
    setSelectedTopics(parsed.selectedTopics)
    topicMatchMode.value = parsed.topicMatchMode
    multiTopicEnabled.value = parsed.multiTopicEnabled
    sortBy.value = parsed.sortBy
    currentPage.value = parsed.currentPage
    periodDays.value = parsed.recentDays
    authorFilter.value = parsed.author
    readingTimeFilter.value = parsed.readingTime
    nextTick(() => {
      applyingRouteState = false
    })
  }

  watch(
    () => route.query,
    query => hydrateFromRoute(query),
    { deep: true }
  )

  watch(
    [
      searchQuery,
      selectedTopics,
      topicMatchMode,
      multiTopicEnabled,
      sortBy,
      currentPage,
      periodDays,
      authorFilter,
      readingTimeFilter,
    ],
    () => {
      if (route.name !== 'blog') return
      const nextQuery = { ...route.query }
      BLOG_FILTER_QUERY_KEYS.forEach(key => delete nextQuery[key])
      Object.assign(
        nextQuery,
        serializeBlogQuery({
          searchQuery: searchQuery.value,
          selectedTopics: selectedTopics.value,
          topicMatchMode: topicMatchMode.value,
          multiTopicEnabled: multiTopicEnabled.value,
          sortBy: sortBy.value,
          currentPage: currentPage.value,
          recentDays: periodDays.value,
          author: authorFilter.value,
          readingTime: readingTimeFilter.value,
        })
      )

      const current = JSON.stringify(route.query)
      const next = JSON.stringify(nextQuery)
      if (current !== next) {
        const method = routeUpdateMode
        routeUpdateMode = 'replace'
        router[method]({ name: 'blog', query: nextQuery })
      } else {
        routeUpdateMode = 'replace'
      }
    },
    { deep: true }
  )

  const clearFilters = () => {
    routeUpdateMode = 'push'
    searchQuery.value = ''
    setSelectedTopics([])
    multiTopicEnabled.value = false
    topicMatchMode.value = 'or'
    sortBy.value = 'date_desc'
    currentPage.value = 1
    periodDays.value = 0
    authorFilter.value = ''
    readingTimeFilter.value = 'all'
    onlySaved.value = false
    readState.value = 'all'
    closeMobileFilters()
    presetName.value = ''
    selectedPresetId.value = ''
    showAllSidebarTopics.value = false
    showFilterFeedback(blogPageText.sidebar.filtersReset)
    trackEvent(ANALYTICS_EVENTS.FILTER_CHANGED, {
      [ANALYTICS_PARAMS.ROUTE]: '/blog',
      [ANALYTICS_PARAMS.FILTER_TYPE]: 'reset',
      [ANALYTICS_PARAMS.FILTER_VALUE]: 'all',
      [ANALYTICS_PARAMS.RESULTS_COUNT]: filteredArticles.value.length,
    })
  }

  const setSortBy = value => {
    routeUpdateMode = 'push'
    sortBy.value = value
  }

  const setCurrentPage = page => {
    routeUpdateMode = 'push'
    currentPage.value = page
  }

  watch(totalPages, pageCount => {
    if (currentPage.value > pageCount) currentPage.value = pageCount
  })

  watch(sortBy, value => {
    if (applyingRouteState) return
    currentPage.value = 1
    trackEvent(ANALYTICS_EVENTS.FILTER_CHANGED, {
      [ANALYTICS_PARAMS.ROUTE]: '/blog',
      [ANALYTICS_PARAMS.FILTER_TYPE]: 'sort',
      [ANALYTICS_PARAMS.FILTER_VALUE]: value,
      [ANALYTICS_PARAMS.RESULTS_COUNT]: filteredArticles.value.length,
    })
  })

  watch(searchQuery, value => {
    if (applyingRouteState) return
    currentPage.value = 1
    if (searchTrackTimeout) clearTimeout(searchTrackTimeout)
    searchTrackTimeout = setTimeout(() => {
      trackEvent(ANALYTICS_EVENTS.SEARCH_USED, {
        [ANALYTICS_PARAMS.ROUTE]: '/blog',
        [ANALYTICS_PARAMS.SEARCH_QUERY_LENGTH]: String(value || '').trim().length,
        [ANALYTICS_PARAMS.RESULTS_COUNT]: filteredArticles.value.length,
      })
    }, 450)
  })

  onBeforeUnmount(() => {
    isActive = false
    if (searchTrackTimeout) clearTimeout(searchTrackTimeout)
    if (resetFeedbackTimeout) clearTimeout(resetFeedbackTimeout)
    if (filterMediaQuery) filterMediaQuery.removeEventListener('change', handleFilterBreakpoint)
    window.removeEventListener('storage', handleBlogStorageChange)
    if (mobileFiltersOpen.value) unlockFilterSheet()
  })

  watch(
    () => articles.value,
    () => {
      if (!loading.value) updateJsonLdSchemas()
    }
  )
</script>

<template>
  <DefaultLayout>
    <section class="mm-blog">
      <header
        class="mm-blog__hero"
        :aria-hidden="isFilterSheet && mobileFiltersOpen ? 'true' : undefined"
        :inert="isFilterSheet && mobileFiltersOpen ? true : undefined"
      >
        <div class="mm-blog__hero-main">
          <div class="mm-blog__hero-copy">
            <div class="mm-blog__eyebrow">
              <span aria-hidden="true" />
              {{ blogPageText.hero.eyebrow }}
            </div>
            <h1>
              <v-icon icon="mdi-post-outline" size="24" aria-hidden="true" />
              {{ blogPageText.hero.title }}
            </h1>
            <p class="mm-blog__hero-subtitle">{{ blogPageText.hero.subtitle }}</p>
          </div>

          <button
            ref="filterToggleRef"
            class="mm-blog__filter-toggle"
            type="button"
            :aria-expanded="mobileFiltersOpen"
            aria-controls="mm-blog-sidebar"
            :aria-label="
              mobileFiltersOpen
                ? blogPageText.hero.filterButtonClose
                : blogPageText.hero.filterButtonOpen
            "
            @click="toggleMobileFilters"
          >
            <v-icon icon="mdi-tune-variant" size="18" aria-hidden="true" />
            {{ blogPageText.hero.filterButton }}
            <span v-if="activeFilterCount" class="mm-blog__filter-count">
              {{ activeFilterCount }}
            </span>
          </button>
        </div>

        <details
          class="mm-blog__hero-details"
          :open="heroDetailsOpen"
          @toggle="handleHeroDetailsToggle"
        >
          <summary class="mm-blog__hero-disclosure" aria-controls="mm-blog-hero-overview">
            <span class="mm-blog__hero-disclosure-label">
              <v-icon icon="mdi-chart-box-outline" size="17" aria-hidden="true" />
              {{ blogPageText.hero.mobileOverview }}
            </span>
            <span class="mm-blog__hero-disclosure-summary">{{ mobileHeroSummary }}</span>
            <v-icon
              class="mm-blog__hero-disclosure-chevron"
              icon="mdi-chevron-down"
              size="18"
              aria-hidden="true"
            />
          </summary>

          <div id="mm-blog-hero-overview" class="mm-blog__hero-details-content">
            <div class="mm-blog__stats" role="group" :aria-label="blogPageText.hero.statsLabel">
              <div class="mm-blog-stat">
                <v-icon icon="mdi-bookshelf" size="16" aria-hidden="true" />
                <span>{{ blogPageText.hero.totalArticles }}</span>
                <strong>{{ loading ? '—' : articles.length }}</strong>
              </div>
              <div class="mm-blog-stat mm-blog-stat--results" aria-live="polite">
                <v-icon icon="mdi-view-grid-outline" size="16" aria-hidden="true" />
                <span>{{ blogPageText.hero.results }}</span>
                <Transition name="mm-count" mode="out-in">
                  <strong :key="filteredArticles.length">
                    {{ loading ? '—' : filteredArticles.length }}
                  </strong>
                </Transition>
              </div>
              <button
                class="mm-blog-stat mm-blog-stat--button"
                :class="{ 'mm-blog-stat--active': periodDays === 30 }"
                type="button"
                :aria-pressed="periodDays === 30"
                :title="
                  periodDays === 30
                    ? blogPageText.hero.recentFilterActive
                    : blogPageText.hero.newIn30Days
                "
                @click="toggleRecentFilter"
              >
                <v-icon icon="mdi-calendar-arrow-right" size="16" aria-hidden="true" />
                <span>{{ blogPageText.hero.newIn30Days }}</span>
                <strong>{{ loading ? '—' : recentArticleCount }}</strong>
              </button>
              <div class="mm-blog-stat">
                <v-icon icon="mdi-tag-multiple-outline" size="16" aria-hidden="true" />
                <span>{{ blogPageText.hero.topics }}</span>
                <strong>{{ loading ? '—' : tagStats.length }}</strong>
              </div>
              <div class="mm-blog-stat mm-blog-stat--latest">
                <v-icon icon="mdi-calendar-month-outline" size="16" aria-hidden="true" />
                <span>{{ blogPageText.hero.latest }}</span>
                <strong>{{ loading ? '—' : lastPublishedDate }}</strong>
              </div>
            </div>

            <div class="mm-blog__topics">
              <div class="mm-blog__topics-label">
                <v-icon icon="mdi-chart-donut-variant" size="16" aria-hidden="true" />
                <span>{{ blogPageText.hero.popularTopics }}</span>
                <button
                  class="mm-blog__explore-topics"
                  type="button"
                  :disabled="loading"
                  @click="openTopicExplorer('all')"
                >
                  {{ blogPageText.hero.exploreTopics }}
                  <v-icon icon="mdi-arrow-top-right" size="14" aria-hidden="true" />
                </button>
              </div>

              <div
                class="mm-blog__top-tags"
                role="group"
                :aria-label="blogPageText.hero.topicFiltersLabel"
              >
                <button
                  class="mm-blog-topic"
                  :class="{ 'mm-blog-topic--active': !hasSelectedTopics }"
                  type="button"
                  :disabled="loading"
                  :aria-pressed="!hasSelectedTopics"
                  @click="selectTag('all')"
                >
                  <span>{{ blogPageText.hero.allTopics }}</span>
                  <strong>{{ loading ? '—' : articles.length }}</strong>
                </button>

                <button
                  v-for="item in topTagsPreview"
                  :key="item.label"
                  class="mm-blog-topic"
                  :class="{ 'mm-blog-topic--active': isTopicSelected(item.label) }"
                  type="button"
                  :disabled="loading"
                  :aria-pressed="isTopicSelected(item.label)"
                  @click="selectTag(item.label)"
                >
                  <span>{{ item.label }}</span>
                  <strong>{{ item.count }}</strong>
                  <v-icon
                    v-if="item.trendDelta > 0"
                    icon="mdi-trending-up"
                    size="13"
                    :title="blogPageText.hero.trending"
                    :aria-label="blogPageText.hero.trending"
                  />
                  <span class="mm-blog-topic__bar" aria-hidden="true">
                    <i :style="topicShareStyle(item.count)" />
                  </span>
                </button>

                <span v-if="loading" class="mm-blog__topics-loading">
                  {{ blogPageText.hero.loadingTopics }}
                </span>
              </div>
            </div>
          </div>
        </details>
      </header>

      <div class="mm-blog__layout">
        <section
          class="mm-blog__surface"
          :aria-hidden="isFilterSheet && mobileFiltersOpen ? 'true' : undefined"
          :inert="isFilterSheet && mobileFiltersOpen ? true : undefined"
        >
          <div class="mm-blog__controls">
            <label class="mm-blog-control mm-blog-control--search">
              <v-icon icon="mdi-magnify" size="18" />
              <input
                v-model="searchQuery"
                type="text"
                :aria-label="blogPageText.hero.searchPlaceholder"
                :placeholder="blogPageText.hero.searchPlaceholder"
              />
            </label>

            <label class="mm-blog-control mm-blog-control--sort">
              <v-icon icon="mdi-sort" size="18" />
              <select :value="sortBy" @change="setSortBy($event.target.value)">
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>

          <div class="mm-blog__state mm-blog__state--skeleton" v-if="loading">
            <ArticleCardsSkeleton :count="6" />
          </div>

          <div class="mm-blog__state mm-blog__state--empty" v-else-if="!filteredArticles.length">
            <v-icon icon="mdi-file-search-outline" size="22" />
            <span>{{ blogPageText.hero.noResults }}</span>
            <div v-if="relatedTopics.length" class="mm-blog__related-topics">
              <span>{{ blogPageText.hero.relatedTopics }}</span>
              <button
                v-for="topic in relatedTopics"
                :key="topic.key"
                type="button"
                @click="selectTag(topic.label)"
              >
                {{ topic.label }}
                <strong>{{ topic.count }}</strong>
              </button>
            </div>
            <button class="mm-blog__clear-btn" type="button" @click="clearFilters">
              {{ blogPageText.sidebar.reset }}
            </button>
            <button
              v-if="activeFilterCount"
              class="mm-blog__widen-btn"
              type="button"
              @click="widenFilters"
            >
              {{ blogPageText.sidebar.widenFilters }}
            </button>
          </div>

          <div v-else class="mm-blog-grid" @click.capture="trackArticleOpen">
            <ArticleCard
              v-for="article in paginatedArticles"
              :key="article.handle"
              :article="article"
            />
          </div>

          <div
            v-if="
              filteredArticles.length > 0 && filteredArticles.length < 3 && relatedTopics.length
            "
            class="mm-blog__related-topics mm-blog__related-topics--sparse"
          >
            <span>{{ blogPageText.hero.relatedTopics }}</span>
            <button
              v-for="topic in relatedTopics"
              :key="topic.key"
              type="button"
              @click="selectTag(topic.label)"
            >
              {{ topic.label }}
              <strong>{{ topic.count }}</strong>
            </button>
          </div>

          <div class="mm-blog-pagination" v-if="!loading && filteredArticles.length > PAGE_SIZE">
            <button :disabled="currentPage === 1" @click="setCurrentPage(currentPage - 1)">
              <v-icon icon="mdi-chevron-left" />
              Попередні
            </button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button :disabled="currentPage === totalPages" @click="setCurrentPage(currentPage + 1)">
              Наступні
              <v-icon icon="mdi-chevron-right" />
            </button>
          </div>
        </section>

        <aside
          ref="filterSidebarRef"
          id="mm-blog-sidebar"
          class="mm-blog__sidebar"
          :class="{ 'mm-blog__sidebar--open': mobileFiltersOpen }"
          :role="isFilterSheet ? 'dialog' : undefined"
          :aria-modal="isFilterSheet && mobileFiltersOpen ? 'true' : undefined"
          :aria-labelledby="isFilterSheet ? 'mm-blog-sidebar-title' : undefined"
          :aria-hidden="isFilterSheet && !mobileFiltersOpen ? 'true' : undefined"
          :inert="isFilterSheet && !mobileFiltersOpen ? true : undefined"
        >
          <div class="mm-blog__sidebar-head">
            <div>
              <h2 id="mm-blog-sidebar-title">{{ blogPageText.sidebar.title }}</h2>
              <span v-if="activeFilterCount" class="mm-blog__sidebar-active-count">
                {{ blogPageText.sidebar.activeCount }}: {{ activeFilterCount }}
              </span>
            </div>
            <button
              type="button"
              :aria-label="blogPageText.sidebar.close"
              @click="closeMobileFilters"
            >
              <v-icon icon="mdi-close" size="18" aria-hidden="true" />
            </button>
          </div>

          <BlogSidebarSkeleton v-if="loading" />

          <template v-else>
            <section v-if="activeFilterChips.length" class="mm-blog-panel mm-blog-panel--active">
              <div class="mm-blog-panel__head">
                <v-icon icon="mdi-filter-check-outline" size="18" aria-hidden="true" />
                <h3>{{ blogPageText.sidebar.activeFilters }}</h3>
              </div>
              <TransitionGroup name="mm-filter-chip" tag="div" class="mm-blog-filter-chips">
                <button
                  v-for="chip in activeFilterChips"
                  :key="chip.key"
                  type="button"
                  :aria-label="`${blogPageText.sidebar.removeFilter}: ${chip.label}`"
                  @click="clearOneFilter(chip.key)"
                >
                  <span>{{ chip.label }}</span>
                  <v-icon icon="mdi-close" size="14" aria-hidden="true" />
                </button>
              </TransitionGroup>
            </section>

            <section class="mm-blog-panel">
              <div class="mm-blog-panel__head mm-blog-panel__head--split">
                <div>
                  <v-icon icon="mdi-tag-multiple-outline" size="18" aria-hidden="true" />
                  <h3>{{ blogPageText.sidebar.topics }}</h3>
                </div>
                <label class="mm-blog-topic-order">
                  <span class="mm-sr-only">{{ blogPageText.sidebar.topicOrder }}</span>
                  <select v-model="topicOrder" :aria-label="blogPageText.sidebar.topicOrder">
                    <option value="popular">{{ blogPageText.sidebar.popular }}</option>
                    <option value="trending">{{ blogPageText.sidebar.trending }}</option>
                    <option value="alphabetical">{{ blogPageText.sidebar.alphabetical }}</option>
                  </select>
                </label>
              </div>

              <TransitionGroup
                name="mm-topic-list"
                tag="div"
                class="mm-blog-tags mm-blog-tags--compact"
              >
                <button
                  key="all-topics"
                  type="button"
                  class="mm-blog-tag"
                  :class="{ 'mm-blog-tag--active': !hasSelectedTopics }"
                  @click="selectTag('all')"
                >
                  <span>{{ blogPageText.sidebar.allTopics }}</span>
                  <strong>{{ articles.length }}</strong>
                </button>
                <button
                  v-for="item in visibleSidebarTopics"
                  :key="item.key"
                  type="button"
                  class="mm-blog-tag"
                  :class="{ 'mm-blog-tag--active': isTopicSelected(item.label) }"
                  @click="selectTag(item.label)"
                >
                  <span>{{ item.label }}</span>
                  <strong>{{ item.count }}</strong>
                  <v-icon
                    v-if="item.trendDelta > 0"
                    icon="mdi-trending-up"
                    size="15"
                    :aria-label="blogPageText.sidebar.trendHint"
                  />
                </button>
              </TransitionGroup>
              <button
                v-if="hasMoreSidebarTopics"
                class="mm-blog-sidebar-link"
                type="button"
                :aria-expanded="showAllSidebarTopics"
                @click="showAllSidebarTopics = !showAllSidebarTopics"
              >
                {{
                  showAllSidebarTopics
                    ? blogPageText.sidebar.showFewerTopics
                    : blogPageText.sidebar.showMoreTopics
                }}
              </button>
            </section>

            <section class="mm-blog-panel">
              <div class="mm-blog-panel__head">
                <v-icon icon="mdi-tune-variant" size="18" aria-hidden="true" />
                <h3>{{ blogPageText.sidebar.filters }}</h3>
              </div>
              <div class="mm-blog-facets">
                <label class="mm-blog-facet">
                  <span>{{ blogPageText.sidebar.author }}</span>
                  <select :value="authorFilter" @change="setAuthorFilter($event.target.value)">
                    <option value="">{{ blogPageText.sidebar.allAuthors }}</option>
                    <option v-for="author in authorStats" :key="author.name" :value="author.name">
                      {{ author.name }} ({{ author.count }})
                    </option>
                  </select>
                </label>

                <fieldset class="mm-blog-facet">
                  <legend>{{ blogPageText.sidebar.period }}</legend>
                  <div class="mm-blog-segments">
                    <button
                      v-for="days in [0, 7, 30, 90, 365]"
                      :key="days"
                      type="button"
                      :aria-pressed="periodDays === days"
                      :class="{ 'is-active': periodDays === days }"
                      @click="setPublicationPeriod(days)"
                    >
                      {{ days || blogPageText.sidebar.anyPeriod }}
                    </button>
                  </div>
                </fieldset>

                <fieldset class="mm-blog-facet">
                  <legend>{{ blogPageText.sidebar.readingTime }}</legend>
                  <div class="mm-blog-segments mm-blog-segments--wrap">
                    <button
                      type="button"
                      :aria-pressed="readingTimeFilter === 'all'"
                      :class="{ 'is-active': readingTimeFilter === 'all' }"
                      @click="setReadingTimeFilter('all')"
                    >
                      {{ blogPageText.sidebar.anyDuration }}
                    </button>
                    <button
                      v-for="(label, key) in blogPageText.sidebar.readingTimes"
                      :key="key"
                      type="button"
                      :aria-pressed="readingTimeFilter === key"
                      :class="{ 'is-active': readingTimeFilter === key }"
                      @click="setReadingTimeFilter(key)"
                    >
                      {{ label }}
                    </button>
                  </div>
                </fieldset>

                <label class="mm-blog-check">
                  <input
                    type="checkbox"
                    :checked="onlySaved"
                    @change="setOnlySaved($event.target.checked)"
                  />
                  <span>{{ blogPageText.sidebar.savedOnly }}</span>
                  <strong>{{ savedArticleHandles.length }}</strong>
                </label>

                <label class="mm-blog-facet">
                  <span>{{ blogPageText.sidebar.readState }}</span>
                  <select :value="readState" @change="setReadState($event.target.value)">
                    <option value="all">{{ blogPageText.sidebar.allReadStates }}</option>
                    <option value="read">{{ blogPageText.sidebar.readStates.read }}</option>
                    <option value="unread">{{ blogPageText.sidebar.readStates.unread }}</option>
                  </select>
                </label>
              </div>
            </section>

            <section class="mm-blog-panel mm-blog-panel--presets">
              <div class="mm-blog-panel__head">
                <v-icon icon="mdi-bookmark-multiple-outline" size="18" aria-hidden="true" />
                <h3>{{ blogPageText.sidebar.presets }}</h3>
              </div>
              <div class="mm-blog-preset-save">
                <input
                  v-model="presetName"
                  type="text"
                  maxlength="40"
                  :aria-label="blogPageText.sidebar.presetName"
                  :placeholder="blogPageText.sidebar.presetName"
                  @keydown.enter.prevent="saveCurrentPreset"
                />
                <button type="button" :disabled="!presetName.trim()" @click="saveCurrentPreset">
                  <v-icon icon="mdi-plus" size="17" aria-hidden="true" />
                  {{ blogPageText.sidebar.savePreset }}
                </button>
              </div>
              <div v-if="filterPresets.length" class="mm-blog-preset-load">
                <select v-model="selectedPresetId" :aria-label="blogPageText.sidebar.choosePreset">
                  <option value="">{{ blogPageText.sidebar.choosePreset }}</option>
                  <option v-for="preset in filterPresets" :key="preset.id" :value="preset.id">
                    {{ preset.name }}
                  </option>
                </select>
                <button type="button" :disabled="!selectedPresetId" @click="applySelectedPreset">
                  {{ blogPageText.sidebar.applyPreset }}
                </button>
                <button
                  type="button"
                  :disabled="!selectedPresetId"
                  :aria-label="blogPageText.sidebar.deletePreset"
                  @click="removeSelectedPreset"
                >
                  <v-icon icon="mdi-delete-outline" size="17" aria-hidden="true" />
                </button>
              </div>
            </section>
          </template>

          <footer class="mm-blog-sidebar__footer">
            <span :class="{ 'is-feedback': filterFeedback }" aria-live="polite">
              {{
                filterFeedback || `${blogPageText.sidebar.resultsCount}: ${filteredArticles.length}`
              }}
            </span>
            <button type="button" class="mm-blog__clear-btn" @click="clearFilters">
              {{ blogPageText.sidebar.reset }}
            </button>
            <button
              v-if="isFilterSheet"
              type="button"
              class="mm-blog-sidebar__show"
              @click="closeMobileFilters"
            >
              {{ blogPageText.sidebar.showResults }} ({{ filteredArticles.length }})
            </button>
          </footer>
        </aside>
      </div>

      <v-dialog v-model="topicExplorerOpen" class="mm-blog-topic-dialog" max-width="680" scrollable>
        <v-card class="mm-blog-topic-explorer">
          <div class="mm-blog-topic-explorer__inner">
            <header class="mm-blog-topic-explorer__head">
              <div>
                <span>{{ blogPageText.hero.popularTopics }}</span>
                <h2>{{ blogPageText.hero.explorerTitle }}</h2>
              </div>
              <button
                type="button"
                :aria-label="blogPageText.hero.closeExplorer"
                @click="topicExplorerOpen = false"
              >
                <v-icon icon="mdi-close" size="20" aria-hidden="true" />
              </button>
            </header>

            <div class="mm-blog-topic-explorer__tabs" role="tablist">
              <button
                v-for="tab in [
                  { id: 'all', label: blogPageText.hero.allTopicsTab },
                  { id: 'for-you', label: blogPageText.hero.forYouTab },
                  { id: 'followed', label: blogPageText.hero.followedTab },
                ]"
                :key="tab.id"
                type="button"
                role="tab"
                aria-controls="mm-blog-topic-panel"
                :aria-selected="topicExplorerTab === tab.id"
                :class="{ 'is-active': topicExplorerTab === tab.id }"
                @click="topicExplorerTab = tab.id"
              >
                {{ tab.label }}
                <strong v-if="tab.id === 'followed'">{{ followedTopics.length }}</strong>
              </button>
            </div>

            <label class="mm-blog-topic-explorer__search">
              <v-icon icon="mdi-magnify" size="18" aria-hidden="true" />
              <input
                v-model="topicSearch"
                type="search"
                :aria-label="blogPageText.hero.topicSearch"
                :placeholder="blogPageText.hero.topicSearch"
              />
            </label>

            <div class="mm-blog-topic-explorer__options">
              <button
                type="button"
                :class="{ 'is-active': !multiTopicEnabled }"
                :aria-pressed="!multiTopicEnabled"
                @click="multiTopicEnabled && toggleMultiTopic()"
              >
                {{ blogPageText.hero.singleTopicMode }}
              </button>
              <button
                type="button"
                :class="{ 'is-active': multiTopicEnabled }"
                :aria-pressed="multiTopicEnabled"
                @click="!multiTopicEnabled && toggleMultiTopic()"
              >
                {{ blogPageText.hero.multiTopicMode }}
              </button>
              <template v-if="multiTopicEnabled">
                <span class="mm-blog-topic-explorer__separator" aria-hidden="true" />
                <button
                  type="button"
                  :class="{ 'is-active': topicMatchMode === 'or' }"
                  :aria-pressed="topicMatchMode === 'or'"
                  @click="setTopicMatchMode('or')"
                >
                  {{ blogPageText.hero.matchAnyTopic }}
                </button>
                <button
                  type="button"
                  :class="{ 'is-active': topicMatchMode === 'and' }"
                  :aria-pressed="topicMatchMode === 'and'"
                  @click="setTopicMatchMode('and')"
                >
                  {{ blogPageText.hero.matchAllTopics }}
                </button>
              </template>
            </div>

            <div
              id="mm-blog-topic-panel"
              class="mm-blog-topic-explorer__list"
              role="tabpanel"
              :aria-label="blogPageText.hero.explorerTitle"
            >
              <p v-if="topicExplorerTab === 'followed' && !followedTopics.length">
                {{ blogPageText.hero.noFollowedTopics }}
              </p>
              <p v-else-if="!explorerTopics.length">{{ blogPageText.hero.noTopics }}</p>
              <div v-for="topic in explorerTopics" :key="topic.key" class="mm-blog-topic-row">
                <button
                  class="mm-blog-topic-row__select"
                  type="button"
                  :aria-pressed="isTopicSelected(topic.label)"
                  @click="selectTag(topic.label)"
                >
                  <span>{{ topic.label }}</span>
                  <v-icon
                    v-if="topic.trendDelta > 0"
                    icon="mdi-trending-up"
                    size="16"
                    :title="blogPageText.hero.trending"
                    :aria-label="blogPageText.hero.trending"
                  />
                  <strong>{{ topic.count }}</strong>
                </button>
                <button
                  class="mm-blog-topic-row__follow"
                  type="button"
                  :aria-label="`${isFollowedTopic(topic.label) ? blogPageText.hero.unfollowTopic : blogPageText.hero.followTopic}: ${topic.label}`"
                  :aria-pressed="isFollowedTopic(topic.label)"
                  @click="toggleFollowedTopic(topic.label)"
                >
                  <v-icon
                    :icon="isFollowedTopic(topic.label) ? 'mdi-star' : 'mdi-star-outline'"
                    size="18"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </div>
        </v-card>
      </v-dialog>

      <div class="mm-blog__mobile-overlay" v-if="mobileFiltersOpen" @click="closeMobileFilters" />
    </section>
  </DefaultLayout>
</template>
