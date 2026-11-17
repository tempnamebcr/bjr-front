import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Plain Vitest (no Nuxt runtime): the tested code is pure functions and composables that only use Vue.
export default defineConfig({
  resolve: {
    alias: {
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
      // Same as Nuxt's ~ alias (matches '~' and '~/…').
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
})
