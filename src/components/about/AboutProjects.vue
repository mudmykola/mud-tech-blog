<script setup>
  const projects = [
    {
      label: 'DevKit Tools — набір інструментів для щоденної розробки',
      link: 'https://devkit-tools.pp.ua/',
      icon: 'mdi-tools',
    },
    {
      label: "Mud' Tech Blog — технічний блог на Vue 3",
      link: 'https://mud-tech-blog.web.app/',
      icon: 'mdi-post-outline',
    },
    {
      label: 'Mykola Mud Portfolio — персональне портфоліо',
      link: 'https://mykolamud.pp.ua/',
      icon: 'mdi-account-box-outline',
    },
    {
      label: 'Shesha Shop — ecommerce storefront',
      link: 'https://shesha-shop.pages.dev/',
      icon: 'mdi-storefront-outline',
    },
  ]
</script>

<template>
  <section class="mm-projects">
    <div class="mm-about-section-head">
      <v-icon icon="mdi-rocket-launch-outline" size="20" />
      <h2 class="mm-projects-title">Мої проєкти</h2>
    </div>

    <v-container class="mm-projects-grid" fluid>
      <v-row dense>
        <v-col v-for="project in projects" :key="project.label" cols="12" sm="6">
          <a :href="project.link" target="_blank" rel="noopener" class="mm-project-card">
            <v-icon class="mm-project-icon" :icon="project.icon" />
            <span class="mm-project-label">{{ project.label }}</span>
            <v-icon class="mm-project-external" icon="mdi-open-in-new" />
          </a>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>
