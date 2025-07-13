<script setup>
  const email = {
    label: 'mykola.mud@gmail.com',
    link: 'mailto:mykola.mud@gmail.com',
  }

  const telegram = {
    label: 'Telegram',
    link: 'https://t.me/mudwebdev',
  }

  const socials = [
    {
      label: 'GitHub',
      link: 'https://github.com/mudmykola',
    },
    {
      label: 'LinkedIn',
      link: 'https://www.linkedin.com/in/mud-developer/',
    },
    {
      label: 'Instagram',
      link: 'https://www.instagram.com/mud.software.engineer/',
    },
  ]

  const uiText = {
    title: '📬 Зв’язатися зі мною',
    description: 'Можна написати мені на',
  }
</script>

<template>
  <div class="contact-section">
    <h2 class="contact-section__title">{{ uiText.title }}</h2>
    <p class="contact-section__description">
      {{ uiText.description }}
      <a :href="email.link" class="contact-section__email">{{ email.label }}</a>
      або у
      <a :href="telegram.link" target="_blank" class="contact-section__telegram">
        {{ telegram.label }}
      </a>
      .
    </p>
    <ul class="contact-section__list">
      <li v-for="item in socials" :key="item.label">
        <a :href="item.link" target="_blank" class="contact-section__item--link">
          {{ item.label }}
        </a>
      </li>
    </ul>
  </div>
</template>
