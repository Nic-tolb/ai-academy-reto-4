/**
 * Estado compartido mínimo entre piezas (hero → recomendador → campo).
 * Un bus de eventos tipado evita dependencias directas entre módulos.
 */
import type { Profile } from '../../data/profiles';

interface Events {
  profile: Profile;
  recommenderFocus: boolean;
}

type Handler<K extends keyof Events> = (value: Events[K]) => void;

// Internamente se guardan sin tipo; la API pública (`on`/`emit`) sí está tipada.
const handlers = new Map<keyof Events, Set<(value: never) => void>>();
const state: { profile: Profile | null } = { profile: null };

export function on<K extends keyof Events>(event: K, handler: Handler<K>): void {
  let set = handlers.get(event);
  if (!set) handlers.set(event, (set = new Set()));
  set.add(handler as (value: never) => void);
}

export function emit<K extends keyof Events>(event: K, value: Events[K]): void {
  if (event === 'profile') state.profile = value as Profile;
  (handlers.get(event) as Set<Handler<K>> | undefined)?.forEach((h) => {
    try {
      h(value);
    } catch (error) {
      console.warn(`[store] error en el evento «${event}»`, error);
    }
  });
}

export const getProfile = (): Profile | null => state.profile;
