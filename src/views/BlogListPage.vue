<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { getBlogArticles } from '@/services/shopifyApi'
  import ArticleCard from '@/components/article/ArticleCardComponent.vue'
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import { generateOrganizationJsonLd, generateBlogIndexJsonLd } from '@/utils/jsonld'
  import { useJsonLd } from '@/composables/useJsonLd'

  const articles = ref([])
  const loading = ref(true)
  const selectedTag = ref(null)
  const isMobileFilterOpen = ref(false)
  const currentPage = ref(1)
  const itemsPerPage = 12 // 8 статей на сторінку

  onMounted(async () => {
    articles.value = await getBlogArticles()
    loading.value = false

    const metaDescription =
      "Дізнайтеся більше про найновіші статті та новини у Mud' Tech Blog. Залишайтеся в курсі актуальних технологій та отримуйте корисні поради й аналітику..."

    // Встановлюємо мета-опис
    let metaTag = document.querySelector('meta[name="description"]')
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.name = 'description'
      document.head.appendChild(metaTag)
    }
    metaTag.content = metaDescription

    // Оновлюємо заголовок вкладки
    document.title = "Блог | Дізнайтеся більше про найновіші статті у Mud' Tech Blog..."
  })

  // Отримуємо унікальні теги
  const tags = computed(() => {
    const allTags = articles.value.flatMap(article => article.tags || [])
    return [...new Set(allTags)]
  })

  // Фільтровані та відсортовані статті (найновіші першими)
  const filteredArticles = computed(() => {
    let filtered = [...articles.value].sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    )
    if (selectedTag.value) {
      filtered = filtered.filter(article => article.tags.includes(selectedTag.value))
    }
    return filtered
  })

  // Загальна кількість сторінок
  const totalPages = computed(() => Math.ceil(filteredArticles.value.length / itemsPerPage))

  // Отримання статей для поточної сторінки
  const paginatedArticles = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    return filteredArticles.value.slice(start, start + itemsPerPage)
  })

  // Перемикання сторінок
  const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++
  }

  // Вибір тегу
  const toggleTagFilter = tag => {
    selectedTag.value = selectedTag.value === tag ? null : tag
    currentPage.value = 1 // Повертаємося на першу сторінку
  }

  // Скидання фільтра
  const resetFilter = () => {
    selectedTag.value = null
    currentPage.value = 1
  }

  // Відкриття/закриття мобільного фільтра
  const toggleMobileFilter = () => {
    isMobileFilterOpen.value = !isMobileFilterOpen.value
  }

  onMounted(() => {
    useJsonLd([generateOrganizationJsonLd(), generateBlogIndexJsonLd()])
  })
</script>
<template>
  <DefaultLayout>
    <!-- HERO BLOG -->
    <section class="mm-blog-hero">
      <div class="mm-blog-hero__glow"></div>

      <h1 class="mm-blog-hero__title">
        <v-icon icon="mdi-lightbulb-on-outline" class="mm-blog-hero__icon" />
        Блог | Залишайтеся в курсі актуальних технологій
      </h1>

      <p class="mm-blog-hero__subtitle">Всі технологічні статті та новини</p>
    </section>

    <!-- ARTICLES GRID -->
    <section class="mm-blog-wrapper">
      <p v-if="loading" class="mm-blog-loading">Завантаження...</p>
      <p v-if="!loading && !paginatedArticles.length" class="mm-blog-empty">Статті не знайдено.</p>

      <div v-if="paginatedArticles.length" class="mm-blog-grid">
        <ArticleCard
          v-for="article in paginatedArticles"
          :key="article.handle"
          :article="article"
        />
      </div>

      <!-- PAGINATION -->
      <div class="mm-blog-pagination" v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 1">
          <v-icon icon="mdi-chevron-left" />
          Попередня
        </button>

        <span>Сторінка {{ currentPage }} з {{ totalPages }}</span>

        <button @click="nextPage" :disabled="currentPage === totalPages">
          Наступна
          <v-icon icon="mdi-chevron-right" />
        </button>
      </div>

      <!-- FAB FILTER BUTTON -->
      <button class="mm-filter-btn" @click="toggleMobileFilter">
        <v-icon icon="mdi-filter-variant" size="26" />
      </button>

      <div class="mm-filter-overlay" v-if="isMobileFilterOpen" @click="toggleMobileFilter"></div>

      <div class="mm-filter" :class="{ open: isMobileFilterOpen }">
        <button class="close-filter" @click="toggleMobileFilter">
          <v-icon icon="mdi-close" size="26" />
        </button>

        <h2>Фільтр статей</h2>

        <div class="mm-filter-tags">
          <button
            v-for="tag in tags"
            :key="tag"
            @click="toggleTagFilter(tag)"
            :class="{ active: selectedTag === tag }"
          >
            <v-icon icon="mdi-tag-outline" size="16" />
            {{ tag }}
          </button>

          <button v-if="selectedTag" @click="resetFilter" class="reset-filter">
            <v-icon icon="mdi-backspace" size="18" />
            Очистити
          </button>
        </div>
      </div>
    </section>
  </DefaultLayout>
</template>
