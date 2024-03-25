import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
const isCodeSandbox =
  'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '_src/',
  publicDir: '../public',
  base: './',
  server: {
    host: true,
    open: !isCodeSandbox // Open if it's not a CodeSandbox
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './_src'),
      assets: path.resolve(__dirname, './_src/assets'),
      components: path.resolve(__dirname, './_src/components'),
      lib: path.resolve(__dirname, './_src/lib'),
      scenarios: path.resolve(__dirname, './_src/scenarios')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  }
});
