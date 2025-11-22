<script setup>
  import { watch } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  watch(
    route,
    () => {
      const pageTitle = route.meta.title || "Mud' Tech Blog"
      document.title = pageTitle
    },
    { immediate: true }
  )
</script>

<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>
