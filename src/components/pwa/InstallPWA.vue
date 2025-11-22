<script setup>
  import { ref, onMounted } from 'vue'

  const deferredPrompt = ref(null)
  const showBanner = ref(false)

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', e => {
      console.log('📲 beforeinstallprompt FIRED')
      e.preventDefault()
      deferredPrompt.value = e
      showBanner.value = true
    })
  })

  const installPWA = async () => {
    if (!deferredPrompt.value) return

    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted installation')
    }

    deferredPrompt.value = null
    showBanner.value = false
  }

  const closeBanner = () => {
    showBanner.value = false
  }
</script>

<template>
  <v-slide-y-transition>
    <div v-if="showBanner" class="mm-pwa-banner">
      <div class="mm-pwa-banner__content">
        <v-icon class="mm-pwa-banner__icon" icon="mdi-cellphone-arrow-down" />
        <span class="mm-pwa-banner__text">Встановити додаток?</span>
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

<style scoped>
  .mm-pwa-banner {
    position: fixed;
    bottom: 18px;
    right: 18px;
    left: 18px;
    padding: 16px 18px;
    border-radius: 18px;
    backdrop-filter: blur(12px);
    background: rgba(22, 25, 32, 0.92);
    border: 1px solid rgba(88, 255, 170, 0.22);

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;

    box-shadow: 0 0 26px rgba(88, 255, 170, 0.25);
    z-index: 2000;
  }

  .mm-pwa-banner__content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mm-pwa-banner__icon {
    color: var(--color-accent);
    font-size: 28px;
  }

  .mm-pwa-banner__text {
    font-weight: 700;
    font-size: 1.05rem;
  }

  .mm-pwa-banner__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
