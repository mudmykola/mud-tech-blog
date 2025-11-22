import { createApp } from 'vue'
import App from './App.vue'
import '@/assets/root.scss'
import router from './router'
import { app as firebaseApp, analytics } from './firebase'
import '@/assets/styles/main.scss'
import '@mdi/font/css/materialdesignicons.min.css'

import { vuetify } from './plugins/vuetify'

console.log('Firebase App:', firebaseApp)
console.log('Firebase Analytics:', analytics)

const vueApp = createApp(App)
vueApp.use(router)
vueApp.use(vuetify)
vueApp.mount('#app')
