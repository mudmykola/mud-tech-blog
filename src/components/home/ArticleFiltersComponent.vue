<script setup>
  defineProps({
    searchQuery: String,
    sortBy: String,
  })

  const emit = defineEmits(['update:searchQuery', 'update:sortBy'])

  const sortOptions = [
    { value: 'date_desc', label: 'Новіші' },
    { value: 'date_asc', label: 'Старіші' },
    { value: 'title_asc', label: 'А-Я' },
    { value: 'title_desc', label: 'Я-А' },
  ]
</script>

<template>
  <div class="mm-filters">
    <div class="mm-filters__control">
      <v-text-field
        :model-value="searchQuery"
        class="mm-search"
        density="comfortable"
        hide-details
        placeholder="Пошук статей..."
        prepend-inner-icon="mdi-text-search-variant"
        rounded="lg"
        variant="outlined"
        @update:model-value="emit('update:searchQuery', $event)"
      />
    </div>

    <div class="mm-filters__control mm-filters__control--sort">
      <v-select
        :items="sortOptions"
        :model-value="sortBy"
        :menu-props="{ contentClass: 'mm-sort-menu' }"
        class="mm-sort"
        density="comfortable"
        prepend-inner-icon="mdi-tune-variant"
        hide-details
        item-title="label"
        item-value="value"
        rounded="lg"
        variant="outlined"
        @update:model-value="emit('update:sortBy', $event)"
      />
    </div>
  </div>
</template>
