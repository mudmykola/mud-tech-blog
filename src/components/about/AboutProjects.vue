<script setup>
  const projects = [
    {
      label: 'KARPATKA — сучасний онлайн-магазин сумок',
      link: 'https://karpatka-sable.vercel.app',
      icon: 'mdi-bag-personal-outline',
    },
    {
      label: 'GentleWear — ексклюзивний мерч та преміум якість',
      link: 'https://gentle-wear.vercel.app',
      icon: 'mdi-tshirt-crew-outline',
    },
    {
      label: 'MudTechBlog — технічний блог на Vue 3',
      link: 'https://github.com/mudmykola/mud-tech-blog',
      icon: 'mdi-file-code-outline',
    },
    {
      label: 'Vue My Portfolio — персональний портфоліо',
      link: 'https://vue--my-portfolio.web.app',
      icon: 'mdi-account-box-outline',
    },
    {
      label: 'CartoonJoy — мультфільми для дітей (SPA)',
      link: 'https://black-caster-247408.web.app',
      icon: 'mdi-movie-open-outline',
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
