<script setup>
  const stack = [
    '🟢 Nuxt 3 / Vue 3 / Pinia',
    '🎨 TailwindCSS / PostCSS',
    '🛍️ Shopify / Liquid / Storefront API / Admin API / GraphQL',
    '🐍 Python / Web scraping / Automation / Async / Proxies / CSV / Logging',
    '📦 Firebase / Firestore / Realtime DB / Google Auth',
    '🧩 Google Apps Script / Sheets API',
    '📮 Telegram Bot API / Resend Email API',
    '🌐 Git / GitHub / CI Workflows',
    '⚙️ Headless CMS / Custom Checkout / i18n / Multi-language',
  ]
</script>

<template>
  <div>
    <h2>🔧 Технології, з якими працюю</h2>
    <ul class="stack-list">
      <li v-for="tech in stack" :key="tech">{{ tech }}</li>
    </ul>
  </div>
</template>
