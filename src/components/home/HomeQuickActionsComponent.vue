<script setup>
  defineProps({
    latestPublished: {
      type: String,
      default: '-',
    },
    activeSortLabel: {
      type: String,
      default: '-',
    },
  })
</script>

<template>
  <section class="mm-side-card mm-side-card--actions">
    <div class="mm-side-card__head">
      <v-icon icon="mdi-lightning-bolt-outline" size="18" />
      <h3>Швидкі дії</h3>
    </div>

    <div class="mm-side-list">
      <div class="mm-side-list-item">
        <v-icon icon="mdi-calendar-clock-outline" size="16" />
        <span>Остання публікація: <strong>{{ latestPublished }}</strong></span>
      </div>
      <div class="mm-side-list-item">
        <v-icon icon="mdi-sort-variant" size="16" />
        <span>Активне сортування: <strong>{{ activeSortLabel }}</strong></span>
      </div>
    </div>

    <div class="mm-side-cta-grid">
      <router-link to="/blog" class="mm-side-cta mm-side-cta--primary">
        <v-icon icon="mdi-book-open-page-variant-outline" size="16" />
        Всі статті
      </router-link>
      <router-link to="/about" class="mm-side-cta">
        <v-icon icon="mdi-account-circle-outline" size="16" />
        Про автора
      </router-link>
    </div>
  </section>
</template>
