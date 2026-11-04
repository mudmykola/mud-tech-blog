<script setup>
  defineProps({
    loading: Boolean,
  })
</script>
<template>
  <div class="spinner-container">
    <div class="spinner">
      <div class="drop"></div>
      <div class="drop"></div>
      <div class="drop"></div>
    </div>
  </div>
</template>
