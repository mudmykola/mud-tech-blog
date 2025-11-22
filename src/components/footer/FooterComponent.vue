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
  <footer class="mm-footer">
    <div class="mm-footer__inner">
      <p class="mm-footer__text">© {{ currentYear }} MudTech Blog · All rights reserved</p>
    </div>
  </footer>
</template>
