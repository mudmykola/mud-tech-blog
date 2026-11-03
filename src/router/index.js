import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/home/index.vue'
const BlogListPage = () => import('@/views/blog/index.vue')
const BlogPostPage = () => import('@/views/blog/[slug].vue')
import { setMetaTag, setCanonicalLink, setMetaProperty } from '@/utils/meta'
import { buildCanonicalUrl } from '@/utils/canonical'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'Технологічний блог про Frontend, AI та eCommerce | Mud Tech Blog',
      description:
        'Практичний техноблог українською про frontend-розробку, Vue, eCommerce, AI та продуктивність. Публікуємо покрокові гайди, огляди інструментів і робочі рішення для реальних проєктів.',
      showInNav: true,
      label: 'Головна',
      icon: 'mdi-home',
    },
  },
  {
    path: '/blog',
    name: 'blog',
    component: BlogListPage,
    meta: {
      title: 'Блог статей про Frontend, Vue та eCommerce | Mud Tech Blog',
      description:
        'У розділі блогу зібрані практичні статті про frontend, Vue, Shopify, eCommerce архітектуру та оптимізацію продуктивності. Читай покрокові матеріали з реальними прикладами впровадження.',
      showInNav: true,
      label: 'Блог',
      icon: 'mdi-post-outline',
    },
  },
  {
    path: '/blog/:slug',
    name: 'article',
    component: BlogPostPage,
    meta: {
      title: "Завантаження... – Mud' Tech Blog",
      description:
        "Стаття Mud' Tech Blog: практичний розбір технологій, інструментів і рішень для сучасної веб-розробки.",
      showInNav: true,
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/about/index.vue'),
    meta: {
      title: 'Про автора та досвід у Frontend eCommerce | Mud Tech Blog',
      description:
        "Дізнайся більше про Миколу — frontend eCommerce розробника з практичним досвідом у Vue, Shopify та оптимізації UX. На сторінці зібрано стек технологій, проєкти та канали зв'язку.",
      showInNav: true,
      label: 'Про мене',
      icon: 'mdi-account-circle',
    },
  },
  {
    path: '/updates',
    name: 'updates',
    component: () => import('@/views/updates/index.vue'),
    meta: {
      title: 'Оновлення Mud Tech Blog: релізи, фікси й покращення',
      description:
        'Сторінка оновлень Mud Tech Blog містить історію релізів, виправлень і нових функцій. Відстежуй прогрес проєкту, зміни в UX, SEO-поліпшення та технічні доробки.',
      showInNav: true,
      label: 'Оновлення',
      icon: 'mdi-history',
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const twitterSite = import.meta.env.VITE_TWITTER_SITE || ''

router.afterEach(to => {
  // Article page manages its SEO head in component to avoid competing updates.
  if (to.name === 'article') return

  const defaultRobots =
    'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
  const canonicalUrl = buildCanonicalUrl(to.path)
  const description = to.meta.description || 'Технологічний блог про новітні тренди.'
  const title = to.meta.title || "Mud' Tech Blog"
  const fallbackImage = buildCanonicalUrl('/pwa-512x512.png')

  // Title
  document.title = title

  // Description
  setMetaTag('description', description)

  // Robots
  // Якщо в meta явно вказано noindex — робимо noindex,nofollow
  const robotsValue = to.meta.robots || defaultRobots
  setMetaTag('robots', robotsValue)
  setMetaTag('googlebot', robotsValue)

  // Other meta fields
  setMetaTag('generator', to.meta.generator || 'Vue.js + Vite + Shopify')
  setMetaTag('cms', to.meta.cms || 'Shopify Headless CMS')

  // Open Graph + Twitter defaults for non-article pages
  setMetaProperty('og:title', title)
  setMetaProperty('og:description', description)
  setMetaProperty('og:type', 'website')
  setMetaProperty('og:url', canonicalUrl)
  setMetaProperty('og:image', fallbackImage)
  setMetaProperty('og:site_name', 'Mud Tech Blog')
  setMetaProperty('og:locale', 'uk_UA')
  setMetaTag('twitter:card', 'summary_large_image')
  setMetaTag('twitter:title', title)
  setMetaTag('twitter:description', description)
  setMetaTag('twitter:image', fallbackImage)
  if (twitterSite) {
    setMetaTag('twitter:site', twitterSite)
  }

  // Canonical
  setCanonicalLink(canonicalUrl)
})

export default router
