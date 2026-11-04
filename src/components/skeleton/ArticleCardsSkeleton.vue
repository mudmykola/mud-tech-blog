<script setup>
  defineProps({
    count: {
      type: Number,
      default: 6,
    },
  })
</script>

<template>
  <div class="mm-skeleton-grid" aria-hidden="true">
    <article v-for="item in count" :key="item" class="mm-skeleton-card">
      <div class="mm-skeleton mm-skeleton--media" />
      <div class="mm-skeleton mm-skeleton--title" />
      <div class="mm-skeleton mm-skeleton--line" />
      <div class="mm-skeleton mm-skeleton--line mm-skeleton--line-short" />
      <div class="mm-skeleton-row">
        <div class="mm-skeleton mm-skeleton--chip" />
        <div class="mm-skeleton mm-skeleton--chip mm-skeleton--chip-small" />
      </div>
    </article>
  </div>
</template>
