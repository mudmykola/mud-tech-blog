<script setup>
  const paragraphs = [
    'Я займаюся розробкою кастомних Shopify-магазинів, створенням UI-компонентів, автоматизацією, скрапінгом і інтеграцією зі сторонніми API. За останні роки взяв участь у понад 20 eCommerce-проєктах.',
    'Мій основний стек: Vue, Nuxt, TailwindCSS, Liquid, Pinia, Python і Firebase. Люблю оптимізовувати процеси, впроваджувати автоматизацію та будувати масштабовані рішення для бізнесу.',
    'Цей блог — моя технічна лабораторія. Тут я публікую інсайти, туторіали й новини зі світу веброзробки та AI.',
  ]
</script>

<template>
  <section class="mm-about-intro">
    <div class="mm-about-section-head">
      <v-icon icon="mdi-text-box-outline" size="20" />
      <h2>Про мене</h2>
    </div>

    <div class="mm-about-intro__wrapper">
      <p v-for="(p, index) in paragraphs" :key="index" class="mm-about-intro__text">
        {{ p }}
      </p>
    </div>
  </section>
</template>
