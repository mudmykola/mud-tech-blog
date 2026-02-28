<script setup>
  import { onMounted } from 'vue'
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import AboutHeader from '@/components/about/AboutHeader.vue'
  import AboutIntro from '@/components/about/AboutIntro.vue'
  import AboutStack from '@/components/about/AboutStack.vue'
  import AboutProjects from '@/components/about/AboutProjects.vue'
  import AboutContact from '@/components/about/AboutContact.vue'
  import { useJsonLd } from '@/composables/useJsonLd'
  import {
    generateAboutPageJsonLd,
    generateOrganizationJsonLd,
    generatePersonJsonLd,
    generateWebSiteJsonLd,
  } from '@/utils/jsonld'

  onMounted(() => {
    useJsonLd([
      generateOrganizationJsonLd(),
      generateWebSiteJsonLd(),
      generateAboutPageJsonLd({
        path: '/about',
        name: 'Про автора та досвід у Frontend eCommerce | Mud Tech Blog',
        description:
          "Профіль автора Mud Tech Blog: frontend eCommerce досвід, стек технологій, проєкти і канали зв'язку.",
      }),
      generatePersonJsonLd({
        name: 'Mykola Mud`',
        jobTitle: 'Frontend eCommerce Developer',
      }),
    ])
  })
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
