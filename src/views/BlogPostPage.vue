<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { getBlogArticles } from '@/services/shopifyApi'
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import DonationSection from '@/components/donation/DonationSection.vue'
  import ScrollProgressBar from '@/components/ui/ScrollProgressBar.vue'
  import {
    generateBlogPostJsonLd,
    generateOrganizationJsonLd,
    generateBreadcrumbJsonLd,
  } from '@/utils/jsonld'
  import { useJsonLd } from '@/composables/useJsonLd'

  const route = useRoute()
  const router = useRouter()
  const articles = ref([])
  const article = ref(null)
  const scrollBarRef = ref(null)

  const DISQUS_SHORTNAME = import.meta.env.VITE_DISQUS_SHORTNAME
  const truncateBreadcrumb = text => {
    if (!text) return ''
    return text.length > 36 ? text.slice(0, 36) + '…' : text
  }

  // ---------- Disqus ----------
  onMounted(() => {
    if (!DISQUS_SHORTNAME) {
      console.error('❌ Disqus SHORTNAME не налаштовано!')
      return
    }

    const script = document.createElement('script')
    script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`
    script.setAttribute('data-timestamp', +new Date())
    document.body.appendChild(script)
  })

  // ---------- Завантаження статті ----------
  const loadArticle = async () => {
    articles.value = await getBlogArticles()
    article.value = articles.value.find(a => a.handle === route.params.slug)

    if (article.value) {
      updateMetaTags()

      // оновлюємо прогрес бар після рендеру
      setTimeout(() => {
        scrollBarRef.value?.updateScroll()
      }, 300)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ---------- Meta tags ----------
  const updateMetaTags = () => {
    if (!article.value) return

    document.title = `${article.value.title} | Mud' Tech Blog`

    const plainText = article.value.contentHtml.replace(/<[^>]*>/g, '')
    let description = article.value.excerpt || plainText

    if (description.length > 250) description = description.substring(0, 240) + '...'
    if (description.length < 160) description = description.padEnd(160, ' ')

    let metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    } else {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      metaDescription.content = description
      document.head.appendChild(metaDescription)
    }
  }

  onMounted(loadArticle)
  watch(() => route.params.slug, loadArticle)

  // ---------- Обчислення ----------
  const readingTime = computed(() => {
    if (!article.value || !article.value.contentHtml) return 1
    const words = article.value.contentHtml.replace(/<[^>]*>/g, '').split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  })

  const isUpdated = computed(() => {
    if (!article.value) return false
    return article.value.updatedAt && article.value.updatedAt !== article.value.publishedAt
  })

  const nextArticle = computed(() => {
    if (!articles.value.length || !article.value) return null
    const currentIndex = articles.value.findIndex(a => a.handle === article.value.handle)
    return articles.value[currentIndex + 1] || null
  })

  const breadcrumbs = computed(() => {
    if (!article.value) return []
    return [
      { title: 'Головна', to: '/' },
      { title: 'Блог', to: '/blog' },
      { title: article.value.title, disabled: true },
    ]
  })

  // ---------- Навігація ----------
  const goBack = () => {
    router.go(-1)
  }

  const goNext = () => {
    if (nextArticle.value) {
      router.push(`/blog/${nextArticle.value.handle}`)
    }
  }

  // ---------- Форматування ----------
  const formatDate = date => new Date(date).toLocaleDateString('uk-UA')

  // ---------- Шерінг ----------
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')
  }

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${window.location.href}&text=${article.value.title}`,
      '_blank'
    )
  }

  const shareOnTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${window.location.href}&text=${article.value.title}`,
      '_blank'
    )
  }

  const copyLink = () => {
    const currentPath = `/blog/${article.value.handle}`
    const baseUrl = window.location.origin
    const fullUrl = baseUrl + currentPath

    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        alert('🔗 Лінк скопійовано!')
      })
      .catch(err => {
        console.error('❌ Не вдалося скопіювати лінк:', err)
      })
  }

  watch(article, val => {
    if (!val) return

    useJsonLd([
      generateBlogPostJsonLd(val),
      generateOrganizationJsonLd(),
      generateBreadcrumbJsonLd(val),
    ])
  })
