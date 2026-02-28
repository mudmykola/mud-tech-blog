<script setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useHead } from '@vueuse/head'
  import { useRoute, useRouter } from 'vue-router'

  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import DonationSection from '@/components/donation/DonationSection.vue'
  import ScrollProgressBar from '@/components/ui/ScrollProgressBar.vue'
  import { getBlogArticles } from '@/services/shopifyApi'
  import { useOptimizedImage } from '@/composables/useOptimizedImage'
  import { buildCanonicalUrl, getCanonicalOrigin } from '@/utils/canonical'
  import { ANALYTICS_EVENTS, ANALYTICS_PARAMS } from '@/analytics/events'
  import { trackEvent } from '@/firebase'
  import {
    generateBlogPostJsonLd,
    generateBreadcrumbJsonLd,
    generateOrganizationJsonLd,
  } from '@/utils/jsonld'
  import { useJsonLd } from '@/composables/useJsonLd'

  const route = useRoute()
  const router = useRouter()

  const DISQUS_SHORTNAME = import.meta.env.VITE_DISQUS_SHORTNAME
  const TWITTER_SITE = import.meta.env.VITE_TWITTER_SITE || ''

  const articles = ref([])
  const article = ref(null)
  const loading = ref(true)
  const copied = ref(false)
  const scrollBarRef = ref(null)
  const disqusThreadRef = ref(null)
  const contentRef = ref(null)
  const disqusActivated = ref(false)
  const readStarted = ref(false)
  const readHalfReached = ref(false)
  const readCompleted = ref(false)
  let loadRequestId = 0
  let disqusObserver = null
  let readProgressRaf = null

  const stripHtml = value => (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const trimSeoText = (value, maxLength) => {
    const plain = String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!plain) return ''
    if (plain.length <= maxLength) return plain

    const draft = plain.slice(0, maxLength + 1)
    const wordBoundary = draft.lastIndexOf(' ')
    const clipped = wordBoundary > Math.floor(maxLength * 0.62) ? draft.slice(0, wordBoundary) : plain.slice(0, maxLength)
    return `${clipped.trim()}…`
  }
  const toAbsoluteUrl = value => {
    const raw = String(value || '').trim()
    if (!raw) return ''
    if (/^https?:\/\//i.test(raw)) return raw
    return `${getCanonicalOrigin()}${raw.startsWith('/') ? raw : `/${raw}`}`
  }

  const summaryText = computed(() => {
    if (!article.value) return ''
    const raw = article.value.excerpt || stripHtml(article.value.contentHtml)
    return raw.length > 220 ? `${raw.slice(0, 220)}...` : raw
  })

  const readingTime = computed(() => {
    if (!article.value) return 1
    const words = stripHtml(article.value.contentHtml).split(' ').filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
  })

  const formattedDate = computed(() => {
    if (!article.value?.publishedAt) return '-'
    return new Date(article.value.publishedAt).toLocaleDateString('uk-UA')
  })

  const canonicalUrl = computed(() => {
    if (!article.value) return ''
    return buildCanonicalUrl(`/blog/${article.value.handle}`)
  })

  const encodedShareUrl = computed(() => encodeURIComponent(canonicalUrl.value))
  const encodedShareTitle = computed(() => encodeURIComponent(article.value?.title || ''))
  const heroImageAttrs = computed(() => {
    const src = article.value?.image?.url || ''
    const alt = article.value?.image?.altText || article.value?.title || 'Hero image'

    return useOptimizedImage(src, alt, 1600, {
      loading: 'eager',
      decoding: 'async',
      fetchpriority: 'high',
      sizes: '(max-width: 600px) 100vw, (max-width: 960px) 94vw, (max-width: 1400px) 74vw, 1120px',
      style: 'width:100%;height:100%;display:block;',
    }).attributes
  })

  const nextArticle = computed(() => {
    if (!article.value || !articles.value.length) return null
    const currentIndex = articles.value.findIndex(item => item.handle === article.value.handle)
    return currentIndex >= 0 ? articles.value[currentIndex + 1] || null : null
  })

  const breadcrumbs = computed(() => [
    { title: 'Головна', to: '/' },
    { title: 'Блог', to: '/blog' },
    { title: article.value?.title || 'Стаття', to: '' },
  ])
  const seoPostTitle = computed(() =>
    trimSeoText(article.value?.title || 'Стаття про frontend, eCommerce та веб-розробку', 52)
  )
  const seoPostH1 = computed(() =>
    trimSeoText(article.value?.title || 'Стаття про frontend, eCommerce та веб-розробку', 60)
  )

  useHead(() => {
    const robots = String(route.meta?.robots || 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')
    const title = article.value ? `${seoPostTitle.value} | Mud' Tech Blog` : "Стаття | Mud' Tech Blog"
    const description = article.value
      ? summaryText.value || 'Практична стаття Mud Tech Blog про веб-розробку.'
      : 'Матеріал Mud Tech Blog про frontend, інструменти та сучасну веб-розробку.'
    const canonical =
      canonicalUrl.value || buildCanonicalUrl(route.path || '/blog')
    const image = toAbsoluteUrl(article.value?.image?.url || '/pwa-512x512.png')

    return {
      title,
      meta: [
        { name: 'description', content: description },
        { name: 'robots', content: robots },
        { name: 'googlebot', content: robots },
        { property: 'og:title', content: seoPostH1.value || "Стаття | Mud' Tech Blog" },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: canonical },
        { property: 'og:image', content: image },
        { property: 'og:site_name', content: 'Mud Tech Blog' },
        { property: 'og:locale', content: 'uk_UA' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: seoPostH1.value || "Стаття | Mud' Tech Blog" },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
        ...(TWITTER_SITE ? [{ name: 'twitter:site', content: TWITTER_SITE }] : []),
      ],
      link: [{ rel: 'canonical', href: canonical }],
    }
  })

  const loadArticle = async () => {
    const requestId = ++loadRequestId
    const targetSlug = String(route.params.slug || '')
    loading.value = true
    disqusActivated.value = false

    // Fast path: reuse already loaded articles to avoid full refetch on "next article".
    if (articles.value.length) {
      const cachedArticle = articles.value.find(item => item.handle === targetSlug) || null
      if (cachedArticle) {
        article.value = cachedArticle
        loading.value = false
        window.scrollTo({ top: 0, behavior: 'auto' })
        setTimeout(() => {
          scrollBarRef.value?.updateScroll()
        }, 120)
        return
      }
    }

    const fetched = await getBlogArticles()
    if (requestId !== loadRequestId) return

    articles.value = fetched
    article.value = fetched.find(item => item.handle === targetSlug) || null
    loading.value = false

    window.scrollTo({ top: 0, behavior: 'auto' })
    setTimeout(() => {
      scrollBarRef.value?.updateScroll()
    }, 120)
  }

  const ensureDisqus = () => {
    if (!DISQUS_SHORTNAME || typeof window === 'undefined') return

    const scriptId = 'mm-disqus-embed'
    let script = document.getElementById(scriptId)

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`
      script.setAttribute('data-timestamp', String(+new Date()))
      document.body.appendChild(script)
      return
    }

    if (window.DISQUS && article.value) {
      window.DISQUS.reset({
        reload: true,
        config() {
          this.page.url = canonicalUrl.value
          this.page.identifier = article.value.id || article.value.handle
        },
      })
    }
  }

  const resetDisqusObserver = () => {
    if (disqusObserver) {
      disqusObserver.disconnect()
      disqusObserver = null
    }
  }

  const armDisqusObserver = () => {
    if (!article.value || !DISQUS_SHORTNAME || typeof window === 'undefined') return
    const target = disqusThreadRef.value
    if (!target) return

    resetDisqusObserver()

    if (!('IntersectionObserver' in window)) {
      disqusActivated.value = true
      ensureDisqus()
      return
    }

    disqusObserver = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        disqusActivated.value = true
        ensureDisqus()
        resetDisqusObserver()
      },
      {
        root: null,
        rootMargin: '240px 0px',
        threshold: 0.01,
      }
    )

    disqusObserver.observe(target)
  }

  const copyLink = async () => {
    if (!canonicalUrl.value || !navigator.clipboard) return

    try {
      await navigator.clipboard.writeText(canonicalUrl.value)
      trackEvent(ANALYTICS_EVENTS.CTA_SHARE_CLICK, {
        [ANALYTICS_PARAMS.CTA_NAME]: 'share_copy_link',
        [ANALYTICS_PARAMS.LOCATION]: 'blog_post',
        [ANALYTICS_PARAMS.ARTICLE_HANDLE]: article.value?.handle || '',
      })
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 1800)
    } catch (error) {
      console.error('Copy link failed:', error)
    }
  }

  const shareOnFacebook = () => {
    trackEvent(ANALYTICS_EVENTS.CTA_SHARE_CLICK, {
      [ANALYTICS_PARAMS.CTA_NAME]: 'share_facebook',
      [ANALYTICS_PARAMS.LOCATION]: 'blog_post',
      [ANALYTICS_PARAMS.ARTICLE_HANDLE]: article.value?.handle || '',
    })
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl.value}`, '_blank')
  }

  const shareOnTwitter = () => {
    trackEvent(ANALYTICS_EVENTS.CTA_SHARE_CLICK, {
      [ANALYTICS_PARAMS.CTA_NAME]: 'share_twitter',
      [ANALYTICS_PARAMS.LOCATION]: 'blog_post',
      [ANALYTICS_PARAMS.ARTICLE_HANDLE]: article.value?.handle || '',
    })
    window.open(
      `https://twitter.com/intent/tweet?url=${encodedShareUrl.value}&text=${encodedShareTitle.value}`,
      '_blank'
    )
  }

  const shareOnTelegram = () => {
    trackEvent(ANALYTICS_EVENTS.CTA_SHARE_CLICK, {
      [ANALYTICS_PARAMS.CTA_NAME]: 'share_telegram',
      [ANALYTICS_PARAMS.LOCATION]: 'blog_post',
      [ANALYTICS_PARAMS.ARTICLE_HANDLE]: article.value?.handle || '',
    })
    window.open(
      `https://t.me/share/url?url=${encodedShareUrl.value}&text=${encodedShareTitle.value}`,
      '_blank'
    )
  }

  const queueReadProgressCheck = () => {
    if (readProgressRaf) return
    readProgressRaf = window.requestAnimationFrame(() => {
      readProgressRaf = null
      const contentEl = contentRef.value
      if (!contentEl || !article.value) return

      const rect = contentEl.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0
      const total = Math.max(1, rect.height + viewportHeight)
      const seen = Math.min(total, Math.max(0, viewportHeight - rect.top))
      const progress = Math.max(0, Math.min(1, seen / total))

      if (!readHalfReached.value && progress >= 0.5) {
        readHalfReached.value = true
        trackEvent(ANALYTICS_EVENTS.ARTICLE_READ_50, {
          [ANALYTICS_PARAMS.ROUTE]: `/blog/${article.value.handle}`,
          [ANALYTICS_PARAMS.ARTICLE_HANDLE]: article.value.handle,
          [ANALYTICS_PARAMS.ARTICLE_TITLE]: article.value.title,
          [ANALYTICS_PARAMS.PROGRESS]: 50,
        })
      }

      if (!readCompleted.value && progress >= 0.9) {
        readCompleted.value = true
        trackEvent(ANALYTICS_EVENTS.ARTICLE_READ_COMPLETE, {
          [ANALYTICS_PARAMS.ROUTE]: `/blog/${article.value.handle}`,
          [ANALYTICS_PARAMS.ARTICLE_HANDLE]: article.value.handle,
          [ANALYTICS_PARAMS.ARTICLE_TITLE]: article.value.title,
          [ANALYTICS_PARAMS.PROGRESS]: 100,
        })
      }
    })
  }

  const resetReadMilestones = () => {
    readStarted.value = false
    readHalfReached.value = false
    readCompleted.value = false
  }

  const goToNextArticle = () => {
    if (!nextArticle.value) return
    trackEvent(ANALYTICS_EVENTS.CTA_NEXT_ARTICLE_CLICK, {
      [ANALYTICS_PARAMS.ARTICLE_HANDLE]: article.value?.handle || '',
      [ANALYTICS_PARAMS.TARGET]: `/blog/${nextArticle.value.handle}`,
      [ANALYTICS_PARAMS.LOCATION]: 'blog_post_footer',
    })
    router.push(`/blog/${nextArticle.value.handle}`)
  }

  watch(article, value => {
    if (!value) return

    resetReadMilestones()
    if (!readStarted.value) {
      readStarted.value = true
      trackEvent(ANALYTICS_EVENTS.ARTICLE_READ_START, {
        [ANALYTICS_PARAMS.ROUTE]: `/blog/${value.handle}`,
        [ANALYTICS_PARAMS.ARTICLE_HANDLE]: value.handle,
        [ANALYTICS_PARAMS.ARTICLE_TITLE]: value.title,
      })
    }

    useJsonLd([
      generateBlogPostJsonLd(value),
      generateOrganizationJsonLd(),
      generateBreadcrumbJsonLd(value),
    ])

    if (disqusActivated.value) {
      ensureDisqus()
    }

    queueReadProgressCheck()
  })

  watch(
    () => article.value?.handle,
    async handle => {
      if (!handle) return
      await nextTick()
      armDisqusObserver()
    }
  )

  onMounted(() => {
    loadArticle()
    window.addEventListener('scroll', queueReadProgressCheck, { passive: true })
    window.addEventListener('resize', queueReadProgressCheck)
  })

  onBeforeUnmount(() => {
    resetDisqusObserver()
    window.removeEventListener('scroll', queueReadProgressCheck)
    window.removeEventListener('resize', queueReadProgressCheck)
    if (readProgressRaf) {
      window.cancelAnimationFrame(readProgressRaf)
      readProgressRaf = null
    }
  })
  watch(() => route.params.slug, loadArticle)
