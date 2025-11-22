<template>
  <div class="layout">
    <NavigationComponent />
    <SpinnerComponent v-if="loading" :loading="loading" />
    <main v-else>
      <slot />
    </main>
    <FooterComponent :year="currentYear" />
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import NavigationComponent from '@/components/navigation/NavigationComponent.vue'
  import SpinnerComponent from '@/components/ui/SpinnerComponent.vue'
  import FooterComponent from '@/components/footer/FooterComponent.vue'

  const loading = ref(true)
  onMounted(() => {
    setTimeout(() => {
      loading.value = false
    }, 300)
  })
</script>
