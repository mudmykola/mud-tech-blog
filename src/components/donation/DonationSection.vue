<script setup>
  import { ref, onMounted } from 'vue'

  const badgeIcon = 'mdi-shield-star'
  const title = 'Підтримай ЗСУ'
  const description = `
  Допоможи армії наближати перемогу.
  <br />Кожен донат — це реальна дія. 🇺🇦
`
  const donateHref = 'https://savelife.in.ua/donate/'
  const donateBtnText = 'Підтримати «Повернись живим»'
  const donateBtnIcon = 'mdi-heart'
  const smallFooter = 'Дякуємо за внесок! Разом до перемоги.'

  const isPopupVisible = ref(false)

  const DISPLAY_INTERVAL = 45_000
  const AUTO_HIDE_DELAY = 10_000

  const showPopup = () => {
    isPopupVisible.value = true
    setTimeout(() => (isPopupVisible.value = false), AUTO_HIDE_DELAY)
  }

  onMounted(() => {
    setTimeout(showPopup, 2000)
    setInterval(showPopup, DISPLAY_INTERVAL)
  })
</script>

<template>
  <div class="mm-donation">
    <div class="mm-donation__badge">
      <v-icon :icon="badgeIcon" size="32" />
    </div>

    <h2 class="mm-donation__title">{{ title }}</h2>

    <p class="mm-donation__text" v-html="description" />

    <v-btn
      :href="donateHref"
      target="_blank"
      rel="noopener"
      class="mm-donation__btn"
      size="large"
      rounded="lg"
      elevation="0"
    >
      {{ donateBtnText }}
    </v-btn>

    <p class="mm-donation__small">{{ smallFooter }}</p>
  </div>

  <div class="mm-donation-popup" :class="{ visible: isPopupVisible }">
    <div class="mm-donation-popup__content">
      <v-icon icon="mdi-alert" size="20" class="mm-donation-popup__icon" />
      <div class="mm-donation-popup__text">
        Підтримай ЗСУ 🇺🇦
        <span>Твій донат має значення</span>
      </div>

      <v-btn
        :href="donateHref"
        target="_blank"
        rel="noopener"
        size="small"
        rounded="lg"
        class="mm-donation-popup__btn"
      >
        Донат
      </v-btn>
    </div>

    <button class="mm-donation-popup__close" @click="isPopupVisible = false">
      <v-icon icon="mdi-close" size="18" />
    </button>
  </div>
</template>