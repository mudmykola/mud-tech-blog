import { createApp } from 'vue'
import App from './App.vue'
import '@/assets/root.scss'
import router from './router'
import '@/assets/styles/main.scss'
import '@mdi/font/css/materialdesignicons.min.css'
import { createHead } from '@vueuse/head'
import { vuetify } from './plugins/vuetify'
import { initThemePalette } from './composables/useThemePalette'
import { enforceCanonicalRedirect } from './utils/canonical'
import { initFirebaseAnalytics, trackPageView } from './firebase'

const head = createHead()
initThemePalette()
const redirectedToCanonical = enforceCanonicalRedirect()

if (!redirectedToCanonical) {
  router.afterEach(to => {
    trackPageView({
      path: to.fullPath,
      title: document.title,
      location: window.location.href,
    })
  })

  const vueApp = createApp(App)
  vueApp.use(router)
  vueApp.use(vuetify)
  vueApp.use(head)
  vueApp.mount('#app')

  initFirebaseAnalytics()
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('PWA Service Worker registered ✔️'))
      .catch(err => console.error('SW registration failed:', err))
  })
}