</script>

<template>
  <DefaultLayout>
    <ScrollProgressBar ref="scrollBarRef" />

    <v-container v-if="article" class="mm-post" max-width="960">
      <div class="mm-post__shell">
        <div class="mm-post__glow" />

        <div class="mm-post__hero-top">
          <div class="mm-post__hero-left">
            <div class="mm-post__breadcrumbs">
              <v-breadcrumbs :items="breadcrumbs">
                <template #divider>
                  <v-icon size="14" class="mm-post__crumb-divider">mdi-chevron-right</v-icon>
                </template>

                <template #item="{ item }">
                  <router-link v-if="!item.disabled" :to="item.to" class="mm-post__crumb-link">
                    {{ item.title }}
                  </router-link>
                  <span v-else class="mm-post__crumb-current">
                    {{ truncateBreadcrumb(article.title) }}
                  </span>
                </template>
              </v-breadcrumbs>
            </div>

            <div class="mm-post__meta-top">
              <v-chip
                size="small"
                class="mm-post__chip mm-post__chip--tag"
                v-if="article.tags?.length"
                pill
              >
                <v-icon icon="mdi-tag-multiple" size="16" start />
                {{ article.tags[0] }}
              </v-chip>

              <div class="mm-post__meta-top-right">
                <span class="mm-post__meta-pill">
                  <v-icon icon="mdi-calendar" size="16" />
                  {{ formatDate(article.publishedAt) }}
                </span>
                <span class="mm-post__meta-pill">
                  <v-icon icon="mdi-timer-sand" size="16" />
                  ~{{ readingTime }} хв
                </span>
              </div>
            </div>

            <h1 class="mm-post__title">
              {{ article.title }}
            </h1>
          </div>

          <div v-if="article.image" class="mm-post__hero-thumb">
            <img :src="article.image.url" :alt="article.title" />
          </div>
        </div>

        <section class="mm-post__donation">
          <DonationSection />
        </section>

        <section class="mm-post__content">
          <div v-html="article.contentHtml" class="mm-post__content-inner" />
        </section>
        <section class="mm-post__share">
          <div class="mm-post__share-header">
            <v-icon icon="mdi-share-variant" size="22" />
            <span>Поділитися статтею</span>
          </div>

          <div class="mm-post__share-buttons">
            <button class="mm-share-btn" @click="shareOnFacebook" aria-label="Facebook">
              <v-icon size="20" icon="mdi-facebook" />
            </button>

            <button class="mm-share-btn" @click="shareOnTwitter" aria-label="Twitter / X">
              <v-icon size="20" icon="mdi-twitter" />
            </button>

            <button class="mm-share-btn" @click="shareOnTelegram" aria-label="Telegram">
              <v-icon size="20" icon="mdi-send-variant" />
            </button>

            <button
              class="mm-share-btn mm-share-btn--copy"
              @click="copyLink"
              aria-label="Copy link"
            >
              <v-icon size="20" icon="mdi-link-variant" />
            </button>
          </div>
        </section>

        <section class="mm-post__nav">
          <v-btn
            class="mm-post__nav-prev"
            variant="outlined"
            color="primaryBtn"
            rounded="lg"
            @click="goBack"
          >
            <v-icon start icon="mdi-chevron-left" />
            Назад
          </v-btn>

          <v-btn
            class="mm-post__nav-next"
            v-if="nextArticle"
            variant="flat"
            color="primaryBtn"
            rounded="lg"
            @click="goNext"
          >
            Наступна стаття
            <v-icon end icon="mdi-chevron-right" />
          </v-btn>
        </section>

        <section class="mm-post__comments">
          <div class="mm-post__comments-header">
            <v-icon icon="mdi-comment-multiple-outline" size="22" />
            <h2>Коментарі</h2>
          </div>
          <div id="disqus_thread" />
        </section>
      </div>
    </v-container>
  </DefaultLayout>
</template>
