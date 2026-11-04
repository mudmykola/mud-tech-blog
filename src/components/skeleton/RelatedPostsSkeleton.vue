<script setup>
  defineProps({
    count: {
      type: Number,
      default: 4,
    },
  })
</script>

<template>
  <div class="mm-related-sk-grid" aria-hidden="true">
    <article v-for="item in count" :key="item" class="mm-related-sk-card">
      <div class="mm-related-sk mm-related-sk--media" />
      <div class="mm-related-sk mm-related-sk--title" />
      <div class="mm-related-sk mm-related-sk--line" />
      <div class="mm-related-sk-row">
        <div class="mm-related-sk mm-related-sk--chip" />
        <div class="mm-related-sk mm-related-sk--chip mm-related-sk--chip-short" />
      </div>
    </article>
  </div>
</template>
