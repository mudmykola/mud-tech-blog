<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import { ANALYTICS_EVENTS, ANALYTICS_PARAMS } from '@/analytics/events'
  import { trackEvent } from '@/firebase'

  const title = 'Підтримай ЗСУ'
  const description = 'Допоможи армії наближати перемогу. Кожен донат - це реальна дія.'
  const donateHref = 'https://savelife.in.ua/donate/'
  const donateBtnText = 'Підтримати «Повернись живим»'
  const smallFooter = 'Дякуємо за внесок! Разом до перемоги.'
  const supportPoints = [
    { icon: 'mdi-medical-bag', text: 'Медицина' },
    { icon: 'mdi-drone', text: 'Дрони' },
    { icon: 'mdi-hammer-wrench', text: 'Спорядження' },
  ]

  const isPopupVisible = ref(false)

  const DISPLAY_INTERVAL = 45_000
  const AUTO_HIDE_DELAY = 10_000

  let popupIntervalId
  let popupTimeoutId

  const hidePopup = () => {
    isPopupVisible.value = false
    if (popupTimeoutId) {
      clearTimeout(popupTimeoutId)
      popupTimeoutId = null
    }
  }

  const showPopup = () => {
    isPopupVisible.value = true
    if (popupTimeoutId) clearTimeout(popupTimeoutId)
    popupTimeoutId = setTimeout(() => {
      isPopupVisible.value = false
      popupTimeoutId = null
    }, AUTO_HIDE_DELAY)
  }

  const trackDonationClick = location => {
    trackEvent(ANALYTICS_EVENTS.CTA_DONATION_CLICK, {
      [ANALYTICS_PARAMS.CTA_NAME]: 'donation_support',
      [ANALYTICS_PARAMS.LOCATION]: location,
      [ANALYTICS_PARAMS.TARGET]: donateHref,
    })
  }

  onMounted(() => {
    popupTimeoutId = setTimeout(showPopup, 2000)
    popupIntervalId = setInterval(showPopup, DISPLAY_INTERVAL)
  })

  onUnmounted(() => {
    if (popupIntervalId) clearInterval(popupIntervalId)
    if (popupTimeoutId) clearTimeout(popupTimeoutId)
  })
</script>

<template>
  <section class="mm-donation">
    <h2 class="mm-donation__title">
      <v-icon icon="mdi-hand-heart-outline" size="24" />
      {{ title }}
    </h2>

    <p class="mm-donation__text">{{ description }}</p>

    <div class="mm-donation__support-grid">
      <div v-for="point in supportPoints" :key="point.text" class="mm-donation__support-item">
        <v-icon :icon="point.icon" size="16" />
        <span>{{ point.text }}</span>
      </div>
    </div>

    <v-btn
      :href="donateHref"
      target="_blank"
      rel="noopener"
      class="mm-donation__btn"
      size="large"
      rounded="pill"
      elevation="0"
      @click="trackDonationClick('donation_section')"
    >
      <v-icon icon="mdi-shield-star-outline" start />
      {{ donateBtnText }}
    </v-btn>

    <p class="mm-donation__small">{{ smallFooter }}</p>

    <div class="mm-donation__icons-row">
      <v-icon icon="mdi-heart-flash" size="18" />
      <v-icon icon="mdi-shield-check-outline" size="18" />
      <v-icon icon="mdi-flag-variant-outline" size="18" />
    </div>
  </section>

  <teleport to="body">
    <div class="mm-donation-popup" :class="{ visible: isPopupVisible }">
      <div class="mm-donation-popup__content">
        <v-icon icon="mdi-bell-ring-outline" size="20" class="mm-donation-popup__icon" />
        <div class="mm-donation-popup__text">
          Підтримай ЗСУ
          <span>Твій донат має значення</span>
        </div>

        <v-btn
          :href="donateHref"
          target="_blank"
          rel="noopener"
          size="small"
          rounded="pill"
          class="mm-donation-popup__btn"
          @click="trackDonationClick('donation_popup')"
        >
          <v-icon icon="mdi-heart" start size="14" />
          Донат
        </v-btn>
      </div>

      <button class="mm-donation-popup__close" @click="hidePopup">
        <v-icon icon="mdi-close" size="18" />
      </button>
    </div>
  </teleport>
</template>
