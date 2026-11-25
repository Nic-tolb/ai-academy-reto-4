/**
 * Reglas del logo (manual de marca v1.0, §03, APROBADO).
 * Las usan el componente Logo.astro y las pruebas de navegador.
 */
export type LogoVariant = 'vertical' | 'horizontal';

export const LOGO_RULES: Readonly<Record<LogoVariant, { minWidth: number; academyRatio: number }>> =
  {
    // «ACADEMY» mide 76 px de alto en el archivo vertical de 704 px (medido en el original).
    vertical: { minWidth: 120, academyRatio: 76 / 704 },
    // «ACADEMY» mide 69 px de alto en el archivo horizontal de 316 px.
    horizontal: { minWidth: 160, academyRatio: 69 / 316 },
  };

/** Zona de protección: x = altura de «ACADEMY» a la altura dibujada del logo. */
export const clearSpaceFor = (variant: LogoVariant, renderedHeight: number): number =>
  Math.ceil(renderedHeight * LOGO_RULES[variant].academyRatio);
