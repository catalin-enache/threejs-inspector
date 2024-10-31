/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { Mode, plugin as mdPlugin } from 'vite-plugin-markdown';
import path from 'path';

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mdPlugin({ mode: [Mode.HTML, Mode.MARKDOWN] })],
  root: 'src/',
  // base: process.env.NODE_ENV === 'production' ? '/threejs-inspector/' : './',
  base: './',
  publicDir: '../public',
  server: {
    host: true,
    open: !isCodeSandbox
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
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    assetsInlineLimit: 0,
    target: 'esnext'
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      assets: path.resolve(__dirname, './src/assets'),
      components: path.resolve(__dirname, './src/components'),
      lib: path.resolve(__dirname, './src/lib'),
      scenarios: path.resolve(__dirname, './src/scenarios'),
      testutils: path.resolve(__dirname, './src/tests/testutils')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  assetsInclude: [],
  test: {
    browser: {
      provider: 'playwright', // 'webdriverio' | 'playwright'
      enabled: true,
      name: 'chromium', // browser name is required
      headless: false, // overridden in CLI
      viewport: { width: 800, height: 600 },
      providerOptions: {}
    },
    allowOnly: true,
    restoreMocks: true
  }
});
