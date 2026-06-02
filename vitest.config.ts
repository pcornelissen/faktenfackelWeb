import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['shared/**/*.test.ts', 'scripts/**/*.test.ts', 'server/**/*.test.ts', 'app/**/*.test.ts'],
    environment: 'node',
  },
})
