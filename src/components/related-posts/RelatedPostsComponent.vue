<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { getBlogArticles } from '@/services/shopifyApi'

  const props = defineProps({
    currentArticle: Object,
    allArticles: Array,
  })

  const router = useRouter()

  const uiText = {
    title: '📚 Рекомендовані статті',
    excerptFallback: 'Опис відсутній',
  }

  const articles = ref([])
  const related = ref([])

  let interval

  const getRandomRelated = () => {
    const source = props.allArticles?.length ? props.allArticles : articles.value

    const pool = props.currentArticle
      ? source.filter(
          a =>
            a.handle !== props.currentArticle.handle &&
            a.tags?.some(tag => props.currentArticle.tags?.includes(tag))
        )
      : source

    const shuffled = [...pool].sort(() => 0.5 - Math.random())
    related.value = shuffled.slice(0, 4)
  }

  const loadArticles = async () => {
    articles.value = props.allArticles?.length ? props.allArticles : await getBlogArticles()
    getRandomRelated()
  }

  onMounted(async () => {
    await loadArticles()
    interval = setInterval(getRandomRelated, Math.floor(Math.random() * 30000) + 30000)
  })
  onUnmounted(() => clearInterval(interval))

  const goToArticle = slug => router.push(`/blog/${slug}`)
</script>

<template>
  <div class="related-posts" v-if="related.length">
    <div class="related-posts__container">
      <h2 class="related-posts__title">{{ uiText.title }}</h2>
      <div class="related-posts__grid">
        <div
          v-for="post in related"
          :key="post.handle"
          class="related-posts__card"
          @click="goToArticle(post.handle)"
        >
          <img
            v-if="post.image?.url"
            :src="post.image.url"
            alt="preview"
            class="related-posts__image"
          />
          <div class="related-posts__info">
            <h3 class="related-posts__headline">{{ post.title }}</h3>
            <div class="related-posts__tags">
              <span class="related-posts__tag" v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
