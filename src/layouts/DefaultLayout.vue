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
import { ref, onMounted } from 'vue';
import NavigationComponent from '@/components/navigation/NavigationComponent.vue';
import SpinnerComponent from "@/components/ui/SpinnerComponent.vue";
import FooterComponent from "@/components/footer/FooterComponent.vue";

const loading = ref(true);
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 300);
});
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex-grow: 1;
  padding: 20px;
}

footer {
  text-align: center;
  padding: 12px;
  background: var(--primary-dark);
  font-weight: 500;
  color: var(--primary-light);
  font-size: 14px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
}




@media (max-width: 768px) {
  main {
    padding: 10px;
  }

  footer {
    font-size: 12px;
    padding: 10px;
  }
}
</style>
