<script setup>
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Logo from '@/components/ui/Logo.vue'
  import ThemePaletteSwitcher from '@/components/ui/ThemePaletteSwitcher.vue'
  import { useSavedArticles } from '@/composables/useSavedArticles'
  import navigationText from '@/data/navigation.json'
  import savedArticlesText from '@/data/saved-articles.json'

  const route = useRoute()
  const router = useRouter()
  const { savedArticleCount, savedLibraryOpen, openSavedLibrary } = useSavedArticles()
  const mobileMetaDetails = ref(null)

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

  const closeMobileMeta = () => {
    if (mobileMetaDetails.value) mobileMetaDetails.value.open = false
  }

  const openSavedLibraryFromMobile = () => {
    closeMobileMeta()
    openSavedLibrary()
  }

  const handleMobileMetaOutside = event => {
    if (!mobileMetaDetails.value?.contains(event.target)) closeMobileMeta()
  }

  const handleMobileMetaKeydown = event => {
    if (event.key !== 'Escape' || !mobileMetaDetails.value?.open) return
    event.preventDefault()
    closeMobileMeta()
    mobileMetaDetails.value.querySelector('summary')?.focus()
  }

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
    document.addEventListener('pointerdown', handleMobileMetaOutside)
    document.addEventListener('keydown', handleMobileMetaKeydown)
  })

  onUnmounted(() => {
    if (clockTimer) clearInterval(clockTimer)
    document.removeEventListener('pointerdown', handleMobileMetaOutside)
    document.removeEventListener('keydown', handleMobileMetaKeydown)
  })
</script>

<template>
  <header>
    <div class="mm-nav d-none d-md-flex">
      <div class="mm-nav__inner">
        <Logo />

        <nav class="mm-nav__links" :aria-label="navigationText.primaryNavigation">
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
          <ThemePaletteSwitcher />
          <button
            class="mm-nav__bookmark"
            type="button"
            aria-haspopup="dialog"
            aria-controls="mm-saved-library"
            :aria-expanded="savedLibraryOpen"
            :aria-label="`${savedArticlesText.navLabel}: ${savedArticleCount}`"
            :title="savedArticlesText.navLabel"
            @click="openSavedLibrary"
          >
            <v-icon icon="mdi-bookmark-multiple-outline" size="18" aria-hidden="true" />
            <span v-if="savedArticleCount" class="mm-nav__bookmark-count" aria-hidden="true">
              {{ savedArticleCount }}
            </span>
          </button>
          <div class="mm-nav-widget" :aria-label="navigationText.clockLabel">
            <v-icon icon="mdi-clock-time-eight-outline" size="16" aria-hidden="true" />
            <span>{{ clock }}</span>
          </div>
          <div class="mm-nav-widget" :aria-label="navigationText.dateLabel">
            <v-icon icon="mdi-calendar-month-outline" size="16" aria-hidden="true" />
            <span>{{ dateLabel }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="mm-nav-mobile-top d-md-none">
      <Logo />
      <details ref="mobileMetaDetails" class="mm-nav-mobile-top__details">
        <summary
          class="mm-nav-mobile-top__toggle"
          :aria-label="navigationText.quickSettings"
          :title="navigationText.quickSettings"
        >
          <v-icon icon="mdi-cog-outline" size="18" aria-hidden="true" />
        </summary>
        <div
          class="mm-nav-mobile-top__meta"
          role="group"
          :aria-label="navigationText.quickSettings"
        >
          <div class="mm-nav-mobile-top__current">
            <span>{{ currentSectionLabel }}</span>
          </div>
          <div class="mm-nav-mobile-top__clock">
            <v-icon icon="mdi-clock-outline" size="13" aria-hidden="true" />
            <span>{{ clock }}</span>
          </div>
          <button
            class="mm-nav__bookmark mm-nav__bookmark--mobile"
            type="button"
            aria-haspopup="dialog"
            aria-controls="mm-saved-library"
            :aria-expanded="savedLibraryOpen"
            :aria-label="`${savedArticlesText.navLabel}: ${savedArticleCount}`"
            :title="savedArticlesText.navLabel"
            @click="openSavedLibraryFromMobile"
          >
            <v-icon icon="mdi-bookmark-multiple-outline" size="15" aria-hidden="true" />
            <span v-if="savedArticleCount" class="mm-nav__bookmark-count" aria-hidden="true">
              {{ savedArticleCount }}
            </span>
          </button>
          <ThemePaletteSwitcher compact />
        </div>
      </details>
    </div>

    <nav
      class="mm-bottom-nav d-md-none"
      :aria-label="navigationText.mobileNavigation"
      :style="{ gridTemplateColumns: `repeat(${Math.max(navLinks.length, 1)}, minmax(0, 1fr))` }"
    >
      <router-link
        v-for="link in navLinks"
        :key="`mobile-${link.path}`"
        :to="link.path"
        class="mm-bottom-nav__item"
        :class="{ 'mm-bottom-nav__item--active': isActive(link.path) }"
      >
        <v-icon :icon="link.icon" size="19" />
        <span>{{ link.label }}</span>
      </router-link>
    </nav>
  </header>
</template>
