<template>
  <div class="mm-blog-sidebar-sk" aria-hidden="true">
    <section class="mm-blog-sidebar-sk-panel">
      <div class="mm-blog-sidebar-sk-head">
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--icon" />
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--head" />
      </div>

      <div class="mm-blog-sidebar-sk-list">
        <div v-for="item in 7" :key="`tag-${item}`" class="mm-blog-sidebar-sk-item">
          <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--line" />
          <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--count" />
        </div>
      </div>
    </section>

    <section class="mm-blog-sidebar-sk-panel">
      <div class="mm-blog-sidebar-sk-head">
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--icon" />
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--head-short" />
      </div>

      <div class="mm-blog-sidebar-sk-actions">
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--btn" />
        <div class="mm-blog-sidebar-sk-el mm-blog-sidebar-sk-el--btn" />
      </div>
    </section>
  </div>
</template>
