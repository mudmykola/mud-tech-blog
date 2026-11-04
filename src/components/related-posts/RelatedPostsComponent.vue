<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { getBlogArticles } from '@/services/shopifyApi'
  import { useOptimizedImage } from '@/composables/useOptimizedImage.js'
  import RelatedPostsSkeleton from '@/components/skeleton/RelatedPostsSkeleton.vue'

  const props = defineProps({
    currentArticle: {
      type: Object,
      default: null,
    },
    allArticles: {
      type: Array,
      default: () => [],
    },
    limit: {
      type: Number,
      default: 4,
    },
  })

  const router = useRouter()
  const related = ref([])
  const all = ref([])
  const loading = ref(true)
  let intervalId

  const pickRandom = () => {
    const pool = props.allArticles.length ? props.allArticles : all.value

    if (!pool.length) {
      related.value = []
      return
    }

    const filtered = props.currentArticle
      ? pool.filter(
          post =>
            post.handle !== props.currentArticle.handle &&
            post.tags?.some(tag => props.currentArticle.tags?.includes(tag))
        )
      : pool

    related.value = [...filtered].sort(() => 0.5 - Math.random()).slice(0, props.limit)
  }

  const load = async () => {
    loading.value = true
    try {
      all.value = props.allArticles.length ? props.allArticles : await getBlogArticles()
      pickRandom()
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    await load()
    intervalId = setInterval(pickRandom, 45_000)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  const goTo = slug => router.push(`/blog/${slug}`)
  const imageAttrs = post => useOptimizedImage(post.image?.url, post.title, 600).attributes.value
</script>

<template>
  <section class="mm-related">
    <div class="mm-related__head">
      <h2 class="mm-related__title">
        <v-icon class="mr-2" icon="mdi-orbit-variant" size="28" />
        Рекомендовані статті
      </h2>
      <span class="mm-related__chip">
        <v-icon icon="mdi-refresh" size="14" />
        Auto Mix
      </span>
    </div>

    <RelatedPostsSkeleton v-if="loading" :count="limit" />

    <div class="mm-related__grid" v-else-if="related.length">
      <v-card
        v-for="post in related"
        :key="post.handle"
        class="mm-card"
        elevation="0"
        rounded="xl"
        @click="goTo(post.handle)"
      >
        <div class="mm-card__glow" />

        <img class="mm-card__img" v-bind="imageAttrs(post)" />

        <v-chip v-if="post.tags?.length" class="mm-card__tag" size="small" variant="flat">
          <v-icon class="mr-1" icon="mdi-tag-outline" size="14" />
          {{ post.tags[0] }}
        </v-chip>

        <v-card-text class="mm-card__body">
          <h3 class="mm-card__title">{{ post.title }}</h3>

          <div class="mm-card__meta">
            <span class="mm-card__date">
              <v-icon icon="mdi-calendar" size="16" />
              {{ new Date(post.publishedAt).toLocaleDateString('uk-UA') }}
            </span>

            <span class="mm-card__read">
              Перейти
              <v-icon icon="mdi-arrow-top-right" size="18" />
            </span>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div class="mm-related__empty" v-else>
      <v-icon icon="mdi-newspaper-variant-multiple-outline" size="20" />
      Немає рекомендованих статей
    </div>
  </section>
</template>
