<script setup>
  const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="mm-footer">
    <div class="mm-footer__inner">
      <p class="mm-footer__text">© {{ currentYear }} MudTech Blog · All rights reserved</p>
    </div>
  </footer>
</template>
