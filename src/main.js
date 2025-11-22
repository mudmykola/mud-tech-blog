import { createApp } from 'vue'
import App from './App.vue'
import '@/assets/root.scss'
import router from './router'
import { app as firebaseApp, analytics } from './firebase'
import '@/assets/styles/main.scss'
import '@mdi/font/css/materialdesignicons.min.css'
import { createHead } from '@vueuse/head'
import { vuetify } from './plugins/vuetify'

console.log('Firebase App:', firebaseApp)
console.log('Firebase Analytics:', analytics)

const head = createHead()

const vueApp = createApp(App)
vueApp.use(router)
vueApp.use(vuetify)
vueApp.use(head)
vueApp.mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('PWA Service Worker registered ✔️'))
      .catch(err => console.error('SW registration failed:', err))
  })
}
