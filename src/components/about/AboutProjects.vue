<script setup>
  const projects = [
    {
      label:
        'KARPATKA – це сучасний онлайн-магазин, створений для любителів якісних та стильних сумок.',
      link: 'https://karpatka-sable.vercel.app',
    },
    {
      label: 'GentleWear – ексклюзивні товари та преміум якість ',
      link: 'https://gentle-wear.vercel.app',
    },
    {
      label: 'MudTechBlog — технічний блог на  Vue 3',
      link: 'https://github.com/mudmykola/mud-tech-blog',
    },
    {
      label: 'Vue My Portfolio — персональний портфоліо на Vue 3',
      link: 'https://vue--my-portfolio.web.app',
    },
    {
      label: 'CartoonJoy — Vue 3 SPA для дитячих мультфільмів',
      link: 'https://black-caster-247408.web.app',
    },
  ]
</script>

<template>
  <div>
    <h2>🔗 Мої проєкти</h2>
    <ul class="project-list">
      <li v-for="project in projects" :key="project.label">
        <a :href="project.link" target="_blank">{{ project.label }}</a>
      </li>
    </ul>
  </div>
</template>
