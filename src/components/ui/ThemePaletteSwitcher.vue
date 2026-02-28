<script setup>
  import { computed } from 'vue'
  import { useThemePalette } from '@/composables/useThemePalette'

  const props = defineProps({
    compact: { type: Boolean, default: false },
  })

  const { currentPalette, palettes, setPalette } = useThemePalette()

  const current = computed(() => palettes.find(item => item.key === currentPalette.value) || palettes[0])
</script>

<template>
  <v-menu location="bottom end" :close-on-content-click="true">
    <template #activator="{ props: menuProps }">
      <button class="mm-theme-switcher" v-bind="menuProps" :class="{ 'mm-theme-switcher--compact': compact }">
        <v-icon :icon="current.icon" size="16" />
        <span v-if="!compact">{{ current.label }}</span>
      </button>
    </template>

    <div class="mm-theme-switcher__menu">
      <button
        v-for="item in palettes"
        :key="item.key"
        class="mm-theme-switcher__item"
        :class="{ 'mm-theme-switcher__item--active': item.key === currentPalette }"
        @click="setPalette(item.key)"
      >
        <v-icon :icon="item.icon" size="16" />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </v-menu>
</template>

<style scoped lang="scss">
  .mm-theme-switcher {
    min-height: 34px;
    border-radius: 10px;
    border: 1px solid var(--border-strong);
    background: var(--nav-surface-alt);
    color: var(--color-text-soft);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    font-size: 0.76rem;
    font-weight: 700;
  }

  .mm-theme-switcher--compact {
    min-width: 34px;
    justify-content: center;
    padding: 0;
  }

  .mm-theme-switcher__menu {
    min-width: 156px;
    border-radius: 14px;
    border: 1px solid var(--border-default);
    background: var(--nav-surface);
    padding: 5px;
    display: grid;
    gap: 4px;
    box-shadow:
      inset 1px 1px 0 var(--border-soft),
      10px 10px 18px rgba(24, 27, 32, 0.36);
    backdrop-filter: blur(12px);
  }

  .mm-theme-switcher__item {
    min-height: 32px;
    border-radius: 10px;
    border: 1px solid var(--border-default);
    background: var(--nav-surface-alt);
    color: var(--color-text-soft);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px;
    font-size: 0.74rem;
    font-weight: 700;
    text-align: left;
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      color 0.2s ease;

    :deep(.v-icon) {
      width: 20px;
      height: 20px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--code-inline-bg);
      color: var(--color-text);
      font-size: 0.86rem;
    }
  }

  .mm-theme-switcher__item:not(.mm-theme-switcher__item--active):hover {
    border-color: var(--accent-border);
    background: var(--surface-grad-3);
  }

  .mm-theme-switcher__item--active {
    color: #fff;
    border-color: var(--accent-border-strong);
    background: var(--accent-grad-2);
    box-shadow: 0 0 0 1px var(--accent-ring);

    :deep(.v-icon) {
      background: color-mix(in srgb, var(--color-on-accent) 20%, transparent);
      color: #fff;
    }
  }
</style>
