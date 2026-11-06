// Скриншоты 375px и 1440px + проверка горизонтального скролла.
// Использование: npm run build && npx vite preview --port 4173 & npm run shots
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const URL = process.env.URL || 'http://localhost:4173/';
const OUT = 'shots';
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const [name, viewport, extra] of [
  ['mobile', { width: 375, height: 812 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ['desktop', { width: 1440, height: 900 }, {}],
]) {
  const ctx = await browser.newContext({ viewport, locale: 'ru-RU', timezoneId: 'Europe/Moscow', ...extra });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/${name}-first.png` });

  // прокрутить всё, чтобы сработали анимации появления
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(1200);

  const overflow = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    const bad = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width && (r.right > W + 1 || r.left < -1)) {
        if (el.closest('.shots, .bags, .tabs, .hero__floats, .steps, .lot__viewport')) return;
        bad.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} → ${Math.round(r.left)}..${Math.round(r.right)}`);
      }
    });
    return { scrollW: document.documentElement.scrollWidth, W, bad: bad.slice(0, 20) };
  });
  console.log(name, JSON.stringify(overflow, null, 1));
  if (errors.length) console.log('errors:', errors);

  const sections = ['#top', '#lot', '#menu', '#beans', '#why', '#atmosphere', '#rating', '#points', '#contacts'];
  for (const s of sections) {
    const el = await page.$(s);
    await el.scrollIntoViewIfNeeded();
    await page.evaluate((s) => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY); }, s);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${name}-${s.slice(1)}.png` });
  }
  await ctx.close();
}
await browser.close();
