<script setup>
  import { onMounted, ref } from 'vue'
  import NavigationComponent from '@/components/navigation/NavigationComponent.vue'
  import SpinnerComponent from '@/components/ui/SpinnerComponent.vue'
  import FooterComponent from '@/components/footer/FooterComponent.vue'
  import InstallPWA from '@/components/pwa/InstallPWA.vue'

  const loading = ref(true)
  onMounted(() => {
    setTimeout(() => {
      loading.value = false
    }, 300)
  })

  const currentYear = new Date().getFullYear()
</script>
<template>
  <div class="layout">
    <InstallPWA />
    <NavigationComponent />
    <SpinnerComponent v-if="loading" :loading="loading" />
    <main v-else>
      <slot />
    </main>
    <FooterComponent />
  </div>
</template>
