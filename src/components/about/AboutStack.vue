<script setup>
  const stack = [
    { label: 'Nuxt 3 / Vue 3 / Pinia', icon: 'mdi-vuejs' },
    { label: 'TailwindCSS / PostCSS', icon: 'mdi-tailwind' },
    { label: 'Shopify / Liquid / Storefront API / GraphQL', icon: 'mdi-shopping' },
    { label: 'Python / Web scraping / Automation', icon: 'mdi-language-python' },
    { label: 'Firebase / Firestore / Auth', icon: 'mdi-fire' },
    { label: 'Google Apps Script / Sheets API', icon: 'mdi-google-drive' },
    { label: 'Telegram Bot API / Automation', icon: 'mdi-telegram' },
    { label: 'Git / GitHub / CI Workflows', icon: 'mdi-git' },
    { label: 'Headless CMS / Custom Checkout / i18n', icon: 'mdi-translate' },
  ]
</script>

<template>
  <section class="mm-stack">
    <div class="mm-about-section-head">
      <v-icon icon="mdi-layers-triple-outline" size="20" />
      <h2 class="mm-stack-title">Технології, з якими працюю</h2>
    </div>

    <ul class="mm-stack-list">
      <li v-for="tech in stack" :key="tech.label" class="mm-stack-item">
        <v-icon class="mm-stack-icon" :icon="tech.icon" size="20" />
        <span>{{ tech.label }}</span>
      </li>
    </ul>
  </section>
</template>
