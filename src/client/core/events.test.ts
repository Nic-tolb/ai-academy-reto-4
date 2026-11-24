import { describe, expect, it, vi } from 'vitest';
import { emit, getProfile, on } from './events';

describe('bus de eventos', () => {
  it('entrega el valor a todos los oyentes', () => {
    const a = vi.fn();
    const b = vi.fn();
    on('heroBoost', a);
    on('heroBoost', b);
    emit('heroBoost', 0.5);
    expect(a).toHaveBeenCalledWith(0.5);
    expect(b).toHaveBeenCalledWith(0.5);
  });

  it('un oyente con error no impide que los demás reciban el evento', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const after = vi.fn();
    on('menuToggle', () => {
      throw new Error('fallo');
    });
    on('menuToggle', after);
    expect(() => emit('menuToggle', true)).not.toThrow();
    expect(after).toHaveBeenCalledWith(true);
    warn.mockRestore();
  });

  it('permite cancelar la suscripción', () => {
    const handler = vi.fn();
    const off = on('recommenderFocus', handler);
    off();
    emit('recommenderFocus', true);
    expect(handler).not.toHaveBeenCalled();
  });

  it('recuerda el último perfil elegido', () => {
    emit('profile', 'lider');
    expect(getProfile()).toBe('lider');
  });
});
