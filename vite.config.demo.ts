/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { Mode, plugin as mdPlugin } from 'vite-plugin-markdown';
import glsl from 'vite-plugin-glsl';
import path from 'path';
import fg from 'fast-glob';
// @ts-ignore
import { alias, extensions } from './vite.config.shared';

const htmlPages = fg.sync('demo/*.html', { dot: false }).reduce<Record<string, string>>((entries, file) => {
  const name = path.basename(file, '.html');
  entries[name] = path.resolve(__dirname, file);
  return entries;
}, {});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mdPlugin({ mode: [Mode.HTML, Mode.MARKDOWN] }),
    glsl({
      root: '/'
    })
  ],
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
    target: 'esnext',

    rollupOptions: {
      input: htmlPages
    }
  },
  resolve: {
    alias,
    extensions
  },
  assetsInclude: []
});
