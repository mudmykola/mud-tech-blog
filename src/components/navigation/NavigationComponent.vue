<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Logo from '@/components/ui/Logo.vue'
  import InstallPWA from '@/components/pwa/InstallPWA.vue'

  const drawer = ref(false)
  const isHeaderVisible = ref(true)

  const route = useRoute()
  const router = useRouter()

  const navLinks = computed(() =>
    router
      .getRoutes()
      .filter(r => r.meta?.showInNav && !r.path.includes(':'))
      .map(r => ({
        path: r.path,
        label: r.meta.label,
        icon: r.meta.icon || null,
      }))
  )

  const isActive = path => {
    if (path === '/') return route.path === '/'
    return route.path.startsWith(path)
  }

  let lastScrollY = 0
  const handleScroll = () => {
    const y = window.scrollY
    isHeaderVisible.value = y < lastScrollY || y < 40
    lastScrollY = y
  }

  onMounted(() => {
    lastScrollY = window.scrollY
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
</script>

<template>
  <v-app-bar height="64" flat class="mm-nav" :class="{ 'mm-nav--hidden': !isHeaderVisible }">
    <v-container class="d-flex align-center justify-space-between">
      <Logo />
      <div class="d-none d-md-flex align-center gap-4">
        <v-btn
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          variant="text"
          class="mm-nav-btn"
          :class="{ 'mm-nav-btn--active': isActive(link.path) }"
        >
          <v-icon v-if="link.icon" :icon="link.icon" size="18" />
          {{ link.label }}
        </v-btn>
        <InstallPWA />
      </div>

      <v-btn icon class="d-md-none" @click="drawer = true">
        <v-icon icon="mdi-menu" size="32" />
      </v-btn>
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary location="right" width="260" class="mm-drawer">
    <div class="mm-drawer__header">
      <span class="mm-drawer__title">Меню</span>
      <v-btn class="mm-btn-close" icon @click="drawer = false">
        <v-icon icon="mdi-close" />
      </v-btn>
    </div>

    <v-divider class="mb-2"></v-divider>

    <v-list density="comfortable">
      <v-list-item v-for="link in navLinks" :key="link.path" @click="drawer = false">
        <router-link
          :to="link.path"
          class="mm-drawer__link"
          :class="{ 'mm-drawer__link--active': isActive(link.path) }"
        >
          <v-icon v-if="link.icon" :icon="link.icon" size="20" class="mm-drawer__icon" />
          {{ link.label }}
        </router-link>
      </v-list-item>

      <v-list-item class="mt-2">
        <InstallPWA />
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
