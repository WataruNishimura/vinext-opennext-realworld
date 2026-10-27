import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // `server-only` throws outside the react-server condition; tests run queries directly.
    alias: [
      {
        find: /^server-only$/,
        replacement: fileURLToPath(new URL('./test/server-only.ts', import.meta.url)),
      },
    ],
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
