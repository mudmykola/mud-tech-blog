<script setup>
  import deployMeta from '@/data/deploy-version.json'

  const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="mm-footer">
    <div class="mm-footer__inner">
      <p class="mm-footer__text">© {{ currentYear }} MudTech Blog · All rights reserved</p>
      <div class="mm-footer__version" aria-label="Deploy version">
        <span class="mm-footer__version-dot" />
        <span class="mm-footer__version-label">release</span>
        <strong>{{ deployMeta.releaseVersion }}</strong>
      </div>
    </div>
  </footer>
</template>
