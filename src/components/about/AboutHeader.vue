<script setup>
  const avatar = '/images/about-avatar.webp'
  const title = 'Я Микола, веб-інженер та розробник'
  const subtitle = 'Frontend Developer'
  const specialties = [
    { label: 'Vue / Nuxt', icon: 'mdi-vuejs' },
    { label: 'Shopify', icon: 'mdi-shopping-outline' },
    { label: 'UX + продуктивність', icon: 'mdi-speedometer' },
  ]
</script>

<template>
  <section class="mm-about-header" aria-labelledby="mm-about-header-title">
    <div class="mm-about-header__media">
      <div class="mm-about-avatar-wrap">
        <img :src="avatar" alt="Микола, автор Mud Tech Blog" class="mm-about-avatar" />
        <span class="mm-about-avatar-wrap__index" aria-hidden="true">MT / 01</span>
      </div>
    </div>

    <div class="mm-about-header__content">
      <div class="mm-about-header__eyebrow">
        <span class="mm-about-header__eyebrow-mark" aria-hidden="true"></span>
        <span>ПРО АВТОРА</span>
        <span class="mm-about-header__eyebrow-rule" aria-hidden="true"></span>
        <span class="mm-about-header__eyebrow-brand">MUD TECH BLOG</span>
      </div>

      <h1 id="mm-about-header-title" class="mm-about-title">
        Я Микола,
        <br />
        <span>веб-інженер та розробник</span>
      </h1>
      <p class="mm-about-subtitle">
        {{ subtitle }}
        <span>·</span>
        eCommerce
      </p>

      <div class="mm-about-header__specialties" aria-label="Спеціалізації">
        <span v-for="item in specialties" :key="item.label" class="mm-about-header__specialty">
          <v-icon :icon="item.icon" size="15" aria-hidden="true" />
          {{ item.label }}
        </span>
      </div>
    </div>

    <div class="mm-about-header__proof" aria-label="Досвід у проєктах">
      <strong>
        20
        <span>+</span>
      </strong>
      <span>
        eCommerce
        <br class="d-none d-sm-block" />
        проєктів
      </span>
    </div>
  </section>
</template>
