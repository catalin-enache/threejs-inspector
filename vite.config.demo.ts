/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { Mode, plugin as mdPlugin } from 'vite-plugin-markdown';
// @ts-ignore
import { alias, extensions } from './vite.config.shared';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mdPlugin({ mode: [Mode.HTML, Mode.MARKDOWN] })],
  root: 'demo/',
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
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
    sourcemap: true,
    assetsInlineLimit: 0,
    target: 'esnext'
  },
  resolve: {
    alias,
    extensions
  },
  assetsInclude: []
});
