<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { watch } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();

// Дивимося на зміну маршруту і оновлюємо заголовок
watch(route, () => {
  const pageTitle = route.meta.title || "Mud' Tech Blog";
  document.title = pageTitle;
}, { immediate: true });
</script>