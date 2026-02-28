<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { getBlogArticles } from '@/services/shopifyApi'
  import ArticleCard from '@/components/article/ArticleCardComponent.vue'
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import { generateBlogIndexJsonLd, generateOrganizationJsonLd } from '@/utils/jsonld'
  import { useJsonLd } from '@/composables/useJsonLd'

  const PAGE_SIZE = 9

  const articles = ref([])
  const loading = ref(true)
  const searchQuery = ref('')
  const selectedTag = ref('all')
  const sortBy = ref('date_desc')
  const currentPage = ref(1)
  const mobileFiltersOpen = ref(false)

  const sortOptions = [
    { value: 'date_desc', label: 'Спочатку новіші' },
    { value: 'date_asc', label: 'Спочатку старіші' },
    { value: 'title_asc', label: 'Назва: А-Я' },
    { value: 'title_desc', label: 'Назва: Я-А' },
  ]

  onMounted(async () => {
    articles.value = await getBlogArticles()
    loading.value = false

    const metaDescription =
      "Усі статті Mud' Tech Blog: практичні матеріали про frontend, eCommerce, архітектуру та сучасну розробку."
    let metaTag = document.querySelector('meta[name="description"]')
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.name = 'description'
      document.head.appendChild(metaTag)
    }
    metaTag.content = metaDescription
    document.title = "Блог | Mud' Tech Blog"

    useJsonLd([generateOrganizationJsonLd(), generateBlogIndexJsonLd()])
  })

  const tagStats = computed(() => {
    const counts = new Map()
    articles.value.forEach(article => {
      if (!Array.isArray(article.tags)) return
      article.tags.forEach(tag => {
        const normalized = String(tag).trim()
        if (!normalized) return
        counts.set(normalized, (counts.get(normalized) || 0) + 1)
      })
    })

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }))
  })

  const filteredArticles = computed(() => {
    let list = [...articles.value]
    const query = searchQuery.value.trim().toLowerCase()

    if (selectedTag.value !== 'all') {
      list = list.filter(article => article.tags?.includes(selectedTag.value))
    }

    if (query) {
      list = list.filter(article => {
        const title = article.title?.toLowerCase() || ''
        const excerpt = article.excerpt?.toLowerCase() || ''
        return title.includes(query) || excerpt.includes(query)
      })
    }

    if (sortBy.value === 'date_asc') {
      list.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
    } else if (sortBy.value === 'title_asc') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'uk'))
    } else if (sortBy.value === 'title_desc') {
      list.sort((a, b) => b.title.localeCompare(a.title, 'uk'))
    } else {
      list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    }

    return list
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredArticles.value.length / PAGE_SIZE)))
  const paginatedArticles = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredArticles.value.slice(start, start + PAGE_SIZE)
  })

  const topTagsPreview = computed(() => tagStats.value.slice(0, 4))
  const lastPublishedDate = computed(() => {
    if (!articles.value.length) return '-'
    return new Date(articles.value[0].publishedAt).toLocaleDateString('uk-UA')
  })

  const selectTag = tag => {
    selectedTag.value = tag
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedTag.value = 'all'
    sortBy.value = 'date_desc'
    currentPage.value = 1
    mobileFiltersOpen.value = false
  }

  watch([selectedTag, searchQuery, sortBy], () => {
    currentPage.value = 1
  })

  watch(totalPages, pageCount => {
    if (currentPage.value > pageCount) currentPage.value = pageCount
  })
</script>

