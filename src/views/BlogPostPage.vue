<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useHead } from '@vueuse/head'

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

  const loadArticle = async () => {
    articles.value = await getBlogArticles()
    article.value = articles.value.find(a => a.handle === route.params.slug)

    if (article.value) {
      updateMetaTags()

      setTimeout(() => {
        scrollBarRef.value?.updateScroll()
      }, 300)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

  const goBack = () => {
    router.go(-1)
  }

  const goNext = () => {
    if (nextArticle.value) {
      router.push(`/blog/${nextArticle.value.handle}`)
    }
  }

  const formatDate = date => new Date(date).toLocaleDateString('uk-UA')

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

    const plainText = val.contentHtml.replace(/<[^>]*>/g, '')
    const description = val.excerpt || plainText.slice(0, 180) + '...'
    const url = `${window.location.origin}/blog/${val.handle}`
    const ogImage = val.image?.url || '/default-og.png'

    useHead({
      title: `${val.title} | Mud' Tech Blog`,
      meta: [
        { name: 'description', content: description },

        { property: 'og:title', content: val.title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: url },
        { property: 'og:image', content: ogImage },

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: val.title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
      ],
      link: [{ rel: 'canonical', href: url }],
    })

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
<style lang="scss" scoped>
  .mm-share-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;

    background: var(--color-bg-soft);
    border: 1px solid var(--border-soft);
    color: var(--color-text-muted);

    transition: var(--transition-fast);
    box-shadow: var(--shadow-soft);

    &:hover {
      background: var(--color-accent);
      color: var(--color-bg);
      border-color: var(--color-accent);
      transform: translateY(-2px);
    }

    &:active {
      transform: scale(0.92);
    }
  }

  .mm-share-btn--copy {
    background: var(--color-bg-elevated);

    &:hover {
      background: var(--color-accent-light);
      border-color: var(--color-accent-light);
    }
  }

  .mm-post__share-buttons {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .mm-post__hero-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 18px;
  }

  .mm-post__hero-left {
    flex: 1;
    min-width: 0;
  }

  .mm-post__hero-thumb {
    width: 220px;
    flex-shrink: 0;
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--border-soft);
    box-shadow: var(--shadow-soft);

    img {
      display: block;
      width: 100%;
    }
  }

  .mm-post__crumb-divider {
    color: var(--color-text-muted);
    margin: 0 2px;
  }

  .mm-post {
    margin-block: 40px 70px;
  }

  .mm-post__shell {
    position: relative;
    padding: 28px 24px 40px;
    border-radius: var(--radius-xl);
    background: var(--color-bg-elevated);
    border: 1px solid var(--border-soft);
    box-shadow: var(--shadow-soft);
    overflow: hidden;
  }

  .mm-post__glow {
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, #4da3ff55, #ffcc0040);
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.4;
    pointer-events: none;
  }

  .mm-post__breadcrumbs {
    margin-bottom: 10px;

    :deep(.v-breadcrumbs) {
      padding: 0;
    }
  }

  .mm-post__crumb-link {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--transition-fast);

    &:hover {
      color: var(--color-accent);
    }
  }
  .mm-post__crumb-current,
  .mm-post__crumb-link {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    vertical-align: middle;
  }

  @media (max-width: 768px) {
    .mm-post__crumb-current,
    .mm-post__crumb-link {
      max-width: 120px;
    }
  }

  .mm-post__meta-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    gap: 10px;
  }

  .mm-post__chip {
    font-size: 0.8rem;
    font-weight: 600;
  }

  .mm-post__chip--tag {
    background: rgba(66, 211, 146, 0.12);
    border: 1px solid rgba(66, 211, 146, 0.25);
    border-radius: var(--radius-md);
    color: var(--color-accent);
  }

  .mm-post__meta-top-right {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .mm-post__meta-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 0.78rem;
    color: var(--color-text-muted);
    background: rgba(255, 255, 255, 0.03);
  }

  .mm-post__title {
    font-size: clamp(1.65rem, 4vw, 2.15rem);
    font-weight: 900;
    line-height: 1.14;
    margin-bottom: 14px;
    color: var(--color-text);
    max-width: 90%;
    position: relative;
    padding-left: 12px;
    letter-spacing: -0.3px;
    white-space: normal;
  }

  .mm-post__title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 4px;
    width: 3px;
    height: calc(100% - 6px);
    background: var(--color-accent);
    border-radius: 4px;
    opacity: 0.9;
  }

  .mm-post__info {
    padding: 14px 16px;
    border-radius: var(--radius-lg);
    background:
      radial-gradient(circle at top left, rgba(66, 211, 146, 0.16), transparent 60%),
      rgba(0, 0, 0, 0.42);
    border: 1px solid var(--border-soft);
    margin-bottom: 20px;
  }

  .mm-post__info-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    font-size: 0.9rem;
    color: var(--color-text-soft);
    margin-bottom: 6px;

    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }

  .mm-post__info-row--updated {
    color: var(--color-warning);
  }

  .mm-post__info-tags {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    color: var(--color-text-soft);
  }

  .mm-post__hero-img-wrap {
    margin: 18px 0 24px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-soft);
    border: 1px solid var(--border-soft);
  }

  .mm-post__hero-img {
    display: block;
    width: 100%;
    height: auto;
  }
  .mm-post__donation {
    margin: 10px 0 24px;
  }

  .mm-post__content {
    margin-bottom: 32px;
  }

  .mm-post__content-inner {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--color-text-soft);

    :deep(h2) {
      margin-top: 26px;
      margin-bottom: 12px;
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--color-text);
      border-left: 3px solid var(--color-accent);
      padding-left: 10px;
    }

    :deep(h3) {
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--color-text);
    }

    :deep(p) {
      margin-bottom: 14px;
    }

    :deep(a) {
      color: var(--color-accent);
      text-decoration: underline;
      text-underline-offset: 3px;
      font-weight: 600;
      transition: var(--transition-fast);

      &:hover {
        color: var(--color-accent-light);
      }
    }

    :deep(ul),
    :deep(ol) {
      padding-left: 1.3rem;
      margin-bottom: 14px;
    }

    :deep(li) {
      margin-bottom: 4px;
    }

    :deep(code) {
      font-family: 'JetBrains Mono', monospace;
      background: rgba(255, 255, 255, 0.06);
      padding: 3px 7px;
      border-radius: var(--radius-sm);
      font-size: 0.95em;
      color: var(--color-accent);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    :deep(pre) {
      background: #0b0e12;
      color: var(--color-text);
      font-family: 'JetBrains Mono', monospace;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-soft);
      padding: 16px 18px;
      overflow-x: auto;
      white-space: pre;
      margin: 18px 0;
      font-size: 0.95rem;
      line-height: 1.55;
      box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.5);

      scrollbar-width: thin;
      scrollbar-color: var(--color-accent) transparent;
    }

    :deep(pre::-webkit-scrollbar) {
      height: 6px;
    }

    :deep(pre::-webkit-scrollbar-thumb) {
      background: var(--color-accent);
      border-radius: 6px;
    }

    :deep(blockquote) {
      border-left: 3px solid var(--color-accent);
      padding-left: 16px;
      margin: 20px 0;
      color: var(--color-text-muted);
      font-style: italic;
      font-size: 1.05rem;
    }

    :deep(img) {
      max-width: 100%;
      border-radius: var(--radius-md);
      margin: 16px 0;
      box-shadow: var(--shadow-soft);
      display: block;
    }
  }

  .mm-post__share {
    border-top: 1px solid var(--border-soft);
    padding-top: 18px;
    margin-bottom: 24px;
  }

  .mm-post__share-header {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: var(--color-text-soft);
    margin-bottom: 12px;
  }

  .mm-post__share-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .mm-post__nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }

  .mm-post__comments {
    border-top: 1px solid var(--border-soft);
    padding-top: 18px;
  }

  .mm-post__comments-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    h2 {
      font-size: 1.1rem;
      font-weight: 700;
    }
  }

  @media (max-width: 768px) {
    .mm-post__content-inner {
      font-size: 0.9rem;
      line-height: 1.7;

      :deep(pre) {
        font-size: 0.8rem;
        line-height: 1.5;
      }
    }
    .mm-post {
      margin-top: 0.6rem;
      padding: 0;
    }
    .mm-post__shell {
      padding: 20px 16px 30px;
    }

    .mm-post__hero-top {
      flex-direction: column;
      gap: 12px;
    }

    .mm-post__hero-thumb {
      width: 100%;
    }

    .mm-post__title {
      max-width: 100%;
      font-size: 1.65rem;
      padding-left: 10px;
    }

    .mm-post__title::before {
      width: 2px;
    }

    .mm-post__nav {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
