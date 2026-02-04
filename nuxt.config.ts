// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      title: 'The MBA Mentor',
    },
  },
  css: ['./app/assets/scss/main.scss'],
  modules: ['@nuxt/image', '@nuxt/hints'],
});
