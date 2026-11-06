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

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:C;src:url(${f('cormorant-garamond/files/cormorant-garamond-cyrillic-600-normal.woff2')})}
@font-face{font-family:C;src:url(${f('cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2')});unicode-range:U+0000-00FF}
@font-face{font-family:C;font-style:italic;src:url(${f('cormorant-garamond/files/cormorant-garamond-cyrillic-500-italic.woff2')})}
@font-face{font-family:M;src:url(${f('jetbrains-mono/files/jetbrains-mono-cyrillic-400-normal.woff2')})}
@font-face{font-family:M;src:url(${f('jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2')});unicode-range:U+0000-00FF}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#F3ECE2;color:#22150F;position:relative;overflow:hidden;font-family:M}
.m{font-family:M;font-size:15px;letter-spacing:.1em;text-transform:uppercase}
.top{position:absolute;left:64px;right:64px;top:44px;display:flex;justify-content:space-between;border-bottom:1px solid rgba(42,26,20,.25);padding-bottom:14px;color:#5a4a40}
.top b{color:#B3261E;font-weight:400}
h1{position:absolute;left:58px;top:96px;font-family:C;font-weight:600;font-size:200px;line-height:.82;letter-spacing:-.02em}
h1 em{display:block;font-style:italic;font-weight:500;color:#B3261E;padding-left:250px}
.sub{position:absolute;left:64px;bottom:58px;font-size:17px;color:#5a4a40;letter-spacing:.06em;text-transform:uppercase;line-height:1.7}
.sub span{color:#22150F}
.tag{position:absolute;right:70px;top:110px;width:360px;background:#F8F3EC;border:1px solid rgba(42,26,20,.2);padding:12px;transform:rotate(3deg);box-shadow:0 30px 50px -30px rgba(42,26,20,.6)}
.tag img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
.tag .m{font-size:11px;display:flex;justify-content:space-between;color:#5a4a40;padding:0 2px 10px}
.seal{position:absolute;right:360px;top:380px;width:150px;height:150px;border-radius:50%;background:#B3261E;color:#F3ECE2;display:grid;place-items:center;transform:rotate(-10deg);box-shadow:0 14px 30px -14px rgba(143,29,23,.8)}
.seal b{font-family:C;font-size:62px;line-height:1}
.seal i{position:absolute;inset:14px;border:1px dashed rgba(243,236,226,.6);border-radius:50%}
.seal s{position:absolute;bottom:28px;font-family:M;font-size:10px;letter-spacing:.12em;text-decoration:none}
</style></head><body>
<div class="top m"><span>Лот № 166 · Ленинский пр. · Санкт-Петербург</span><b>◆ Обжарка: свежая</b></div>
<h1>Микро<em>лот</em></h1>
<p class="sub">Спешелти-кофейня · <span>свежеобжаренные микролоты</span><br>Ленинский пр., 166 · Варшавская, 23 к1</p>
<div class="tag"><div class="m"><span>Microlot Coffee</span><span>№ 166</span></div><img src="${photo}"></div>
<div class="seal"><i></i><b>${rating}</b><s>ЯНДЕКС КАРТЫ</s></div>
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
