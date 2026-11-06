import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (v) => v.toFixed(1).replace('.', ',');

export function init() {
  const root = document.documentElement;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* --- плавный скролл (на тач-устройствах Lenis не вмешивается) --- */
  const lenis = new Lenis({ autoRaf: false, anchors: { offset: -64 }, lerp: 0.11 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* --- hero: буквы по одной --- */
  gsap.fromTo(
    '.ch__i',
    { opacity: 0, yPercent: 38, rotate: 5 },
    {
      opacity: 1, yPercent: 0, rotate: 0,
      duration: 0.9, ease: 'power3.out', stagger: 0.075, delay: 0.05,
      onComplete: () => root.classList.add('motion-ready'),
    }
  );
  gsap.from('.hero .cup', { opacity: 0, y: 24, duration: 1, ease: 'power2.out', delay: 0.35 });

  /* --- пар над чашкой --- */
  $$('.steam__p').forEach((p, i) => {
    gsap.fromTo(p, { strokeDashoffset: 0 }, { strokeDashoffset: -200, duration: 3.2 + i * 0.4, ease: 'none', repeat: -1 });
    gsap.fromTo(p, { opacity: 0.25, y: 4 }, { opacity: 0.85, y: -4, duration: 1.6 + i * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });

  /* --- зёрна и ягоды: параллакс + медленное покачивание --- */
  $$('.fl').forEach((el, i) => {
    const depth = 0.4 + (i % 3) * 0.35;
    gsap.to(el, {
      y: -window.innerHeight * 0.35 * depth, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
    gsap.to(el, { rotation: `+=${i % 2 ? -18 : 18}`, x: i % 2 ? 8 : -8, duration: 4 + i * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });

  let switching = null;
  function switchPanel(from, to) {
    switching?.kill();
    $$('.panel').forEach((p) => { if (p !== from && p !== to) p.hidden = true; });
    switching = gsap.timeline()
      .to($$('.row', from), { opacity: 0, x: 16, duration: 0.18, ease: 'power1.in', stagger: 0.02 })
      .add(() => { from.hidden = true; gsap.set($$('.row', from), { clearProps: 'all' }); to.hidden = false; })
      .fromTo($$('.row', to), { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out', stagger: 0.05 });
  }

  // остальное — когда браузер освободится, чтобы не мешать первой отрисовке
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
  idle(() => {
  /* --- «Что такое микролот» --- */
  const mm = gsap.matchMedia();
  const lot = $('.lot');
  const track = $('[data-steps]');

  mm.add('(min-width: 1024px)', () => {
    lot.classList.add('is-h');
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tw = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: lot, pin: '.lot__pin', start: 'top top', end: () => `+=${dist()}`,
        scrub: 0.8, invalidateOnRefresh: true,
        onUpdate: (st) => gsap.set('[data-lot-progress]', { scaleX: st.progress }),
      },
    });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); gsap.set(track, { clearProps: 'x' }); lot.classList.remove('is-h'); };
  });

  mm.add('(max-width: 1023px)', () => {
    ScrollTrigger.create({
      trigger: track, start: 'top 70%', end: 'bottom 70%', scrub: true,
      onUpdate: (st) => track.style.setProperty('--p', st.progress.toFixed(3)),
    });
    $$('.step', track).forEach((step) => {
      ScrollTrigger.create({ trigger: step, start: 'top 72%', onToggle: (st) => step.classList.toggle('is-on', st.isActive || st.progress > 0), end: 'bottom -9999' });
      gsap.from($('.step__card', step), { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: step, start: 'top 88%' } });
    });
  });

  /* --- меню: строки выезжают --- */
  const firstPanel = $('.panel:not([hidden])');
  if (firstPanel) {
    gsap.from($$('.row', firstPanel), {
      opacity: 0, x: -28, duration: 0.7, ease: 'power3.out', stagger: 0.06,
      scrollTrigger: { trigger: '.label', start: 'top 78%' },
    });
  }
  /* --- появление блоков --- */
  const reveal = (sel, opts = {}) =>
    ScrollTrigger.batch(sel, {
      start: 'top 88%', once: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: opts.y ?? 32 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
    });
  $$('.lot .h2, .lot .lead, .menu .h2, .beans .h2, .why .h2, .gallery .h2, .rating .h2, .points .h2, .contacts .h2').forEach((el) => gsap.set(el, { opacity: 0 }));
  reveal('.lot .h2, .lot .lead, .menu .h2, .beans .h2, .why .h2, .gallery .h2, .rating .h2, .points .h2, .contacts .h2');
  reveal('.chips li, .srow, .ticket, .soc, .shot, .quote, .scheme', { y: 24 });
  ['.chips li', '.srow', '.ticket', '.soc', '.shot', '.quote', '.scheme'].forEach((s) => gsap.set(s, { opacity: 0 }));

  gsap.from('.bag', {
    opacity: 0, y: 60, rotate: (i) => (i - 1) * 6, duration: 1, ease: 'power3.out', stagger: 0.12,
    scrollTrigger: { trigger: '.bags', start: 'top 82%' },
  });
  gsap.from('.srow__ok', {
    scale: 0, duration: 0.5, ease: 'back.out(2.5)', stagger: 0.08,
    scrollTrigger: { trigger: '.sheet', start: 'top 70%' },
  });
  gsap.from('.stamp--sheet', { scale: 1.8, opacity: 0, duration: 0.5, ease: 'power4.in', scrollTrigger: { trigger: '.sheet', start: 'top 60%' } });

  /* --- счётчики рейтинга 0 → 4,9 --- */
  $$('.count').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const o = { v: 0 };
    el.textContent = fmt(0);
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: () => (el.textContent = fmt(o.v)) }),
    });
  });
  gsap.from('.seal--big', { scale: 0.7, rotate: -25, opacity: 0, duration: 1.1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.rating', start: 'top 75%' } });

  ScrollTrigger.refresh();
  }, { timeout: 1200 });

  /* --- магнитные кнопки (только мышь) --- */
  if (finePointer) {
    $$('.magnetic').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.28);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  // пересчёт после загрузки шрифтов (меняется ширина ленты шагов)
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return { lenis, switchPanel, refresh: () => ScrollTrigger.refresh() };
}
