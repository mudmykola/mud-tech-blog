import { createApp } from 'vue';
import App from './App.vue';
import '@/assets/base.css';
import router from './router';
import { app as firebaseApp, analytics } from './firebase';


console.log('Firebase App:', firebaseApp);
console.log('Firebase Analytics:', analytics);

const vueApp = createApp(App);
vueApp.use(router);
vueApp.mount('#app');
