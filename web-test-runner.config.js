import { esbuildPlugin } from '@web/dev-server-esbuild';
import { puppeteerLauncher } from '@web/test-runner-puppeteer';

// https://github.com/modernweb-dev/example-projects
export default {
  files: ['tests/**/*.test.ts'],
  plugins: [esbuildPlugin({ ts: true })],
  browsers: [
    puppeteerLauncher({
      launchOptions: {
        // executablePath: '/path/to/executable',
        headless: true,
        // defaultViewport: { width: 800, height: 800 },
        // ignoreDefaultArgs: ['--disable-extensions'],
        // devtools: true,
        args: ['--enable-gpu', '--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
      }
    })
  ],
  testFramework: {
    // https://github.com/mochajs/mocha/blob/main/example/config/.mocharc.js
    config: {
      ui: 'bdd',
      timeout: '2000'
    }
  }
};
