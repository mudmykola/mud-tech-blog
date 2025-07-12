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
  <div class="header">
    <h1>{{ title }}</h1>
    <p class="subtitle">{{ subtitle }}</p>
  </div>
</template>