<template>
  <DefaultLayout>
    <section class="mm-blog">
      <header class="mm-blog__hero">
        <div class="mm-blog__hero-head">
          <h1>
            <v-icon icon="mdi-post-outline" size="26" />
            Журнал статей
          </h1>
          <button class="mm-blog__filter-toggle d-md-none" @click="mobileFiltersOpen = !mobileFiltersOpen">
            <v-icon icon="mdi-tune-variant" size="18" />
            Фільтри
          </button>
        </div>

        <p class="mm-blog__hero-subtitle">
          Огляд публікацій з пошуком, сортуванням і тематичною навігацією по тегах.
        </p>

        <div class="mm-blog__stats">
          <article class="mm-blog-stat">
            <span>Всього статей</span>
            <strong>{{ articles.length }}</strong>
          </article>
          <article class="mm-blog-stat">
            <span>Після фільтрації</span>
            <strong>{{ filteredArticles.length }}</strong>
          </article>
          <article class="mm-blog-stat">
            <span>Унікальних тегів</span>
            <strong>{{ tagStats.length }}</strong>
          </article>
          <article class="mm-blog-stat">
            <span>Остання публікація</span>
            <strong>{{ lastPublishedDate }}</strong>
          </article>
        </div>

        <div class="mm-blog__top-tags">
          <span v-for="item in topTagsPreview" :key="item.label">
            #{{ item.label }}
            <strong>{{ item.count }}</strong>
          </span>
        </div>
      </header>

      <div class="mm-blog__layout">
        <section class="mm-blog__surface">
          <div class="mm-blog__controls">
            <label class="mm-blog-control mm-blog-control--search">
              <v-icon icon="mdi-magnify" size="18" />
              <input v-model="searchQuery" type="text" placeholder="Пошук по заголовку або опису..." />
            </label>

            <label class="mm-blog-control mm-blog-control--sort">
              <v-icon icon="mdi-sort" size="18" />
              <select v-model="sortBy">
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>

          <div class="mm-blog__state" v-if="loading">
            <v-progress-circular indeterminate size="24" width="3" color="primary" />
            <span>Завантаження статей...</span>
          </div>

          <div class="mm-blog__state mm-blog__state--empty" v-else-if="!filteredArticles.length">
            <v-icon icon="mdi-file-search-outline" size="22" />
            <span>За поточним запитом статей не знайдено.</span>
            <button class="mm-blog__clear-btn" @click="clearFilters">Скинути фільтри</button>
          </div>

          <div v-else class="mm-blog-grid">
            <ArticleCard
              v-for="article in paginatedArticles"
              :key="article.handle"
              :article="article"
            />
          </div>

          <div class="mm-blog-pagination" v-if="!loading && filteredArticles.length > PAGE_SIZE">
            <button :disabled="currentPage === 1" @click="currentPage = currentPage - 1">
              <v-icon icon="mdi-chevron-left" />
              Попередні
            </button>
            <span>{{ currentPage }} / {{ totalPages }}</span>
            <button :disabled="currentPage === totalPages" @click="currentPage = currentPage + 1">
              Наступні
              <v-icon icon="mdi-chevron-right" />
            </button>
          </div>
        </section>

        <aside class="mm-blog__sidebar" :class="{ 'mm-blog__sidebar--open': mobileFiltersOpen }">
          <div class="mm-blog__sidebar-head d-md-none">
            <h2>Фільтри</h2>
            <button @click="mobileFiltersOpen = false">
              <v-icon icon="mdi-close" size="18" />
            </button>
          </div>

          <section class="mm-blog-panel">
            <div class="mm-blog-panel__head">
              <v-icon icon="mdi-tag-multiple-outline" size="18" />
              <h3>Теми</h3>
            </div>

            <div class="mm-blog-tags">
              <button
                class="mm-blog-tag"
                :class="{ 'mm-blog-tag--active': selectedTag === 'all' }"
                @click="selectTag('all')"
              >
                <span>Усі теми</span>
                <strong>{{ articles.length }}</strong>
              </button>

              <button
                v-for="item in tagStats"
                :key="item.label"
                class="mm-blog-tag"
                :class="{ 'mm-blog-tag--active': selectedTag === item.label }"
                @click="selectTag(item.label)"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.count }}</strong>
              </button>
            </div>
          </section>

          <section class="mm-blog-panel">
            <div class="mm-blog-panel__head">
              <v-icon icon="mdi-lightning-bolt-outline" size="18" />
              <h3>Швидкі дії</h3>
            </div>

            <div class="mm-blog-actions">
              <router-link to="/" class="mm-blog-action mm-blog-action--primary">
                <v-icon icon="mdi-home-variant-outline" size="17" />
                На головну
              </router-link>
              <button class="mm-blog-action" @click="clearFilters">
                <v-icon icon="mdi-filter-remove-outline" size="17" />
                Скинути фільтри
              </button>
            </div>
          </section>
        </aside>
      </div>

      <div
        class="mm-blog__mobile-overlay d-md-none"
        v-if="mobileFiltersOpen"
        @click="mobileFiltersOpen = false"
      />
    </section>
  </DefaultLayout>
</template>
