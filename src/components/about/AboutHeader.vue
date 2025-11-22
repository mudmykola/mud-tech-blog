<script setup>
  const avatar = '/images/avatar.jpg'
  const title = 'Привіт! Я Микола'
  const subtitle = 'Frontend eCommerce Developer'
</script>

<template>
  <v-container class="mm-about-header" max-width="960">
    <v-row align="center" justify="center" class="mm-about-row">
      <v-col cols="12" md="3" class="mm-about-avatar-col">
        <div class="mm-about-avatar-wrap">
          <img :src="avatar" alt="Avatar" class="mm-about-avatar" />
        </div>
      </v-col>

      <v-col cols="12" md="9" class="mm-about-text-col">
        <h1 class="mm-about-title">{{ title }}</h1>
        <p class="mm-about-subtitle">{{ subtitle }}</p>
      </v-col>
    </v-row>
  </v-container>
</template>