</script>

<template>
  <DefaultLayout>
    <ScrollProgressBar ref="scrollBarRef" />

    <section v-if="loading" class="mm-post-state">
      <v-progress-circular indeterminate size="26" width="3" color="primary" />
      <span>Завантаження статті...</span>
    </section>

    <section v-else-if="!article" class="mm-post-state mm-post-state--empty">
      <v-icon icon="mdi-file-search-outline" size="22" />
      <span>Статтю не знайдено. Можливо, її було перенесено або видалено.</span>
      <button class="mm-post-action mm-post-action--primary" @click="router.push('/blog')">
        <v-icon icon="mdi-arrow-left" size="16" />
        До списку статей
      </button>
    </section>

    <section v-else class="mm-post">
      <header class="mm-post__hero">
        <nav class="mm-post__breadcrumbs" aria-label="Breadcrumbs">
          <template v-for="(crumb, index) in breadcrumbs" :key="`${crumb.title}-${index}`">
            <router-link v-if="crumb.to" :to="crumb.to">{{ crumb.title }}</router-link>
            <span v-else>{{ crumb.title }}</span>
            <v-icon v-if="index < breadcrumbs.length - 1" icon="mdi-chevron-right" size="14" />
          </template>
        </nav>

        <div class="mm-post__meta-row">
          <div class="mm-post__chips">
            <span v-if="article.tags?.length" class="mm-post-chip">
              <v-icon icon="mdi-tag-multiple-outline" size="14" />
              {{ article.tags[0] }}
            </span>
            <span class="mm-post-chip">
              <v-icon icon="mdi-calendar-month-outline" size="14" />
              {{ formattedDate }}
            </span>
            <span class="mm-post-chip">
              <v-icon icon="mdi-timer-sand" size="14" />
              ~{{ readingTime }} хв
            </span>
          </div>

          <button class="mm-post-action" @click="router.push('/blog')">
            <v-icon icon="mdi-arrow-left" size="16" />
            До блогу
          </button>
        </div>

        <h1 class="mm-post__title">{{ seoPostH1 }}</h1>

        <figure v-if="article.image" class="mm-post__hero-image d-md-none">
          <img v-bind="heroImageAttrs" class="mm-post__hero-image-el" />
        </figure>
      </header>

      <div class="mm-post__layout">
        <article class="mm-post__surface">
          <section ref="contentRef" class="mm-post__content">
            <div v-html="article.contentHtml" class="mm-post__content-inner" />
          </section>

          <section class="mm-post__footer-actions">
            <button class="mm-post-action" @click="router.go(-1)">
              <v-icon icon="mdi-chevron-left" size="16" />
              Назад
            </button>

            <button
              v-if="nextArticle"
              class="mm-post-action mm-post-action--primary"
              @click="goToNextArticle"
            >
              Наступна стаття
              <v-icon icon="mdi-chevron-right" size="16" />
            </button>
          </section>

          <section class="mm-post__mobile-share d-md-none">
            <div class="mm-post__section-head">
              <v-icon icon="mdi-share-variant-outline" size="18" />
              <h2>Поділитися</h2>
            </div>

            <div class="mm-post__share-grid">
              <button class="mm-share-btn" @click="shareOnFacebook" aria-label="Facebook">
                <v-icon size="20" icon="mdi-facebook" />
              </button>
              <button class="mm-share-btn" @click="shareOnTwitter" aria-label="Twitter / X">
                <v-icon size="20" icon="mdi-twitter" />
              </button>
              <button class="mm-share-btn" @click="shareOnTelegram" aria-label="Telegram">
                <v-icon size="20" icon="mdi-send-variant" />
              </button>
              <button class="mm-share-btn mm-share-btn--copy" @click="copyLink" aria-label="Copy link">
                <v-icon size="20" icon="mdi-link-variant" />
              </button>
            </div>
          </section>

          <section class="mm-post__comments">
            <div class="mm-post__section-head">
              <v-icon icon="mdi-comment-multiple-outline" size="20" />
              <h2>Коментарі</h2>
            </div>
            <div id="disqus_thread" ref="disqusThreadRef" />
          </section>
        </article>

        <aside class="mm-post__sidebar">
          <figure v-if="article.image" class="mm-post__hero-image mm-post__hero-image--sidebar d-none d-md-block">
            <img v-bind="heroImageAttrs" class="mm-post__hero-image-el" />
          </figure>

          <section class="mm-post-card d-none d-md-block">
            <div class="mm-post__section-head">
              <v-icon icon="mdi-share-variant-outline" size="20" />
              <h2>Поділитися</h2>
            </div>

            <div class="mm-post__share-grid">
              <button class="mm-share-btn" @click="shareOnFacebook" aria-label="Facebook">
                <v-icon size="20" icon="mdi-facebook" />
              </button>
              <button class="mm-share-btn" @click="shareOnTwitter" aria-label="Twitter / X">
                <v-icon size="20" icon="mdi-twitter" />
              </button>
              <button class="mm-share-btn" @click="shareOnTelegram" aria-label="Telegram">
                <v-icon size="20" icon="mdi-send-variant" />
              </button>
              <button class="mm-share-btn mm-share-btn--copy" @click="copyLink" aria-label="Copy link">
                <v-icon size="20" icon="mdi-link-variant" />
              </button>
            </div>

            <p class="mm-post__share-note">{{ copied ? 'Посилання скопійовано' : 'Скопіюй або поділись у соцмережах' }}</p>
          </section>

          <section class="mm-post__donation">
            <DonationSection />
          </section>
        </aside>
      </div>
    </section>
  </DefaultLayout>
</template>
