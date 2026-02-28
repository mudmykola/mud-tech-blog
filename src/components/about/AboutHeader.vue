<script setup>
  const avatar = '/images/avatar.webp'
  const title = 'Я Микола, веб-інженер та розробник'
  const subtitle = 'Frontend Developer | Vue | Nuxt | Shopify'
  const highlights = ['20+ eCommerce проєктів', 'Shopify / Vue / Automation', 'Фокус: UX + продуктивність']
</script>

<template>
  <section class="mm-about-header">
    <div class="mm-about-header__media">
      <div class="mm-about-avatar-wrap">
        <img :src="avatar" alt="Avatar" class="mm-about-avatar" />
      </div>
    </div>

    <div class="mm-about-header__content">
      <h1 class="mm-about-title">{{ title }}</h1>
      <p class="mm-about-subtitle">{{ subtitle }}</p>

      <div class="mm-about-header__highlights">
        <span v-for="item in highlights" :key="item">{{ item }}</span>
      </div>
    </div>
  </section>
</template>
