import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { Mode, plugin as mdPlugin } from 'vite-plugin-markdown';
import path from 'path';

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mdPlugin({ mode: [Mode.HTML, Mode.MARKDOWN] })],
  root: 'src/',
  publicDir: '../public',
  base: './',
  server: {
    host: true,
    open: !isCodeSandbox
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    assetsInlineLimit: 0
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      assets: path.resolve(__dirname, './src/assets'),
      components: path.resolve(__dirname, './src/components'),
      lib: path.resolve(__dirname, './src/lib'),
      scenarios: path.resolve(__dirname, './src/scenarios')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  assetsInclude: []
});
