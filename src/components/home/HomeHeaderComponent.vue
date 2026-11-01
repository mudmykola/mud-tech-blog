<script setup>
  import quickActionText from '@/data/home-quick-actions.json'

  const emit = defineEmits(['surprise-me'])

  defineProps({
    title: {
      type: String,
      default: "Mud' Tech Blog",
    },
    subtitle: {
      type: String,
      default: 'Читайте останні технологічні статті та новини!',
    },
    latestArticle: {
      type: Object,
      default: null,
    },
  })
</script>

<template>
  <section class="mm-hero">
    <img
      class="mm-hero__artwork"
      src="/images/seasonal-halloween.webp"
      alt=""
      aria-hidden="true"
      decoding="async"
    />
    <div class="mm-hero__orb mm-hero__orb--one" />
    <div class="mm-hero__orb mm-hero__orb--two" />

    <div class="mm-hero__content">
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

      <div class="mm-hero__quick">
        <router-link
          v-if="latestArticle?.handle"
          class="mm-hero__quick-btn mm-hero__quick-btn--primary"
          :to="{ name: 'article', params: { slug: latestArticle.handle } }"
          :aria-label="`${quickActionText.latestArticle}: ${latestArticle.title}`"
        >
          <v-icon icon="mdi-newspaper-variant-outline" size="18" />
          <span>{{ quickActionText.latestArticle }}</span>
          <v-icon class="mm-hero__quick-arrow" icon="mdi-arrow-top-right" size="18" />
        </router-link>
        <router-link
          v-else
          class="mm-hero__quick-btn mm-hero__quick-btn--primary"
          :to="{ name: 'blog' }"
        >
          <v-icon icon="mdi-book-open-page-variant-outline" size="18" />
          <span>{{ quickActionText.noLatestArticle }}</span>
          <v-icon class="mm-hero__quick-arrow" icon="mdi-arrow-top-right" size="18" />
        </router-link>
        <button
          class="mm-hero__quick-btn"
          type="button"
          :disabled="!latestArticle?.handle"
          @click="emit('surprise-me')"
        >
          <v-icon icon="mdi-shuffle-variant" size="18" />
          <span>{{ quickActionText.surpriseMe }}</span>
        </button>
        <a class="mm-hero__quick-btn" href="#home-controls">
          <v-icon icon="mdi-tune-variant" size="18" />
          <span>{{ quickActionText.filters }}</span>
        </a>
      </div>
    </div>
  </section>
</template>
