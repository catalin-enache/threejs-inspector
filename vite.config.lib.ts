/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { Mode, plugin as mdPlugin } from 'vite-plugin-markdown';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import dts from 'vite-plugin-dts';
import path from 'path';
import fg from 'fast-glob';
import { resolve } from 'path';
import { alias, extensions } from './vite.config.shared';

// Scan all .ts/.tsx under src/, build an { [name]: path } map
const entry = fg.sync('src/**/*.{ts,tsx}', { cwd: __dirname }).reduce(
  (map, file) => {
    console.log(`entry: ${file}`);
    if (file.includes('tests')) return map; // skip tests
    // if (
    //   ![
    //     'src/index.ts',
    //     'src/tsExtensions.ts',
    //     'src/lib/api.ts',
    //     'src/lib/hooks.tsx',
    //     'src/lib/inspector.tsx',
    //     'src/components/CustomControl/CustomControl.ts'
    //   ].some((_file) => file.endsWith(_file))
    // )
    //   return map;
    // strip "src/" and extension, use as entry name
    const name = file.replace(/^src\//, '').replace(/\.(ts|tsx)$/, '');
    map[name] = resolve(__dirname, file);
    return map;
  },
  {} as Record<string, string>
);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mdPlugin({ mode: [Mode.HTML, Mode.MARKDOWN] }),
    dts({
      outDir: 'dist',
      // we’ll manually control "types" in package.json
      insertTypesEntry: false,
      copyDtsFiles: false,
      declarationOnly: false,
      // we don’t want one big index.d.ts
      rollupTypes: false,
      entryRoot: 'src',
      exclude: ['src/tests/**/*'],
      tsconfigPath: './tsconfig.json'
    }),
    // copy just the `public/libs` folder into `dist/libs`
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, 'public/libs'),
          dest: '' // '' means “root of dist/”
        }
      ]
    })
  ],
  root: '.',
  // base: process.env.NODE_ENV === 'production' ? '/threejs-inspector/' : './',
  base: './',
  publicDir: false,
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
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    assetsInlineLimit: 0,
    target: 'esnext',
    minify: 'esbuild',
    lib: {
      // feed every source file in as its own entry
      entry,
      formats: ['es'],
      // name each output file after its entry key:
      fileName: (_format, entryName) => `${entryName}.js`
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        /^three($|\/)/,
        /^@react-three\/fiber($|\/)/,
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^threejs-inspector($|\/)/
      ]
    }
  },
  resolve: {
    alias,
    extensions
  },
  assetsInclude: []
});
