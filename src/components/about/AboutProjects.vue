<script setup>
  const projects = [
    {
      name: 'DevKit Tools',
      description: 'Набір інструментів для щоденної розробки.',
      link: 'https://devkit-tools.pp.ua/',
      icon: 'mdi-tools',
    },
    {
      name: 'ORVEN FM',
      description: 'Онлайн-радіо ORVEN FM.',
      link: 'https://140-238-71-143.sslip.io/',
      icon: 'mdi-radio',
    },
    {
      name: 'Mykola Mud Portfolio',
      description: 'Персональне портфоліо.',
      link: 'https://mykolamud.pp.ua/',
      icon: 'mdi-account-box-outline',
    },
    {
      name: 'Shesha Shop',
      description: 'Вітрина інтернет-магазину.',
      link: 'https://shesha-shop.pages.dev/',
      icon: 'mdi-storefront-outline',
    },
  ]
</script>

<template>
  <section class="mm-projects" aria-labelledby="mm-projects-title">
    <div class="mm-about-section-head mm-projects__head">
      <v-icon icon="mdi-rocket-launch-outline" size="20" aria-hidden="true" />
      <h2 id="mm-projects-title" class="mm-projects-title">Мої проєкти</h2>
      <span class="mm-projects__count">{{ projects.length }} посилання</span>
    </div>

    <ul class="mm-projects-grid">
      <li v-for="(project, index) in projects" :key="project.link">
        <a
          :href="project.link"
          target="_blank"
          rel="noopener noreferrer"
          class="mm-project-card"
          :aria-label="`Відкрити проєкт ${project.name} у новій вкладці`"
        >
          <span class="mm-project-card__icon" aria-hidden="true">
            <v-icon :icon="project.icon" size="20" />
          </span>
          <span class="mm-project-card__index" aria-hidden="true">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <span class="mm-project-card__copy">
            <strong class="mm-project-card__name">{{ project.name }}</strong>
            <span class="mm-project-card__description">{{ project.description }}</span>
          </span>
          <span class="mm-project-card__action">
            <span class="mm-project-card__action-label">Відкрити проєкт</span>
            <v-icon icon="mdi-arrow-top-right" size="18" aria-hidden="true" />
          </span>
        </a>
      </li>
    </ul>
  </section>
</template>
