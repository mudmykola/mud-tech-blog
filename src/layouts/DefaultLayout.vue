<script setup>
import { ref, onMounted } from 'vue';
import NavigationComponent from '@/components/navigation/NavigationComponent.vue';

const currentYear = ref(new Date().getFullYear());
const loading = ref(true);

onMounted(() => {
  // Емулюємо завантаження сторінки
  setTimeout(() => {
    loading.value = false; // Зупиняємо спінер після завантаження
  }, 200);

  setInterval(() => {
    currentYear.value = new Date().getFullYear();
  }, 1000 * 60 * 60 * 24);
});
</script>

<template>
  <div class="layout">
    <NavigationComponent />

    <!-- Спінер відображається, поки loading=true -->
    <div v-if="loading" class="spinner-container">
      <div class="spinner">
        <div class="drop"></div>
        <div class="drop"></div>
        <div class="drop"></div>
      </div>
    </div>

    <!-- Основний контент відображається, коли loading=false -->
    <main v-else>
      <slot />
    </main>

    <footer>© {{ currentYear }} Mud' Tech Blog</footer>
  </div>
</template>

<style scoped>
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

/* Спінер */
.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  height: 100%;
  background-color: var(--primary-dark);
}

.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.spinner .drop {
  width: 10px;
  height: 10px;
  background: var(--primary-light);
  border-radius: 50%;
  animation: drop 1.5s infinite;
}

.spinner .drop:nth-child(2) {
  animation-delay: 0.2s;
}

.spinner .drop:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes drop {
  0%, 80%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(2);
    opacity: 1;
  }
}

/* 📱 Адаптація під мобільні пристрої */
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
