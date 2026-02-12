<template>
  <HomeHero />
  <HomeBlogs />

  <div class="container">
    <HomeServices />
    <HomeTrust />
    <HomeCTA />
  </div>
</template>

<script setup lang="ts">
import HomeHero from '~~/app/components/home/Hero.vue';
import HomeBlogs from '~~/app/components/home/Blogs.vue';
import HomeServices from '~~/app/components/home/Services.vue';
import HomeTrust from '~~/app/components/home/Trust.vue';
import HomeCTA from '~~/app/components/home/CTA.vue';
</script>

<style scoped lang="scss">
@use '../assets/scss/components/_home' as *;
</style>
