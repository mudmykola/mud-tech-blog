<script setup>
  defineProps({
    image: { type: String, default: '' },
    alt: { type: String, default: 'Mud Tech Blog' },
    width: { type: [String, Number], default: 140 },
  })
</script>

<template>
  <router-link to="/" class="mm-logo">
    <img v-if="image" :src="image" :alt="alt" :width="width" class="mm-logo__img" />

    <span v-else class="mm-logo__text">
      Mud
      <span class="mm-logo__accent">Tech</span>
      Blog
    </span>
  </router-link>
</template>
