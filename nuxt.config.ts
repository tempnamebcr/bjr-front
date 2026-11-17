// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  // Listen on all interfaces so the dev server is reachable from outside the container.
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
  // Server-only on purpose: nothing under `public`, so the browser never learns the
  // backend URL and can only talk to Nuxt's own /api routes.
  // Overridden at runtime by NUXT_BACKEND_URL and NUXT_USE_MOCK.
  runtimeConfig: {
    backendUrl: 'http://localhost:8000',
    useMock: false,
  },
  typescript: {
    strict: true,
  },
})
