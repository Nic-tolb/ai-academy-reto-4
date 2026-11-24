// @ts-check
import { defineConfig } from 'astro/config';

// La URL definitiva se ajusta al publicar (Fase 8).
export default defineConfig({
  site: 'https://landing-ai-academy.vercel.app',
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
