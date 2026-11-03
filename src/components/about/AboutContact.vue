<script setup>
  import { onUnmounted, ref } from 'vue'

  const email = {
    label: 'mykola.mud@gmail.com',
    link: 'mailto:mykola.mud@gmail.com',
    icon: 'mdi-email-outline',
  }

  const telegram = {
    label: 'Telegram',
    link: 'https://t.me/mudwebdev',
    icon: 'mdi-send',
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

  const copyState = ref('idle')
  let copyFeedbackTimeout

  function copyWithFallback(value) {
    const input = document.createElement('textarea')
    input.value = value
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()

    let copied = false
    try {
      copied = document.execCommand('copy')
    } finally {
      input.remove()
    }

    return copied
  }

  async function copyEmail() {
    let copied = false

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email.label)
        copied = true
      }
    } catch {
      copied = false
    }

    if (!copied) {
      try {
        copied = copyWithFallback(email.label)
      } catch {
        copied = false
      }
    }

    copyState.value = copied ? 'copied' : 'error'
    window.clearTimeout(copyFeedbackTimeout)
    copyFeedbackTimeout = window.setTimeout(() => {
      copyState.value = 'idle'
    }, 2400)
  }

  onUnmounted(() => window.clearTimeout(copyFeedbackTimeout))
</script>

<template>
  <section class="mm-contact" aria-labelledby="mm-contact-title">
    <div class="mm-about-section-head mm-contact__head">
      <v-icon icon="mdi-message-outline" size="20" aria-hidden="true" />
      <h2 id="mm-contact-title" class="mm-contact-title">{{ uiText.title }}</h2>
      <span class="mm-contact__eyebrow">НА ЗВ’ЯЗКУ</span>
    </div>
    <p class="mm-contact-description">{{ uiText.description }}</p>

    <div class="mm-contact__layout">
      <div class="mm-contact-main" role="group" aria-label="Основні способи зв’язку">
        <div class="mm-contact__email-group" role="group" aria-label="Email та копіювання адреси">
          <a :href="email.link" class="mm-contact-row mm-contact-row--primary">
            <span class="mm-contact-row__icon" aria-hidden="true">
              <v-icon :icon="email.icon" size="21" />
            </span>
            <span class="mm-contact-row__copy">
              <span class="mm-contact-row__hint">EMAIL</span>
              <strong>{{ email.label }}</strong>
            </span>
            <v-icon
              class="mm-contact-row__arrow"
              icon="mdi-arrow-top-right"
              size="18"
              aria-hidden="true"
            />
          </a>
          <button
            type="button"
            class="mm-contact-copy"
            :aria-label="copyState === 'copied' ? 'Email скопійовано' : 'Копіювати email'"
            :title="copyState === 'copied' ? 'Скопійовано' : 'Копіювати email'"
            @click="copyEmail"
          >
            <v-icon
              :icon="copyState === 'copied' ? 'mdi-check' : 'mdi-content-copy'"
              size="15"
              aria-hidden="true"
            />
            <span>{{ copyState === 'copied' ? 'Скопійовано' : 'Копіювати' }}</span>
          </button>
        </div>

        <a
          :href="telegram.link"
          class="mm-contact-row mm-contact-row--secondary"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Написати в Telegram у новій вкладці"
        >
          <span class="mm-contact-row__icon" aria-hidden="true">
            <v-icon :icon="telegram.icon" size="21" />
          </span>
          <span class="mm-contact-row__copy">
            <span class="mm-contact-row__hint">ШВИДКИЙ ЗВ’ЯЗОК</span>
            <strong>{{ telegram.label }}</strong>
          </span>
          <v-icon
            class="mm-contact-row__arrow"
            icon="mdi-arrow-top-right"
            size="18"
            aria-hidden="true"
          />
        </a>
      </div>

      <div class="mm-contact-socials" role="group" aria-label="Інші профілі">
        <a
          v-for="item in socials"
          :key="item.label"
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          class="mm-contact-social-item"
          :aria-label="`Відкрити профіль ${item.label} у новій вкладці`"
        >
          <v-icon class="mm-contact-social-icon" :icon="item.icon" size="18" aria-hidden="true" />
          <span>{{ item.label }}</span>
          <v-icon
            icon="mdi-arrow-top-right"
            class="mm-contact-external"
            size="15"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>

    <p class="mm-contact__status" aria-live="polite" aria-atomic="true">
      {{
        copyState === 'copied'
          ? 'Email скопійовано в буфер обміну.'
          : copyState === 'error'
            ? 'Не вдалося скопіювати. Натисни на адресу, щоб відкрити пошту.'
            : ''
      }}
    </p>
  </section>
</template>
