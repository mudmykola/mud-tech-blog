<script setup>
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import AboutHeader from '@/components/about/AboutHeader.vue'
  import AboutIntro from '@/components/about/AboutIntro.vue'
  import AboutStack from '@/components/about/AboutStack.vue'
  import AboutProjects from '@/components/about/AboutProjects.vue'
  import AboutContact from '@/components/about/AboutContact.vue'
</script>

<template>
  <DefaultLayout>
    <section class="mm-about">
      <AboutHeader />
      <div class="mm-about__content">
        <AboutIntro />
        <AboutStack />
        <AboutProjects />
        <AboutContact />
      </div>
    </section>
  </DefaultLayout>
</template>
