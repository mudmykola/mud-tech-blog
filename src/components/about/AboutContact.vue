<script setup>
  const email = {
    label: 'mykola.mud@gmail.com',
    link: 'mailto:mykola.mud@gmail.com',
    icon: 'mdi-email-outline',
  }

  const telegram = {
    label: 'Telegram',
    link: 'https://t.me/mudwebdev',
    icon: 'mdi-telegram',
  }

  const socials = [
    { label: 'GitHub', link: 'https://github.com/mudmykola', icon: 'mdi-github' },
    { label: 'LinkedIn', link: 'https://www.linkedin.com/in/mud-developer/', icon: 'mdi-linkedin' },
    {
      label: 'Instagram',
      link: 'https://www.instagram.com/mud.software.engineer/',
      icon: 'mdi-instagram',
    },
  ]

  const uiText = {
    title: 'Зв’язатися зі мною',
    description: 'Напиши мені в email або Telegram, щоб обговорити співпрацю.',
  }
</script>

<template>
  <section class="mm-contact">
    <div class="mm-about-section-head">
      <v-icon icon="mdi-message-outline" size="20" />
      <h2 class="mm-contact-title">{{ uiText.title }}</h2>
    </div>
    <p class="mm-contact-description">{{ uiText.description }}</p>

    <div class="mm-contact-main">
      <a :href="email.link" class="mm-contact-row" target="_blank" rel="noopener">
        <v-icon class="mm-contact-icon" :icon="email.icon" />
        <span>{{ email.label }}</span>
      </a>

      <a :href="telegram.link" class="mm-contact-row" target="_blank" rel="noopener">
        <v-icon class="mm-contact-icon" :icon="telegram.icon" />
        <span>{{ telegram.label }}</span>
      </a>
    </div>

    <div class="mm-contact-socials">
      <a
        v-for="item in socials"
        :key="item.label"
        :href="item.link"
        target="_blank"
        rel="noopener"
        class="mm-contact-social-item"
      >
        <v-icon class="mm-contact-social-icon" :icon="item.icon" />
        <span>{{ item.label }}</span>
        <v-icon icon="mdi-open-in-new" class="mm-contact-external" />
      </a>
    </div>
  </section>
</template>
