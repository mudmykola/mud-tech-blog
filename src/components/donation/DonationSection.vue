<template>
  <section class="donation-block">
    <h2>💥 Донать — щоб русня горіла 🔥</h2>
    <p>
      Тут має бути твій донат. А там — вибух. <br />
      Кожна гривня = мінус один окупант. Працює безвідмовно. 🇺🇦
    </p>

    <div class="donation-links">
      <a class="donation-links__mono" :href="monobankUrl" target="_blank" rel="noopener" @click="trackDonate">
        💳 Зарядити через Monobank
      </a>
      <a href="https://savelife.in.ua/donate/" target="_blank" rel="noopener" @click="trackSupportFund">
        🎯 Підтримати “Повернись живим”
      </a>
    </div>

    <p class="small-print">💬 Дякуємо за підтримку. Русня сама себе не утилізує!</p>
  </section>
</template>

<script setup>
import { useAnalytics } from '@/composable/useAnalytics.js'
const monobankUrl = "https://send.monobank.ua/jar/9BwUkcaT2j"
const { trackEvent } = useAnalytics()

const trackDonate = () => {
  trackEvent({
    action: 'donate_click',
    category: 'support',
    label: 'donation_monobank',
    value: 1
  })
}

const trackSupportFund = () => {
  trackEvent({
    action: 'donate_click',
    category: 'support',
    label: 'donation_savelife',
    value: 1
  })
}
</script>

<style scoped lang="scss">
.donation-links__mono{
  display: none;
}
.donation-block {
  margin: 60px 0 40px;
  padding: 28px 24px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 230, 0, 0.07), rgba(255, 200, 0, 0.03));
  border: 1px solid rgba(255, 255, 100, 0.15);
  text-align: center;
  box-shadow: 0 0 24px rgba(255, 255, 0, 0.07);
  animation: pulse-glow 3s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 24px rgba(255, 255, 0, 0.07);
  }
  50% {
    box-shadow: 0 0 36px rgba(255, 255, 0, 0.15);
  }
}

.donation-block h2 {
  margin-bottom: 16px;
  font-size: 1.9rem;
  color: #ffde00;
  text-shadow: 0 0 6px #ffee80;
}

.donation-block p {
  margin-bottom: 24px;
  font-size: 1.15rem;
  color: #f8f8f8;
  line-height: 1.7;
}

.donation-block .small-print {
  margin-top: 22px;
  font-size: 0.95rem;
  color: #bbb;
}

.donation-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.donation-links a {
  background: #ffd700;
  color: #111;
  padding: 15px 24px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 800;
  font-size: 1.1rem;
  width: 100%;
  max-width: 360px;
  transition: all 0.25s;
  box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
}

.donation-links a:hover {
  background: #fff366;
  transform: scale(1.05);
  box-shadow: 0 0 14px rgba(255, 215, 0, 0.45);
}

@media (max-width: 480px) {
  .donation-block {
    padding: 24px 16px;
  }

  .donation-block h2 {
    font-size: 1.5rem;
  }

  .donation-block p {
    font-size: 1rem;
  }

  .donation-links a {
    font-size: 1rem;
    padding: 12px 18px;
  }
}
</style>