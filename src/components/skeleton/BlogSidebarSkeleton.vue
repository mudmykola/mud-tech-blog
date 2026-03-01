<template>
  <div class="mm-blog-sidebar-sk" aria-hidden="true">
    <section class="mm-blog-sidebar-sk-panel">
      <div class="mm-blog-sidebar-sk-head">
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--icon" />
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--head" />
      </div>

      <div class="mm-blog-sidebar-sk-list">
        <div v-for="item in 7" :key="`tag-${item}`" class="mm-blog-sidebar-sk-item">
          <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--line" />
          <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--count" />
        </div>
      </div>
    </section>

    <section class="mm-blog-sidebar-sk-panel">
      <div class="mm-blog-sidebar-sk-head">
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--icon" />
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--head-short" />
      </div>

      <div class="mm-blog-sidebar-sk-actions">
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--btn" />
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--btn" />
      </div>
    </section>
  </div>
</template>

<style scoped>
  .mm-blog-sidebar-sk {
    display: grid;
    gap: 12px;
  }

  .mm-blog-sidebar-sk-panel {
    border-radius: 18px;
    padding: 12px;
    border: 1px solid var(--border-default);
    background: var(--surface-grad-1);
    box-shadow:
      8px 8px 18px rgba(31, 34, 39, 0.3),
      -4px -4px 10px rgba(84, 89, 97, 0.12);
    display: grid;
    gap: 10px;
  }

  .mm-blog-sidebar-sk-head {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .mm-blog-sidebar-sk-list {
    display: grid;
    gap: 8px;
  }

  .mm-blog-sidebar-sk-item {
    min-height: 36px;
    border-radius: 10px;
    border: 1px solid var(--border-default);
    background: var(--surface-grad-4);
    padding: 0 10px;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .mm-blog-sidebar-sk-actions {
    display: grid;
    gap: 8px;
  }

  .mm-blog-sidebar-sk-el {
    position: relative;
    border-radius: 10px;
    background: color-mix(in srgb, var(--color-bg-elevated) 72%, var(--color-bg) 28%);
    overflow: hidden;
  }

  .mm-blog-sidebar-sk-el::after {
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
    animation: mm-blog-sidebar-sk-shimmer 1.3s ease-in-out infinite;
  }

  .mm-blog-sidebar-sk-el--icon {
    width: 18px;
    height: 18px;
    border-radius: 999px;
  }

  .mm-blog-sidebar-sk-el--head {
    width: 84px;
    height: 14px;
  }

  .mm-blog-sidebar-sk-el--head-short {
    width: 96px;
    height: 14px;
  }

  .mm-blog-sidebar-sk-el--line {
    width: 70%;
    height: 10px;
  }

  .mm-blog-sidebar-sk-el--count {
    width: 18px;
    height: 18px;
    border-radius: 999px;
  }

  .mm-blog-sidebar-sk-el--btn {
    width: 100%;
    height: 36px;
    border-radius: 10px;
  }

  @keyframes mm-blog-sidebar-sk-shimmer {
    100% {
      transform: translateX(100%);
    }
  }
</style>
