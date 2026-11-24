// @ts-check
import { defineConfig } from 'astro/config';

/**
 * SITE_URL y BASE_PATH los define el flujo de publicación (GitHub Pages sirve el
 * sitio en una subruta). En local y en las pruebas se usa la raíz.
 */
const site = process.env.SITE_URL ?? 'http://localhost:4321';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Los tokens y mixins quedan disponibles en todos los componentes.
          additionalData: `@use "/src/styles/abstracts" as *;\n`,
        },
      },
    },
  },
});
