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

<style scoped>
  .mm-related-sk-grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  }

  .mm-related-sk-card {
    border-radius: 16px;
    border: 1px solid var(--border-soft);
    background: var(--surface-grad-3);
    box-shadow:
      8px 8px 16px rgba(30, 33, 39, 0.32),
      -5px -5px 10px rgba(82, 87, 97, 0.14);
    padding: 10px;
    display: grid;
    gap: 9px;
  }

  .mm-related-sk {
    position: relative;
    border-radius: 10px;
    background: color-mix(in srgb, var(--color-bg-elevated) 72%, var(--color-bg) 28%);
    overflow: hidden;
  }

  .mm-related-sk::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, #ffffff 10%, transparent),
      transparent
    );
    animation: mm-related-sk-shimmer 1.35s ease-in-out infinite;
  }

  .mm-related-sk--media {
    aspect-ratio: 16 / 9;
  }

  .mm-related-sk--title {
    height: 16px;
    width: 76%;
  }

  .mm-related-sk--line {
    height: 12px;
    width: 64%;
  }

  .mm-related-sk-row {
    display: flex;
    gap: 8px;
  }

  .mm-related-sk--chip {
    height: 22px;
    width: 80px;
    border-radius: 999px;
  }

  .mm-related-sk--chip-short {
    width: 58px;
  }

  @keyframes mm-related-sk-shimmer {
    100% {
      transform: translateX(100%);
    }
  }
</style>
