<template>
  <Teleport to="body">
    <div class="scroll-progress-bar" :style="{ width: scrollProgress + '%' }"></div>
  </Teleport>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, defineExpose } from 'vue'

  const scrollProgress = ref(0)

  const updateScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.value =
      docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0
  }

  onMounted(() => {
    updateScroll()
    window.addEventListener('scroll', updateScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', updateScroll)
  })

  // 💡 expose функцію
  defineExpose({ updateScroll })
</script>

<style>
  .scroll-progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background-color: var(--color-accent-light); /* Tailwind yellow-400 */
    z-index: 9999;
    transition: width 0.2s ease;
  }
</style>
