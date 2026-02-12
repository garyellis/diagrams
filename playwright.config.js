import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    use: {
        baseURL: 'http://localhost:3333',
    },
    projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
    webServer: {
        command: 'npx serve . -l 3333 --no-clipboard',
        port: 3333,
        reuseExistingServer: true,
    },
});
