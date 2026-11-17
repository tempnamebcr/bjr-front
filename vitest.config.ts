import { defineConfig } from 'vitest/config'

// Plain Vitest (no Nuxt runtime): the tested code is pure functions in app/utils and shared/.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
})
