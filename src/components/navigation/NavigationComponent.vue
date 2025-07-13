<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const isMenuOpen = ref(false)
  const isHeaderVisible = ref(true)
  const route = useRoute()
  const router = useRouter()

  const toggleMenu = () => (isMenuOpen.value = !isMenuOpen.value)
  const closeMenu = () => (isMenuOpen.value = false)

  const isActive = path => {
    if (path === '/') return route.path === '/'
    return route.path.startsWith(path)
  }

  const navLinks = computed(() =>
    router
      .getRoutes()
      .filter(r => r.meta?.showInNav)
      .map(r => ({
        path: r.path,
        label: r.meta.label,
      }))
  )

  let lastScrollY = 0
  const handleScroll = () => {
    const currentScrollY = window.scrollY
    isHeaderVisible.value = currentScrollY < lastScrollY || currentScrollY < 50
    lastScrollY = currentScrollY
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
  <nav class="navbar" :class="{ hidden: !isHeaderVisible }">
    <div class="nav-container">
      <router-link to="/" class="logo" @click="closeMenu">
        <span class="mud">Mud'</span>
        <span class="tech">Tech</span>
        <span class="blog">Blog</span>
      </router-link>

      <button class="burger-menu" @click="toggleMenu">☰</button>

      <div v-if="isMenuOpen" class="overlay" @click="closeMenu"></div>

      <div class="mobile-menu" :class="{ open: isMenuOpen }">
        <button class="close-btn" @click="closeMenu">✖</button>
        <ul>
          <li v-for="link in navLinks" :key="link.path">
            <router-link
              :to="link.path"
              :class="{ active: isActive(link.path) }"
              @click="closeMenu"
            >
              {{ link.label }}
            </router-link>
          </li>
        </ul>
      </div>

      <ul class="nav-links">
        <li v-for="link in navLinks" :key="link.path">
          <router-link :to="link.path" :class="{ active: isActive(link.path) }">
            {{ link.label }}
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>
