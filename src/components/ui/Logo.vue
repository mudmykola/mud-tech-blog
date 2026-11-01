<script setup>
  defineProps({
    image: { type: String, default: '' },
    alt: { type: String, default: 'Mud Tech Blog' },
    width: { type: [String, Number], default: 140 },
  })
</script>

<template>
  <router-link to="/" class="mm-logo" aria-label="Mud Tech Blog">
    <img v-if="image" :src="image" :alt="alt" :width="width" class="mm-logo__img" />

    <template v-else>
      <img
        src="/images/mud-tech-fox-mark.svg"
        alt=""
        aria-hidden="true"
        width="48"
        height="34"
        class="mm-logo__mark"
      />
      <span class="mm-logo__text">
        <span>Mud</span>
        <span class="mm-logo__accent">Tech</span>
        <span>Blog</span>
      </span>
    </template>
  </router-link>
</template>
