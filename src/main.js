import { createApp } from 'vue'
import App from './App.vue'
import '@/assets/root.scss'
import router from './router'
import '@/assets/styles/main.scss'
import { createHead } from '@vueuse/head'
import { vuetify } from './plugins/vuetify'
import { initThemePalette } from './composables/useThemePalette'
import { enforceCanonicalRedirect } from './utils/canonical'
import { initFirebaseAnalytics, trackPageView } from './firebase'
import { getPageViewRoute } from './analytics/pageViewRoute'

const head = createHead()
initThemePalette()
const redirectedToCanonical = enforceCanonicalRedirect()
const ADSENSE_CLIENT_ID = 'ca-pub-8259582705541308'
const shouldLoadAdSense = import.meta.env.VITE_ENABLE_ADSENSE === 'true'

const loadAdSenseScript = () => {
  if (typeof document === 'undefined') return
  if (document.querySelector('script[data-mm-adsense="true"]')) return

  const adSenseScript = document.createElement('script')
  adSenseScript.async = true
  adSenseScript.crossOrigin = 'anonymous'
  adSenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`
  adSenseScript.dataset.mmAdsense = 'true'
  adSenseScript.onerror = () => {
    console.warn('[adsense] Script blocked or unavailable')
  }

  document.body.appendChild(adSenseScript)
}

if (!redirectedToCanonical) {
  router.afterEach((to, from) => {
    const pageRoute = getPageViewRoute(to, from)
    if (!pageRoute) return

    trackPageView({
      path: pageRoute.path,
      title: document.title,
      location: new URL(pageRoute.locationPath, window.location.origin).href,
    })
  })

  const vueApp = createApp(App)
  vueApp.use(router)
  vueApp.use(vuetify)
  vueApp.use(head)
  vueApp.mount('#app')

  initFirebaseAnalytics()

  if (shouldLoadAdSense) {
    loadAdSenseScript()
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch(err => console.error('SW registration failed:', err))
  })
}
