<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Logo from '@/components/ui/Logo.vue'

  const route = useRoute()
  const router = useRouter()

  const navLinks = computed(() =>
    router
      .getRoutes()
      .filter(r => r.meta?.showInNav && !r.path.includes(':'))
      .map(r => ({
        path: r.path,
        label: r.meta.label,
        icon: r.meta.icon || 'mdi-circle-medium',
      }))
  )

  const isActive = path => {
    if (path === '/') return route.path === '/'
    return route.path.startsWith(path)
  }

  const currentSectionLabel = computed(() => {
    const current = navLinks.value.find(link => isActive(link.path))
    return current?.label || "Mud' Tech Blog"
  })

  const clock = ref('--:--')
  const dateLabel = ref('--')
  let clockTimer

  const formatClockData = () => {
    const now = new Date()
    clock.value = now.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    })
    dateLabel.value = now.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  onMounted(() => {
    formatClockData()
    clockTimer = setInterval(formatClockData, 30_000)
  })

  onUnmounted(() => {
    if (clockTimer) clearInterval(clockTimer)
  })
</script>

<template>
  <header>
    <div class="mm-nav d-none d-md-flex">
      <div class="mm-nav__inner">
        <Logo />

        <nav class="mm-nav__links" aria-label="Desktop navigation">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="mm-nav-btn"
            :class="{ 'mm-nav-btn--active': isActive(link.path) }"
          >
            <v-icon :icon="link.icon" size="18" />
            <span>{{ link.label }}</span>
          </router-link>
        </nav>

        <div class="mm-nav__widgets">
          <div class="mm-nav-widget">
            <v-icon icon="mdi-clock-time-eight-outline" size="16" />
            <span>{{ clock }}</span>
          </div>
          <div class="mm-nav-widget">
            <v-icon icon="mdi-calendar-month-outline" size="16" />
            <span>{{ dateLabel }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mm-nav-mobile-top d-md-none">
      <Logo />
      <div class="mm-nav-mobile-top__meta">
        <div class="mm-nav-mobile-top__current">
          <v-icon icon="mdi-navigation-variant-outline" size="16" />
          <span>{{ currentSectionLabel }}</span>
        </div>
        <div class="mm-nav-mobile-top__clock">
          <v-icon icon="mdi-clock-outline" size="14" />
          <span>{{ clock }}</span>
        </div>
      </div>
    </div>

    <nav
      class="mm-bottom-nav d-md-none"
      aria-label="Mobile app navigation"
      :style="{ gridTemplateColumns: `repeat(${Math.max(navLinks.length, 1)}, minmax(0, 1fr))` }"
    >
      <router-link
        v-for="link in navLinks"
        :key="`mobile-${link.path}`"
        :to="link.path"
        class="mm-bottom-nav__item"
        :class="{ 'mm-bottom-nav__item--active': isActive(link.path) }"
      >
        <v-icon :icon="link.icon" size="22" />
        <span>{{ link.label }}</span>
      </router-link>
    </nav>
  </header>
</template>
