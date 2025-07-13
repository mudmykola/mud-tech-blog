<script setup>
  import { ref, onMounted } from 'vue'

  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import HomeHeader from '@/components/home/HomeHeaderComponent.vue'
  import ArticleFilters from '@/components/home/ArticleFiltersComponent.vue'
  import ArticleGrid from '@/components/home/ArticleGridComponent.vue'
  import DonationSection from '@/components/donation/DonationSection.vue'
  import RelatedPostsComponent from '@/components/related-posts/RelatedPostsComponent.vue'

  import { getBlogArticles } from '@/services/shopifyApi'
  import { useArticleFilters } from '@/composables/useArticleFilters'
  import { useMetaTags } from '@/composables/useMetaTags'
  import { useJsonLd } from '@/composables/useJsonLd'
  import { generateOrganizationJsonLd, generateWebSiteJsonLd } from '@/utils/jsonld'

  const uiText = {
    title: 'Твоя доза технологій',
    subtitle: 'Залишайся попереду. Читай, дізнавайся, впроваджуй',
    loading: 'Завантаження статей...',
    notFound: 'Статті не знайдено.',
    showAll: 'Переглянути всі статті',
  }

  const articles = ref([])
  const loading = ref(true)
  const searchQuery = ref('')
  const sortBy = ref('date_desc')

  onMounted(async () => {
    articles.value = await getBlogArticles()
    loading.value = false
    useMetaTags()
    useJsonLd([generateOrganizationJsonLd(), generateWebSiteJsonLd()])
  })

  const filteredArticles = useArticleFilters(articles, searchQuery, sortBy)
</script>

<template>
  <DefaultLayout>
    <div class="home">
      <HomeHeader :title="uiText.title" :subtitle="uiText.subtitle" />

      <ArticleFilters
        :searchQuery="searchQuery"
        @update:searchQuery="searchQuery = $event"
        :sortBy="sortBy"
        @update:sortBy="sortBy = $event"
      />

      <p v-if="loading" class="loading">{{ uiText.loading }}</p>
      <p v-else-if="!filteredArticles.length" class="no-articles">
        {{ uiText.notFound }}
      </p>

      <ArticleGrid :filteredArticles="filteredArticles" />

      <router-link to="/blog" class="btn">
        {{ uiText.showAll }}
      </router-link>

      <DonationSection />
      <div class="related-post">
        <RelatedPostsComponent :allArticles="articles" />
      </div>
    </div>
  </DefaultLayout>
</template>
