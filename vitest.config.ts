import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['scripts/**/*.test.ts', 'src/**/*.test.ts'],
    globals: true,
  },
});
