// Генерирует public/og.png (1200×630) в фирменном стиле. Нужен Playwright: npx playwright install chromium
import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const f = (p) => pathToFileURL(path.join(root, 'node_modules/@fontsource', p)).href;
const site = JSON.parse(readFileSync(path.join(root, 'src/data/site.json'), 'utf-8'));
const photo = pathToFileURL(path.join(root, 'public/img', `${site.hero.photo}-800.webp`)).href;
const rating = String(site.ratings.yandex.value).replace('.', ',');

const leaf = (x, y, w, r) => `<svg style="position:absolute;left:${x}px;top:${y}px;width:${w}px;transform:rotate(${r}deg)" viewBox="0 0 40 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EACFAA"/><stop offset=".55" stop-color="#D3B698"/><stop offset="1" stop-color="#C49869"/></linearGradient></defs><path d="M20 2C35 15 39 35 20 62 1 35 5 15 20 2Z" fill="url(#g)"/><path d="M20 9v50M20 22l-7-6M20 22l7-6M20 33l-9-7M20 33l9-7M20 44l-8-6M20 44l8-6" fill="none" stroke="#9c7a52" stroke-width="1.1" opacity=".55"/></svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:C;src:url(${f('cormorant-garamond/files/cormorant-garamond-cyrillic-600-normal.woff2')})}
@font-face{font-family:C;src:url(${f('cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2')});unicode-range:U+0000-00FF}
@font-face{font-family:C;font-style:italic;src:url(${f('cormorant-garamond/files/cormorant-garamond-cyrillic-500-italic.woff2')})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#023A35;color:#F4E3D1;position:relative;overflow:hidden;font-family:C;font-variant-numeric:lining-nums}
.frame{position:absolute;inset:22px;border:1px solid rgba(211,182,152,.55)}
.frame:after{content:'';position:absolute;inset:6px;border:1px solid rgba(211,182,152,.25)}
.m{font-family:C;font-weight:600;font-size:17px;letter-spacing:.2em;text-transform:uppercase}
.top{position:absolute;left:70px;right:70px;top:56px;display:flex;justify-content:space-between;border-bottom:1px solid rgba(211,182,152,.4);padding-bottom:14px;color:#D3B698}
h1{position:absolute;left:64px;top:110px;font-family:C;font-weight:600;font-size:196px;line-height:.82;letter-spacing:-.02em;color:#F4E3D1}
h1 em{display:block;font-style:italic;font-weight:500;color:#D3B698;padding-left:250px}
.sub{position:absolute;left:70px;bottom:66px;color:#EACFAA;line-height:1.75}
.tag{position:absolute;right:78px;top:118px;width:340px;background:#F4E3D1;padding:12px;transform:rotate(3deg);box-shadow:0 30px 50px -24px rgba(0,0,0,.6)}
.tag img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.tag .m{font-size:12px;display:flex;justify-content:space-between;color:#023A35;padding:0 2px 10px}
.seal{position:absolute;right:350px;top:390px;width:146px;height:146px;border-radius:50%;background:#C49869;color:#002625;display:grid;place-items:center;transform:rotate(-10deg);box-shadow:0 14px 30px -14px rgba(0,0,0,.6)}
.seal b{font-family:C;font-size:62px;line-height:1}
.seal i{position:absolute;inset:12px;border:1px dashed rgba(0,38,37,.5);border-radius:50%}
.seal s{position:absolute;bottom:30px;font-family:C;font-weight:600;font-size:12px;letter-spacing:.16em;text-decoration:none;text-transform:uppercase}
</style></head><body>
<div class="frame"></div>
<div class="top m"><span>Лот № 166 · Ленинский пр. · Санкт-Петербург</span><span>◆ Обжарка: свежая</span></div>
<h1>Микро<em>лот</em></h1>
<p class="sub m">Спешелти-кофейня · свежеобжаренные микролоты<br>Ленинский пр., 166 · Варшавская, 23 к1</p>
${leaf(612, 116, 34, 28)}${leaf(200, 380, 28, -24)}${leaf(1080, 520, 30, 40)}${leaf(720, 470, 24, -60)}
<div class="tag"><div class="m"><span>Microlot Coffee</span><span>№ 166</span></div><img src="${photo}"></div>
<div class="seal"><i></i><b>${rating}</b><s>Яндекс Карты</s></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const tmp = path.join(root, 'scripts', '.og.tmp.html');
writeFileSync(tmp, html);
await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, 'public/og.png') });
await browser.close();
rmSync(tmp);
console.log('og: public/og.png');
