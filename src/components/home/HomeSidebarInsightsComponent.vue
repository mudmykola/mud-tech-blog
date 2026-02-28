<script setup>
  defineProps({
    uniqueTagsCount: {
      type: Number,
      default: 0,
    },
    filteredCount: {
      type: Number,
      default: 0,
    },
    topTags: {
      type: Array,
      default: () => [],
    },
  })
</script>

<template>
  <section class="mm-side-card">
    <div class="mm-side-card__head">
      <v-icon icon="mdi-chart-donut-variant" size="18" />
      <h3>Огляд контенту</h3>
    </div>

    <div class="mm-side-metrics">
      <div class="mm-side-metric">
        <span>Унікальні теги</span>
        <strong>{{ uniqueTagsCount }}</strong>
      </div>
      <div class="mm-side-metric">
        <span>У видачі</span>
        <strong>{{ filteredCount }}</strong>
      </div>
    </div>

    <p class="mm-side-subtitle">Популярні теги</p>

    <div class="mm-side-tags" v-if="topTags.length">
      <div v-for="tag in topTags" :key="tag.label" class="mm-side-tag">
        <span>#{{ tag.label }}</span>
        <strong>{{ tag.count }}</strong>
      </div>
    </div>
    <p v-else class="mm-side-empty">Немає тегів для відображення</p>
  </section>
</template>
