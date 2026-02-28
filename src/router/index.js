import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
const BlogListPage = () => import('@/views/BlogListPage.vue')
const BlogPostPage = () => import('@/views/BlogPostPage.vue')
import { setMetaTag, setCanonicalLink } from '@/utils/meta'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: "Головна | Mud' Tech Blog",
      description: 'Опис для головної сторінки.',
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
      title: "Блог | Mud' Tech Blog",
      description: 'Опис для сторінки блогу.',
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
      description: 'Опис для статті.',
      showInNav: true,
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/about/AboutPage.vue'),
    meta: {
      title: "Про мене | Mud' Tech Blog",
      description: 'Дізнайся більше про автора блогу: стек, досвід, проєкти та контакти.',
      showInNav: true,
      label: 'Про мене',
      icon: 'mdi-account-circle',
    },
  },
  {
    path: '/updates',
    name: 'updates',
    component: () => import('@/views/UpdatesPage.vue'),
    meta: {
      title: "Оновлення | Mud' Tech Blog",
      description: 'Журнал змін, виправлень і нових функцій проєкту.',
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

const serverIp = import.meta.env.VITE_SERVER_IP
if (!serverIp) {
  console.warn('VITE_SERVER_IP не встановлено')
} else {
  console.log('IP:', serverIp)
}

router.afterEach(to => {
  // Title
  document.title = to.meta.title || "Mud' Tech Blog"

  // Description
  setMetaTag('description', to.meta.description || 'Технологічний блог про новітні тренди.')

  // Robots
  // Якщо в meta явно вказано noindex — робимо noindex,nofollow
  const robotsValue = to.meta.robots || 'index, follow'
  setMetaTag('robots', robotsValue)

  // Other meta fields
  setMetaTag('generator', to.meta.generator || 'Vue.js + Vite + Shopify')
  setMetaTag('cms', to.meta.cms || 'Shopify Headless CMS')

  // Canonical
  setCanonicalLink(window.location.origin + to.fullPath)
})

export default router
