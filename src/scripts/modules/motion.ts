/**
 * I-02 · Recorrido narrativo con GSAP + ScrollTrigger.
 * Se carga en diferido. Si GSAP no carga, el contenido ya es visible:
 * la clase `motion-ready` (que oculta los elementos a revelar) solo se añade
 * cuando la librería está lista.
 */
import { $, $$, prefersReducedMotion, whenIdle } from '../lib/dom';
import { heroField } from './hero';

export function initMotion(): void {
  if (prefersReducedMotion()) return;

  whenIdle(async () => {
    try {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      gsap.registerPlugin(ScrollTrigger);
      document.documentElement.classList.add('motion-ready');

      // Revelado de bloques al entrar en pantalla.
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        once: true,
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, overwrite: true }),
      });
      // Lo que ya está en pantalla al cargar, se muestra sin esperar al scroll.
      ScrollTrigger.refresh();

      // Hero: el scroll acelera el «despegue» del campo de trayectorias.
      const hero = $('[data-hero]');
      if (hero) {
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => heroField.setBoost(self.progress),
        });
      }

      // Etapas: se apilan como un cohete y sus horas se encienden en orden.
      // Una sola línea de tiempo con un único disparador (el contenedor), para
      // que ninguna medida dependa de un elemento que ya está desplazado.
      const stagesBox = $('[data-stages]');
      if (stagesBox) {
        const stages = $$('[data-stage]', stagesBox);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: stagesBox, start: 'top 80%', once: true },
        });
        tl.from(stages, { y: (i: number) => 40 * (i + 1), opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 });
        stages.forEach((stage, i) => {
          tl.from($$('.hours i', stage), { scaleX: 0, duration: 0.35, ease: 'power2.out', stagger: 0.03 }, 0.3 + i * 0.25);
        });
      }

      // Red de seguridad: nada visible en pantalla puede quedar oculto o vacío.
      const rescue = () => {
        const inView = (el: Element) => {
          const r = el.getBoundingClientRect();
          return r.bottom > 0 && r.top < window.innerHeight;
        };
        $$('[data-reveal], [data-stage]').forEach((el) => {
          if (inView(el) && Number(getComputedStyle(el).opacity) < 0.05) gsap.set(el, { opacity: 1, y: 0 });
        });
        $$('.hours i').forEach((el) => {
          if (inView(el) && el.getBoundingClientRect().width < 1) gsap.set(el, { scaleX: 1 });
        });
      };
      ScrollTrigger.addEventListener('scrollEnd', () => setTimeout(rescue, 1500));
      setTimeout(rescue, 2500);
    } catch (error) {
      document.documentElement.classList.remove('motion-ready');
      console.warn('[motion] animaciones desactivadas', error);
    }
  });
}
