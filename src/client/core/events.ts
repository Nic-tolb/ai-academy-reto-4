/**
 * Bus de eventos tipado: la única vía de comunicación entre módulos.
 * Ningún módulo importa a otro; publican y escuchan aquí.
 *
 *   hero ──profile──► recommender
 *   menu ──menuToggle──► action-bar
 *   recommender ──recommenderFocus──► action-bar
 *   motion ──heroBoost──► hero (campo de trayectorias)
 */
import type { Profile } from '../../data/profiles';

export interface Events {
  /** Perfil elegido en el hero. */
  profile: Profile;
  /** El foco entró (true) o salió (false) del recomendador. */
  recommenderFocus: boolean;
  /** Menú móvil abierto (true) o cerrado (false). */
  menuToggle: boolean;
  /** Progreso del scroll sobre el hero (0–1), para el «despegue». */
  heroBoost: number;
}

type Handler<K extends keyof Events> = (value: Events[K]) => void;

// Internamente se guardan sin tipo; la API pública (`on`/`emit`) sí está tipada.
const handlers = new Map<keyof Events, Set<(value: never) => void>>();
const state: { profile: Profile | null } = { profile: null };

export function on<K extends keyof Events>(event: K, handler: Handler<K>): () => void {
  let set = handlers.get(event);
  if (!set) handlers.set(event, (set = new Set()));
  set.add(handler as (value: never) => void);
  return () => set.delete(handler as (value: never) => void);
}

export function emit<K extends keyof Events>(event: K, value: Events[K]): void {
  if (event === 'profile') state.profile = value as Profile;
  (handlers.get(event) as Set<Handler<K>> | undefined)?.forEach((h) => {
    try {
      h(value);
    } catch (error) {
      // Un oyente con error no impide que los demás reciban el evento.
      console.warn(`[events] error en el evento «${event}»`, error);
    }
  });
}

export const getProfile = (): Profile | null => state.profile;
