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
  })
</script>

<template>
  <section class="mm-hero">
    <picture class="mm-hero__artwork">
      <source
        media="(max-width: 640px)"
        srcset="/images/seasonal-autumn-tech-mobile.webp"
        type="image/webp"
      />
      <img src="/images/seasonal-autumn-tech.webp" alt="" aria-hidden="true" decoding="async" />
    </picture>
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
    </div>
  </section>
</template>
