<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { getBlogArticles } from '@/services/shopifyApi'

  const props = defineProps({
    currentArticle: Object,
    allArticles: Array,
  })

  const router = useRouter()
  const related = ref([])
  const all = ref([])
  let interval

  const pickRandom = () => {
    const pool = props.allArticles?.length ? props.allArticles : all.value

    const filtered = props.currentArticle
      ? pool.filter(
          p =>
            p.handle !== props.currentArticle.handle &&
            p.tags?.some(t => props.currentArticle.tags?.includes(t))
        )
      : pool

    related.value = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 4)
  }

  const load = async () => {
    all.value = props.allArticles?.length ? props.allArticles : await getBlogArticles()

    pickRandom()
  }

  onMounted(async () => {
    await load()
    interval = setInterval(pickRandom, 45000)
  })
  onUnmounted(() => clearInterval(interval))

  const goTo = slug => router.push(`/blog/${slug}`)
</script>

<template>
  <section class="mm-related">
    <h2 class="mm-related__title">
      <v-icon icon="mdi-lightning-bolt" size="28" class="mr-2" />
      Рекомендовані статті
    </h2>

    <div class="mm-related__grid">
      <v-card
        v-for="post in related"
        :key="post.handle"
        class="mm-card"
        rounded="xl"
        elevation="6"
        @click="goTo(post.handle)"
      >
        <div class="mm-card__glow"></div>

        <v-img :src="post.image?.url" height="170" cover class="mm-card__img" />

        <v-chip v-if="post.tags?.length" size="small" class="mm-card__tag" variant="flat">
          <v-icon icon="mdi-tag-outline" size="14" class="mr-1" />
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
              Читати
              <v-icon icon="mdi-arrow-right" size="18" />
            </span>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </section>
</template>
