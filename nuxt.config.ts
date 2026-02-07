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
  modules: ['@nuxt/image', '@nuxt/hints', '@auth0/auth0-nuxt'],
  runtimeConfig: {
    auth0: {
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      sessionSecret: process.env.AUTH0_SECRET,
      appBaseUrl: process.env.AUTH0_BASE_URL,
    },
  },
});
