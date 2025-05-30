/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { Mode, plugin as mdPlugin } from 'vite-plugin-markdown';
import { alias, extensions } from './vite.config.shared';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mdPlugin({ mode: [Mode.HTML, Mode.MARKDOWN] })],
  root: 'src/',
  // base: process.env.NODE_ENV === 'production' ? '/threejs-inspector/' : './',
  base: './',
  publicDir: '../public',
  server: {
    host: true,
    open: true
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  esbuild: {
    supported: {
      'top-level-await': true
    }
  },
  resolve: {
    alias,
    extensions
  },
  assetsInclude: [],
  test: {
    // root: './src/tests',
    browser: {
      screenshotFailures: false,
      provider: 'playwright', // 'webdriverio' | 'playwright'
      enabled: true,
      headless: false, // overridden in CLI
      viewport: { width: 800, height: 600 },
      instances: [
        {
          browser: 'chromium'
        }
      ]
    },
    allowOnly: true,
    maxConcurrency: 1,
    minWorkers: 1,
    testTimeout: 5000,
    restoreMocks: true,
    sequence: {
      concurrent: false
    }
  }
});
