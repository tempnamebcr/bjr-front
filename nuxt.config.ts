// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  runtimeConfig: {
    apiBase: process.env.API_BASE || 'http://api:8000',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000'
    }
  }
})
