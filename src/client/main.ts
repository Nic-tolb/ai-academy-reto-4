/**
 * Punto de entrada del navegador.
 * Estabilidad primero: cada módulo arranca aislado. Si uno falla, se registra
 * el error y el resto de la página sigue funcionando (el HTML ya trae todo el contenido).
 */
import { initHeader } from './features/header';
import { initMenu } from './features/menu';
import { initPhases } from './features/phases';
import { initActionBar } from './features/action-bar';
import { initHero } from './features/hero';
import { initCases } from './features/cases';
import { initTools } from './features/tools';
import { initRecommender } from './features/recommender';
import { initMotion } from './features/motion';

type Init = () => void | Promise<void>;

function safe(name: string, init: Init): void {
  try {
    const result = init();
    if (result instanceof Promise) {
      result.catch((error: unknown) => console.warn(`[${name}] no se pudo iniciar`, error));
    }
  } catch (error) {
    console.warn(`[${name}] no se pudo iniciar`, error);
  }
}

export function boot(): void {
  document.documentElement.classList.add('js-ready');
  safe('header', initHeader);
  safe('menu', initMenu);
  safe('phases', initPhases);
  safe('action-bar', initActionBar);
  safe('recommender', initRecommender);
  safe('hero', initHero);
  safe('cases', initCases);
  safe('tools', initTools);
  safe('motion', initMotion);
}
