<script setup>
  const practices = [
    {
      number: '01',
      title: 'Створюю',
      icon: 'mdi-code-braces',
      description: 'Інтерфейси й функціональність для eCommerce-продуктів.',
    },
    {
      number: '02',
      title: 'Інтегрую',
      icon: 'mdi-connection',
      description: 'Shopify, API та сервіси в цілісні робочі процеси.',
    },
    {
      number: '03',
      title: 'Оптимізую',
      icon: 'mdi-speedometer',
      description: 'Продуктивність, SEO та архітектуру вебзастосунків.',
    },
  ]
</script>

<template>
  <section class="mm-about-intro" aria-labelledby="mm-about-intro-title">
    <div class="mm-about-section-head">
      <v-icon icon="mdi-compass-outline" size="20" aria-hidden="true" />
      <h2 id="mm-about-intro-title">Як я працюю</h2>
      <span class="mm-about-intro__section-index" aria-hidden="true">01 / ПІДХІД</span>
    </div>

    <p class="mm-about-intro__lead">
      Я працюю на стику eCommerce і вебінженерії — від інтерфейсу магазину до автоматизації процесів
      за ним.
    </p>

    <ol class="mm-about-intro__practices">
      <li v-for="practice in practices" :key="practice.number" class="mm-about-intro__practice">
        <span class="mm-about-intro__practice-icon">
          <v-icon :icon="practice.icon" size="18" aria-hidden="true" />
        </span>
        <span class="mm-about-intro__practice-copy">
          <span class="mm-about-intro__practice-heading">
            <span class="mm-about-intro__practice-number">{{ practice.number }}</span>
            <strong>{{ practice.title }}</strong>
          </span>
          <span class="mm-about-intro__practice-description">{{ practice.description }}</span>
        </span>
      </li>
    </ol>

    <p class="mm-about-intro__note">
      <v-icon icon="mdi-post-outline" size="17" aria-hidden="true" />
      У блозі — практичні кейси, технічні розбори та матеріали про веброзробку, eCommerce й AI.
    </p>
  </section>
</template>
