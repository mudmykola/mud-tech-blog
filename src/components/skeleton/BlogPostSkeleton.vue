<template>
  <section class="mm-post-skeleton" aria-hidden="true">
    <header class="mm-post-skeleton__hero">
      <div class="mm-sk mm-sk--crumbs" />
      <div class="mm-post-skeleton__chips">
        <div class="mm-sk mm-sk--chip" />
        <div class="mm-sk mm-sk--chip" />
        <div class="mm-sk mm-sk--chip" />
      </div>
      <div class="mm-sk mm-sk--title" />
      <div class="mm-sk mm-sk--title mm-sk--title-short" />
    </header>

    <div class="mm-post-skeleton__layout">
      <article class="mm-post-skeleton__surface">
        <div class="mm-sk mm-sk--line" />
        <div class="mm-sk mm-sk--line" />
        <div class="mm-sk mm-sk--line mm-sk--line-short" />
        <div class="mm-sk mm-sk--block" />
        <div class="mm-sk mm-sk--line" />
        <div class="mm-sk mm-sk--line mm-sk--line-short" />
      </article>

      <aside class="mm-post-skeleton__side d-none d-md-grid">
        <div class="mm-sk mm-sk--media" />
        <div class="mm-sk mm-sk--line" />
        <div class="mm-sk mm-sk--line mm-sk--line-short" />
        <div class="mm-sk mm-sk--block mm-sk--block-small" />
      </aside>
    </div>
  </section>
</template>

<style scoped>
  .mm-post-skeleton {
    display: grid;
    gap: 14px;
  }

  .mm-post-skeleton__hero,
  .mm-post-skeleton__surface,
  .mm-post-skeleton__side {
    border-radius: 22px;
    border: 1px solid var(--border-soft);
    background: var(--surface-grad-2);
    box-shadow:
      10px 10px 20px rgba(29, 31, 36, 0.35),
      -6px -6px 14px rgba(83, 88, 98, 0.16);
    padding: 14px;
    display: grid;
    gap: 10px;
  }

  .mm-post-skeleton__layout {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.85fr);
    gap: 14px;
  }

  .mm-post-skeleton__chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .mm-sk {
    position: relative;
    border-radius: 10px;
    background: color-mix(in srgb, var(--color-bg-elevated) 72%, var(--color-bg) 28%);
    overflow: hidden;
  }

  .mm-sk::after {
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
    animation: mm-sk-shimmer 1.35s ease-in-out infinite;
  }

  .mm-sk--crumbs {
    height: 12px;
    width: 42%;
  }

  .mm-sk--chip {
    height: 26px;
    width: 90px;
    border-radius: 999px;
  }

  .mm-sk--title {
    height: 26px;
    width: 78%;
  }

  .mm-sk--title-short {
    width: 62%;
  }

  .mm-sk--line {
    height: 14px;
    width: 100%;
  }

  .mm-sk--line-short {
    width: 72%;
  }

  .mm-sk--block {
    height: 180px;
  }

  .mm-sk--block-small {
    height: 130px;
  }

  .mm-sk--media {
    height: 220px;
  }

  @keyframes mm-sk-shimmer {
    100% {
      transform: translateX(100%);
    }
  }

  @media (max-width: 1020px) {
    .mm-post-skeleton__layout {
      grid-template-columns: 1fr;
    }
  }
</style>
