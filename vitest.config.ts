import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'fetch',
    setupFiles: ['./test/network-guard.ts'],
  },
});
