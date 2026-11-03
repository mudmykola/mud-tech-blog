<script setup>
  import { ref, onMounted } from 'vue'

  const deferredPrompt = ref(null)
  const showBanner = ref(false)

  const AUTO_HIDE_MS = 12000

  onMounted(() => {
    if (localStorage.getItem('pwaDismissed')) return

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      deferredPrompt.value = e
      showBanner.value = true

      setTimeout(() => {
        showBanner.value = false
      }, AUTO_HIDE_MS)
    })
  })

  const installPWA = async () => {
    if (!deferredPrompt.value) return
    deferredPrompt.value.prompt()

    await deferredPrompt.value.userChoice
    deferredPrompt.value = null
    showBanner.value = false
  }

  const closeBanner = () => {
    localStorage.setItem('pwaDismissed', 'true')
    showBanner.value = false
  }
</script>

<template>
  <v-slide-y-transition>
    <div v-if="showBanner" class="mm-pwa-banner">
      <div class="mm-pwa-banner__content">
        <v-icon class="mm-pwa-banner__icon" icon="mdi-cellphone-arrow-down" />
        <span>Встановити додаток?</span>
      </div>

      <div class="mm-pwa-banner__actions">
        <v-btn color="primary" variant="flat" size="small" rounded @click="installPWA">
          <v-icon icon="mdi-download" start />
          Встановити
        </v-btn>
        <v-btn icon variant="text" @click="closeBanner">
          <v-icon icon="mdi-close" />
        </v-btn>
      </div>
    </div>
  </v-slide-y-transition>
</template>
