<template>
  <HomeHero />
  <HomeBlogs />

  <div class="container">
    <HomeLeadRegisterForm />
  </div>
</template>

<script setup lang="ts">
import HomeHero from '~~/app/components/home/Hero.vue';
import HomeBlogs from '~~/app/components/home/Blogs.vue';
import HomeLeadRegisterForm from '~~/app/components/home/LeadRegisterForm.vue';
</script>

<style scoped lang="scss">
@use '../assets/scss/components/_home' as *;
</style>
