<script setup>
  import { ref, onMounted } from 'vue'

  const currentYear = ref(new Date().getFullYear())

  onMounted(() => {
    setInterval(
      () => {
        currentYear.value = new Date().getFullYear()
      },
      1000 * 60 * 60 * 24
    )
  })
</script>

<template>
  <footer>© {{ currentYear }} Mud' Tech Blog</footer>
</template>
