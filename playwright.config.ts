import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas de navegador.
 * - Por defecto, sobre la compilación de producción servida en local (`npm run build` antes).
 * - Sobre el sitio publicado: E2E_BASE_URL=https://nic-tolb.github.io/landing-ai-academy/ npm run test:e2e
 * - En CI se usa el Chromium de Playwright; en local se puede elegir otro navegador
 *   instalado con PW_CHANNEL (p. ej. PW_CHANNEL=msedge).
 */
const PORT = 4322;
const channel = process.env.PW_CHANNEL;
const external = process.env.E2E_BASE_URL;
// Con barra final, para que `page.goto('./')` resuelva dentro de la subruta.
const baseURL = (external ?? `http://127.0.0.1:${PORT}`).replace(/\/?$/, '/');

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI || external ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    ...(channel ? { channel } : {}),
  },
  projects: [
    {
      name: 'movil-375',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'escritorio-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  ...(external
    ? {}
    : {
        webServer: {
          command: `npm run preview -- --host 127.0.0.1 --port ${PORT}`,
          url: `http://127.0.0.1:${PORT}`,
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
        },
      }),
});
