<script setup>
  const categories = [
    {
      title: 'Frontend',
      icon: 'mdi-vuejs',
      description: 'Інтерфейси та клієнтська логіка',
      skills: ['Nuxt 3', 'Vue 3', 'Pinia', 'TailwindCSS', 'PostCSS'],
    },
    {
      title: 'Commerce',
      icon: 'mdi-shopping',
      description: 'Storefront, checkout і контент',
      skills: [
        'Shopify',
        'Liquid',
        'Storefront API',
        'GraphQL',
        'Headless CMS',
        'Custom Checkout',
        'i18n',
      ],
    },
    {
      title: 'Automation & integrations',
      icon: 'mdi-connection',
      description: 'Скрипти, API та автоматизація',
      skills: [
        'Python',
        'Web scraping',
        'Automation',
        'Google Apps Script',
        'Sheets API',
        'Telegram Bot API',
      ],
    },
    {
      title: 'Platform & delivery',
      icon: 'mdi-cloud-outline',
      description: 'Інфраструктура та CI-процеси',
      skills: ['Firebase', 'Firestore', 'Auth', 'Git', 'GitHub', 'CI Workflows'],
    },
  ]
</script>

<template>
  <section class="mm-stack" aria-labelledby="mm-stack-title">
    <div class="mm-about-section-head mm-stack__head">
      <v-icon icon="mdi-layers-triple-outline" size="20" aria-hidden="true" />
      <h2 id="mm-stack-title" class="mm-stack-title">Інструментарій</h2>
      <span class="mm-stack__section-index" aria-hidden="true">02 / СТЕК</span>
    </div>

    <p class="mm-stack__intro">Технології згруповані за задачами, для яких я їх використовую.</p>

    <ul class="mm-stack-list">
      <li v-for="(category, index) in categories" :key="category.title" class="mm-stack-group">
        <div class="mm-stack-group__head">
          <span class="mm-stack-group__icon">
            <v-icon :icon="category.icon" size="19" aria-hidden="true" />
          </span>
          <div class="mm-stack-group__heading">
            <span class="mm-stack-group__index">0{{ index + 1 }}</span>
            <h3>{{ category.title }}</h3>
          </div>
        </div>
        <p class="mm-stack-group__description">{{ category.description }}</p>
        <ul class="mm-stack-group__skills">
          <li v-for="skill in category.skills" :key="skill">{{ skill }}</li>
        </ul>
      </li>
    </ul>
  </section>
</template>
