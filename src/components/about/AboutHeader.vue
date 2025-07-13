<script setup>
  const avatar = '/images/avatar.jpg'
  const title = 'Привіт! Я Микола 👋'
  const subtitle = 'Frontend eCommerce Developer — Shopify, Nuxt, Vue, Python'
</script>

<template>
  <div class="about-header">
    <img class="avatar" :src="avatar" alt="Avatar" />
    <div>
      <h1>{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>
