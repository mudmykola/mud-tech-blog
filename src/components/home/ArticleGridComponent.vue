<script setup>
  import ArticleCard from '@/components/article/ArticleCardComponent.vue'

  defineProps({
    filteredArticles: {
      type: Array,
      default: () => [],
    },
    savedHandles: {
      type: Array,
      default: null,
    },
    stickyStack: {
      type: Boolean,
      default: false,
    },
    stackCount: {
      type: Number,
      default: 3,
    },
  })
  const emit = defineEmits(['toggle-saved'])
</script>

<template>
  <section
    class="articles-grid"
    :class="{ 'articles-grid--sticky-stack': stickyStack }"
    aria-label="Сітка статей"
  >
    <template v-if="stickyStack">
      <div v-if="filteredArticles.length" class="articles-grid__stack">
        <div
          v-for="(article, index) in filteredArticles.slice(0, stackCount)"
          :key="article.handle"
          class="articles-grid__stack-card"
          :class="`articles-grid__stack-card--${index + 1}`"
        >
          <ArticleCard
            :article="article"
            :saved="savedHandles ? savedHandles.includes(article.handle) : null"
            compact
            @toggle-saved="emit('toggle-saved', $event)"
          />
        </div>
      </div>

      <div v-if="filteredArticles.length > stackCount" class="articles-grid__remaining">
        <ArticleCard
          v-for="article in filteredArticles.slice(stackCount)"
          :key="article.handle"
          :article="article"
          :saved="savedHandles ? savedHandles.includes(article.handle) : null"
          @toggle-saved="emit('toggle-saved', $event)"
        />
      </div>
    </template>

    <template v-else>
      <ArticleCard
        v-for="article in filteredArticles"
        :key="article.handle"
        :article="article"
        :saved="savedHandles ? savedHandles.includes(article.handle) : null"
        @toggle-saved="emit('toggle-saved', $event)"
      />
    </template>
  </section>
</template>
