<script setup>
  import { useThemePalette } from '@/composables/useThemePalette'

  const props = defineProps({
    compact: { type: Boolean, default: false },
  })

  const { currentPalette, palettes, setPalette } = useThemePalette()
</script>

<template>
  <div
    class="mm-theme-switcher"
    :class="{ 'mm-theme-switcher--compact': compact }"
    role="group"
    aria-label="Кольорова тема"
  >
    <button
      v-for="item in palettes"
      :key="item.key"
      class="mm-theme-switcher__option"
      :class="{ 'mm-theme-switcher__option--active': item.key === currentPalette }"
      type="button"
      :aria-label="`Тема: ${item.label}`"
      :aria-pressed="item.key === currentPalette"
      @click="setPalette(item.key)"
    >
      <v-icon :icon="item.icon" :size="compact ? 16 : 17" aria-hidden="true" />
      <span class="mm-theme-switcher__tooltip" aria-hidden="true">{{ item.label }}</span>
    </button>
  </div>
</template>
