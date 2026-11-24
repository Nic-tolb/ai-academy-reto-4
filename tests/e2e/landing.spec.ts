import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { LINKS } from '../../src/data/links';
import { MISSIONS } from '../../src/data/missions';
import { PHASES } from '../../src/data/phases';
import {
  canvasInk,
  collectErrors,
  expectNoHorizontalOverflow,
  goToSection,
  scrollThrough,
  waitForReveals,
} from './helpers';

test.describe('estabilidad', () => {
  test('carga y se recorre completa sin errores ni desbordamiento lateral', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await scrollThrough(page);
    await page.waitForTimeout(500);
    await expectNoHorizontalOverflow(page);
    expect(errors).toEqual([]);
  });

  test('el campo del hero dibuja en el canvas', async ({ page }) => {
    await page.goto('/');
    await expect.poll(() => canvasInk(page), { timeout: 5000 }).toBeGreaterThan(20);
  });
});

test.describe('contenido y enlaces reales', () => {
  test('la cuenta regresiva va de T−8 a T−0 en orden', async ({ page }) => {
    await page.goto('/');
    const codes = await page
      .locator('[data-phase]')
      .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.phaseCode));
    expect(codes).toEqual(PHASES.map((p) => p.code));
  });

  test('presenta las cinco misiones con sus duraciones', async ({ page }) => {
    await page.goto('/');
    for (const m of Object.values(MISSIONS)) {
      const card = page.locator(`#mision-${m.id}`);
      await expect(card).toContainText(m.name);
      if (m.hours) await expect(card).toContainText(String(m.hours));
      else await expect(card).toContainText(m.duration);
    }
  });

  test('inscripción y WhatsApp apuntan a los enlaces reales', async ({ page }) => {
    await page.goto('/');
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
    expect(hrefs).toContain(LINKS.inscripcion);
    expect(hrefs).toContain(LINKS.whatsapp);
    const external = hrefs.filter((h) => h.startsWith('http'));
    const allowed: string[] = Object.values(LINKS).flatMap((v) =>
      typeof v === 'string' ? [v] : [],
    );
    for (const href of external) expect(allowed).toContain(href);
  });
});

test.describe('I-01 · hero', () => {
  test('elegir un perfil muestra la misión en la primera pantalla y adapta el CTA', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Líder de equipo' }).click();
    const chip = page.locator('[data-mission-chip]');
    await expect(chip).toBeVisible();
    await expect(chip).toContainText(MISSIONS.booster.name);
    await expect(chip).toBeInViewport();
    await expect(page.locator('[data-hero-lead]')).toContainText(MISSIONS.booster.duration);
    await expect(page.locator('[data-hero-cta2]')).toHaveAttribute('href', LINKS.inscripcion);

    await page.getByRole('button', { name: 'Empresa' }).click();
    await expect(chip).toContainText(MISSIONS.odyssey.name);
    await expect(page.locator('[data-hero-cta2]')).toHaveAttribute('href', LINKS.whatsapp);
  });
});

test.describe('I-02 · recorrido', () => {
  test('el indicador marca la fase visible', async ({ page }) => {
    await page.goto('/');
    await goToSection(page, 'faqs');
    await expect(page.locator('[data-phase-label]')).toHaveText('T−1 · Control de misión');
  });
});

test.describe('I-03 · recomendador', () => {
  test('en vivo + mi equipo + automatizar → Liftoff, resaltado en las etapas', async ({ page }) => {
    await page.goto('/');
    await goToSection(page, 'planes');
    const rec = page.locator('[data-recommender]');
    await rec.getByRole('button', { name: /En vivo/ }).click();
    await rec.getByRole('button', { name: /Mi equipo/ }).click();
    await rec.getByRole('button', { name: /Automatizar procesos/ }).click();
    await expect(rec.locator('[data-r-name]')).toHaveText(MISSIONS.liftoff.name);
    await expect(page.locator('#mision-liftoff')).toHaveClass(/is-recommended/);
  });

  test('«a mi ritmo» recomienda Nebula sin más preguntas', async ({ page }) => {
    await page.goto('/');
    await goToSection(page, 'planes');
    const rec = page.locator('[data-recommender]');
    await rec.getByRole('button', { name: /A mi ritmo/ }).click();
    await expect(rec.locator('[data-r-name]')).toHaveText(MISSIONS.nebula.name);
    await rec.getByRole('button', { name: 'Volver a empezar' }).click();
    await expect(rec.locator('[data-step="formato"]')).toBeVisible();
  });

  test('el perfil del hero sugiere la respuesta de la pregunta 2', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Independiente' }).click();
    await goToSection(page, 'planes');
    await page
      .locator('[data-recommender]')
      .getByRole('button', { name: /En vivo/ })
      .click();
    await expect(page.locator('[data-step="quien"] .preset')).toHaveCount(1);
  });
});

test.describe('I-04 · exploración', () => {
  test('el antes/después cambia con el interruptor y las pestañas con el teclado', async ({
    page,
  }) => {
    await page.goto('/');
    await goToSection(page, 'casos-uso');
    await page.getByRole('button', { name: /Después/ }).click();
    await expect(page.locator('[data-panel]:not([hidden]) [data-compare]')).toHaveClass(/is-after/);

    const first = page.getByRole('tab').first();
    await first.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');
  });

  test('filtrar herramientas actualiza la ficha', async ({ page }) => {
    await page.goto('/');
    await goToSection(page, 'herramientas');
    await page.getByRole('button', { name: /^Automatizar/ }).click();
    await expect(page.locator('[data-card-name]')).toHaveText('Make');
  });
});

test.describe('accesibilidad', () => {
  test('sin infracciones graves de axe-core', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);
    await waitForReveals(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    const report = serious.flatMap((v) =>
      v.nodes.map(
        (n) =>
          `${v.id} · ${n.target.join(' ')} · ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`,
      ),
    );
    expect(report).toEqual([]);
  });

  test('el primer Tab lleva a «Saltar al contenido»', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('Saltar al contenido');
  });
});

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('no queda contenido oculto y el hero sigue respondiendo', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);
    const hidden = await page
      .locator('[data-reveal]')
      .evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity === '0').length);
    expect(hidden).toBe(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('button', { name: 'Independiente' }).click();
    await expect(page.locator('[data-mission-chip]')).toContainText(MISSIONS.ignition.name);
  });
});

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('todo el contenido está en el HTML', async ({ page }) => {
    await page.goto('/');
    const html = await page.content();
    for (const m of Object.values(MISSIONS)) expect(html).toContain(m.name);
    expect(html).toContain('HeyGen');
    expect(html).toContain('Wompi');
    expect(html).toContain(LINKS.inscripcion);
  });
});
