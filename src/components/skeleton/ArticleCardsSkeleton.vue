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

<style scoped>
  .mm-skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px;
  }

  .mm-skeleton-card {
    border-radius: 18px;
    border: 1px solid var(--border-soft);
    background: var(--surface-grad-2);
    box-shadow:
      10px 10px 20px rgba(29, 31, 36, 0.35),
      -6px -6px 14px rgba(83, 88, 98, 0.16);
    padding: 12px;
    display: grid;
    gap: 10px;
  }

  .mm-skeleton {
    position: relative;
    border-radius: 10px;
    background: color-mix(in srgb, var(--color-bg-elevated) 72%, var(--color-bg) 28%);
    overflow: hidden;
  }

  .mm-skeleton::after {
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
    animation: mm-skeleton-shimmer 1.4s ease-in-out infinite;
  }

  .mm-skeleton--media {
    height: 140px;
  }

  .mm-skeleton--title {
    height: 18px;
    width: 72%;
  }

  .mm-skeleton--line {
    height: 12px;
    width: 100%;
  }

  .mm-skeleton--line-short {
    width: 84%;
  }

  .mm-skeleton-row {
    display: flex;
    gap: 8px;
    margin-top: 2px;
  }

  .mm-skeleton--chip {
    height: 24px;
    width: 86px;
    border-radius: 999px;
  }

  .mm-skeleton--chip-small {
    width: 62px;
  }

  @keyframes mm-skeleton-shimmer {
    100% {
      transform: translateX(100%);
    }
  }
</style>
