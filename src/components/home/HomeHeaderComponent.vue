<script setup>
  const props = defineProps({
    title: {
      type: String,
      default: "Mud' Tech Blog",
    },
    subtitle: {
      type: String,
      default: 'Читайте останні технологічні статті та новини!',
    },
  })
</script>

<template>
  <section class="mm-hero">
    <div class="mm-hero__glow"></div>
    <h1 class="mm-hero__title">
      {{ title }}
    </h1>
    <p class="mm-hero__subtitle">
      {{ subtitle }}
    </p>
    <div class="mm-hero__grid"></div>
  </section>
</template>
