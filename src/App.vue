<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAnalytics } from '@/composable/useAnalytics.js'

const route = useRoute();

const { loadGA } = useAnalytics()

onMounted(() => {
  loadGA()
})

// Дивимося на зміну маршруту і оновлюємо заголовок
watch(route, () => {
  const pageTitle = route.meta.title || "Mud' Tech Blog";
  document.title = pageTitle;
}, { immediate: true });
</script>