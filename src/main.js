// Шрифты — локально, только кириллица и латиница
import '@fontsource/cormorant-garamond/cyrillic-600.css';
import '@fontsource/cormorant-garamond/cyrillic-500-italic.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/onest/cyrillic-400.css';
import '@fontsource/onest/cyrillic-500.css';
import '@fontsource/onest/latin-400.css';
import '@fontsource/onest/latin-500.css';
import './styles/main.css';

import site from './data/site.json';
import { status } from './lib/hours.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let motion = null;

/* ---------- Открыто / закрыто (Europe/Moscow) ---------- */
function updateStatus() {
  const narrow = window.innerWidth < 520;
  $$('[data-status]').forEach((el) => {
    const point = site.points.find((p) => p.id === el.dataset.status);
    if (!point) return;
    const s = status(point.schedule);
    const isHeader = el.classList.contains('status');
    let text = s.text;
    if (isHeader && narrow && !s.open) text = s.text.replace(/^Закрыто, откроемся .*в (\d\d:\d\d)$/, 'Закрыто · с $1');
    el.dataset.open = String(s.open);
    $('.status__text', el).textContent = text;
    if (isHeader) el.setAttribute('aria-label', `${point.title}: ${s.text}`);
  });
}
updateStatus();
setInterval(updateStatus, 30_000);
window.addEventListener('resize', updateStatus, { passive: true });

/* ---------- Шапка, нижняя панель ---------- */
const hdr = $('[data-hdr]');
const dock = $('.dock');
function onScroll() {
  const y = window.scrollY;
  hdr.classList.toggle('is-solid', y > 16);
  dock?.classList.toggle('is-on', y > window.innerHeight * 0.45);
}
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Мобильная навигация ---------- */
const burger = $('.burger');
const mnav = $('#mnav');
function setNav(open) {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть навигацию' : 'Открыть навигацию');
  mnav.hidden = !open;
  hdr.classList.toggle('is-open', open);
  document.documentElement.style.overflow = open ? 'hidden' : '';
  motion?.lenis?.[open ? 'stop' : 'start']();
}
burger?.addEventListener('click', () => setNav(burger.getAttribute('aria-expanded') !== 'true'));
mnav?.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !mnav.hidden) { setNav(false); burger.focus(); }
});

/* ---------- Вкладки меню ---------- */
const tabs = $$('.tab');
function selectTab(tab, focus = false) {
  const current = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
  if (current === tab) return;
  const from = $(`#${current.getAttribute('aria-controls')}`);
  const to = $(`#${tab.getAttribute('aria-controls')}`);
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
  });
  if (focus) tab.focus();
  tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
  if (motion) motion.switchPanel(from, to);
  else { from.hidden = true; to.hidden = false; }
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    selectTab(tabs[(map[e.key] + tabs.length) % tabs.length], true);
  });
});

/* ---------- Живая Яндекс-карта (лениво; если не загрузилась — остаётся схема) ---------- */
const ymap = $('[data-ymap]');
if (ymap && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    const frame = document.createElement('iframe');
    frame.title = 'Яндекс Карта: кофейня «Микролот», Ленинский проспект, 166';
    frame.src = ymap.dataset.src;
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.allowFullscreen = true;
    frame.addEventListener('load', () => { ymap.hidden = false; motion?.refresh(); }, { once: true });
    ymap.append(frame);
  }, { rootMargin: '400px 0px' });
  io.observe($('#points'));
}

/* ---------- Анимации — отдельным чанком, только если движение разрешено ---------- */
if (!reduced) {
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    import('./motion.js').then((m) => { motion = m.init(); });
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
  setTimeout(start, 1500);
}
