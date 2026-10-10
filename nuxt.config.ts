// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  runtimeConfig: {
    supabaseUrl: '',
    supabaseKey: '',
    supabaseSecretKey: '',
    stripeSecretKey: '',
    siteUrl: 'http://localhost:3000',
    stripeWebhookSecret: ''
  },
  modules: ['@nuxtjs/i18n'],
  i18n: {
    strategy: 'prefix',
    defaultLocale: 'it',
    langDir: 'locales',

    locales: [
      {
        code: 'it',
        language: 'it-IT',
        name: 'Italiano',
        file: 'it.json'
      },
      {
        code: 'en',
        language: 'en-GB',
        name: 'English',
        file: 'en.json'
      }
    ],

    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'it'
    }
  },
})
