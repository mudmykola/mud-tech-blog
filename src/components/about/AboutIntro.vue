<script setup>
  const paragraphs = [
  'Я Shopify-розробник та веб-інженер. Створюю кастомні eCommerce-магазини, розробляю UI-компоненти, інтегрую сторонні API та автоматизую бізнес-процеси. Реалізував понад 20 комерційних проєктів.',
  'Працюю з Vue, Nuxt, TailwindCSS, Liquid, Pinia, Python і Firebase. Фокус - продуктивність, SEO-оптимізація та масштабована архітектура веб-застосунків.',
  'У блозі ділюся практичними кейсами, технічними розборами та матеріалами про веб-розробку, eCommerce і AI.'
]
</script>

<template>
  <section class="mm-about-intro">
    <div class="mm-about-section-head">
      <v-icon icon="mdi-text-box-outline" size="20" />
      <h2>Про мене</h2>
    </div>

    <div class="mm-about-intro__wrapper">
      <p v-for="(p, index) in paragraphs" :key="index" class="mm-about-intro__text">
        {{ p }}
      </p>
    </div>
  </section>
</template>
