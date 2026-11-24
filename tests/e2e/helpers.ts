import { expect, type Page } from '@playwright/test';

/** Registra errores de consola, excepciones y peticiones fallidas de la página. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) => errors.push(`requestfailed: ${req.url()}`));
  return errors;
}

/** Recorre la página completa para disparar la carga diferida y las animaciones. */
export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
}

/** Lleva una sección al centro de la pantalla sin animación. */
export async function goToSection(page: Page, id: string): Promise<void> {
  await page.evaluate((target) => {
    document.getElementById(target)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, id);
}

/** Cuántos píxeles del canvas del hero tienen tinta (muestreo). */
export async function canvasInk(page: Page): Promise<number> {
  return page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('[data-field]');
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !canvas.width) return 0;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let ink = 0;
    for (let i = 3; i < data.length; i += 4 * 16) if ((data[i] ?? 0) > 0) ink++;
    return ink;
  });
}

/**
 * Espera a que terminen las animaciones de entrada. Sin esto, una auditoría de
 * contraste mediría el texto a mitad de su fundido (opacidad parcial).
 */
export async function waitForReveals(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page
          .locator('[data-reveal], [data-stage]')
          .evaluateAll(
            (els) => els.filter((el) => Number(getComputedStyle(el).opacity) < 0.99).length,
          ),
      { timeout: 8000 },
    )
    .toBe(0);
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}
