import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/**/*.spec.ts',
      'src/**/*.spec.ts',
      'apps/*/src/**/*.spec.ts',
      'packages/*/src/**/*.spec.ts',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.turbo/**'],
    reporters: ['default', 'junit', 'json'],
    outputFile: {
      junit: './test-reports/junit.xml',
      json: './test-reports/summary.json',
    },
    coverage: {
      provider: 'v8',
      enabled: true,
      reportsDirectory: './test-reports/coverage',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 90,
        lines: 85,
      },
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.d.ts', '**/*.config.*', '**/prisma/**'],
    },
  },
});
