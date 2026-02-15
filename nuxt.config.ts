// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/image', '@auth0/auth0-nuxt'],
  css: ['./app/assets/scss/main.scss'],
  app: {
    head: {
      title: 'The MBA Mentor',
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      script: [
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-DRQ7D058H6',
          async: true,
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            // IMPORTANT for Nuxt/Vue SPA: disable automatic page_view here
            gtag('config', 'G-DRQ7D058H6', { send_page_view: false });
          `,
        },
      ],
    },
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL ?? '',
    zohoCampaigns: {
      clientId: process.env.ZOHO_CLIENT_ID ?? '',
      clientSecret: process.env.ZOHO_CLIENT_SECRET ?? '',
      refreshToken: process.env.ZOHO_REFRESH_TOKEN ?? '',
      listKey: process.env.ZOHO_CAMPAIGNS_LIST_KEY ?? '',
      orgId: process.env.ZOHO_CAMPAIGNS_ORG_ID ?? '',
      dc: process.env.ZOHO_DC ?? 'zoho.in',
      baseUrl: process.env.ZOHO_CAMPAIGNS_BASE_URL ?? 'campaigns.zoho.in',
    },
    authPasswordlessResendCooldownSeconds:
      process.env.AUTH_PASSWORDLESS_RESEND_COOLDOWN_SECONDS ?? '90',
    auth0: {
      domain: process.env.AUTH0_DOMAIN ?? '',
      clientId: process.env.AUTH0_CLIENT_ID ?? '',
      clientSecret: process.env.AUTH0_CLIENT_SECRET ?? '',
      secret: process.env.AUTH0_SECRET ?? '',
      appBaseUrl:
        process.env.AUTH0_APP_BASE_URL ??
        (process.env.NODE_ENV === 'production'
          ? 'https://skyinnk.onrender.com'
          : 'http://localhost:3000'),
      routes: {
        login: '/auth/login',
        callback: '/auth/callback',
        logout: '/auth/logout',
      },
    },
    public: {
      maintenanceMode: process.env.NUXT_PUBLIC_MAINTENANCE_MODE || 'false',
      gaMeasurementId:
        process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || 'G-DRQ7D058H6',
    },
  },
  nitro: {
    preset: 'node-server',
    rollupConfig: {
      external: [/^@prisma\//, /\.wasm$/],
    },
  },
  ssr: true,
});
