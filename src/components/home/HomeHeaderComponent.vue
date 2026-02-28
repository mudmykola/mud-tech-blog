<script setup>
  defineProps({
    title: {
      type: String,
      default: "Mud' Tech Blog",
    },
    subtitle: {
      type: String,
      default: 'Читайте останні технологічні статті та новини!',
    },
    totalArticles: {
      type: Number,
      default: 0,
    },
    filteredArticles: {
      type: Number,
      default: 0,
    },
    activeSortLabel: {
      type: String,
      default: '-',
    },
    latestPublished: {
      type: String,
      default: '-',
    },
    filteredShare: {
      type: String,
      default: '0%',
    },
  })
</script>

<template>
  <section class="mm-hero">
    <div class="mm-hero__orb mm-hero__orb--one" />
    <div class="mm-hero__orb mm-hero__orb--two" />

    <div class="mm-hero__pill">
      <v-icon icon="mdi-lightning-bolt-outline" size="16" />
      Tech feed
    </div>

    <h1 class="mm-hero__title">
      <v-icon class="mm-hero__title-icon" icon="mdi-lightning-bolt-circle" size="30" />
      {{ title }}
    </h1>

    <p class="mm-hero__subtitle">
      {{ subtitle }}
    </p>

    <div class="mm-hero__meta">
      <span class="mm-hero__meta-chip">
        <v-icon icon="mdi-newspaper-variant-outline" size="14" />
        {{ totalArticles }} статей
      </span>
      <span class="mm-hero__meta-chip">
        <v-icon icon="mdi-chart-arc" size="14" />
        {{ filteredShare }} у видачі
      </span>
      <span class="mm-hero__meta-chip">
        <v-icon icon="mdi-sort-variant" size="14" />
        {{ activeSortLabel }}
      </span>
      <span class="mm-hero__meta-chip">
        <v-icon icon="mdi-calendar-clock-outline" size="14" />
        {{ latestPublished }}
      </span>
    </div>

    <div class="mm-hero__quick">
      <router-link class="mm-hero__quick-btn" to="/blog">
        <v-icon icon="mdi-book-open-page-variant-outline" size="18" />
        <span>Статті</span>
      </router-link>
      <router-link class="mm-hero__quick-btn" to="/about">
        <v-icon icon="mdi-account-circle-outline" size="18" />
        <span>Про мене</span>
      </router-link>
      <a class="mm-hero__quick-btn" href="#home-controls">
        <v-icon icon="mdi-tune-variant" size="18" />
        <span>Фільтри</span>
      </a>
    </div>
  </section>
</template>
