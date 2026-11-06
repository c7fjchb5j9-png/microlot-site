// Рендер страницы из src/data/*.json. Вызывается Vite-плагином (vite.config.js)
// и в dev, и при сборке — итоговый HTML статичный, без бэкенда.
import { scheduleText, groupSchedule } from './lib/hours.js';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const rub = (n) => `${n}&nbsp;₽`;

/* ---------- SVG ---------- */

const mark = (cls = 'mark') => `
<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"><path d="M50 6 94 50 50 94 6 50Z"/><path d="M53 13C31 28 29 72 50 87"/><circle cx="55" cy="51" r="14"/><path d="M55 30v42"/></g></svg>`;

const bean = (cls) => `
<svg class="${cls}" viewBox="0 0 40 56" aria-hidden="true"><ellipse cx="20" cy="28" rx="17" ry="25" fill="#5A3624"/><path d="M20 4c-7 9 7 15 0 24s7 15 0 24" fill="none" stroke="#2A1A14" stroke-width="3" stroke-linecap="round"/><ellipse cx="13" cy="18" rx="3" ry="7" fill="#8A5A3C" opacity=".55"/></svg>`;

const berry = (cls) => `
<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="25" r="20" fill="#B3261E"/><circle cx="24" cy="25" r="20" fill="url(#berryg)"/><circle cx="17" cy="17" r="5" fill="#fff" opacity=".28"/><path d="M24 9v4M21 10l3 3 3-3" stroke="#5C120E" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;

const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><radialGradient id="berryg" cx=".35" cy=".3" r=".8"><stop offset=".6" stop-color="#B3261E" stop-opacity="0"/><stop offset="1" stop-color="#5C120E" stop-opacity=".55"/></radialGradient></defs></svg>`;

const cup = () => `
<svg class="cup" viewBox="0 0 160 170" aria-hidden="true">
  <g class="steam" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".55">
    <path class="steam__p s1" d="M58 70c-10-12 10-20 0-32s10-20 0-32"/>
    <path class="steam__p s2" d="M80 66c-10-12 10-20 0-32s10-20 0-32"/>
    <path class="steam__p s3" d="M102 70c-10-12 10-20 0-32s10-20 0-32"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M28 86h104l-8 50c-2 12-12 20-24 20H60c-12 0-22-8-24-20Z" fill="var(--paper)"/>
    <path d="M131 96c14-2 22 6 20 17-2 10-12 15-24 13"/>
    <ellipse cx="80" cy="86" rx="52" ry="9" fill="var(--crema)"/>
    <path d="M14 162h132"/>
  </g>
</svg>`;

const stepIcon = {
  farm: `<svg viewBox="0 0 96 72" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 62c14-20 28-26 42-14 10-12 30-16 50 2"/><path d="M2 70h92"/><path d="M60 46V14"/><path d="M60 22c-8-8-18-6-20 0 6 6 14 6 20 0Z"/><path d="M60 30c8-8 18-6 20 0-6 6-14 6-20 0Z"/><path d="M60 16c-3-5-1-10 0-12 1 2 3 7 0 12Z"/></g><g fill="var(--berry)"><circle cx="52" cy="32" r="3.2"/><circle cx="68" cy="38" r="3.2"/><circle cx="64" cy="42" r="2.6"/></g></svg>`,
  process: `<svg viewBox="0 0 96 72" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="72" cy="16" r="8"/><path d="M72 2v3M72 27v3M58 16h3M83 16h3M62 6l2 2M80 24l2 2M62 26l2-2M80 8l2-2"/><path d="M6 44h70l12 8H18Z"/><path d="M18 52v16M84 52v16M30 52v16M72 52v16"/></g><g fill="var(--berry)"><circle cx="24" cy="46" r="2.4"/><circle cx="34" cy="47" r="2.4"/><circle cx="44" cy="46" r="2.4"/><circle cx="54" cy="47" r="2.4"/><circle cx="64" cy="46" r="2.4"/></g></svg>`,
  roast: `<svg viewBox="0 0 96 72" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M30 4h22l-6 12H36Z"/><rect x="16" y="16" width="52" height="34" rx="17"/><circle cx="42" cy="33" r="9"/><path d="M68 33h14v-8"/><path d="M22 50l-4 18M62 50l4 18M10 68h66"/></g><path d="M42 58c-6 6 0 10 0 10s6-4 0-10Z" fill="var(--berry)"/></svg>`,
  cup: `<svg viewBox="0 0 96 72" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M36 22c-4-5 4-8 0-13M48 20c-4-5 4-8 0-13M60 22c-4-5 4-8 0-13"/><path d="M20 30h56l-5 26c-1 6-6 10-12 10H37c-6 0-11-4-12-10Z"/><path d="M76 36c8-1 12 4 10 9-1 5-7 7-12 6"/><path d="M8 70h80"/></g><ellipse cx="48" cy="30" rx="28" ry="4" fill="var(--crema)"/></svg>`,
};

const leaf = `<svg class="leaf" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4C10 4 4 9 4 16c0 1.5.3 2.8.8 4C6 14 10 10 16 8c-5 3-8 7-9.6 12.2.9.5 2 .8 3.1.8C16 21 20 14 20 4Z" fill="currentColor"/></svg>`;

const star = `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 1.5 2.6 5.5 6 .7-4.4 4.1 1.1 6L10 14.9 4.7 17.8l1.1-6L1.4 7.7l6-.7Z" fill="currentColor"/></svg>`;
const stars = (n = 5) => `<span class="stars" aria-hidden="true">${star.repeat(n)}</span>`;

const icon = {
  phone: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 2.8 9.4 6c.5.6.5 1.5 0 2.1L8 9.6a12 12 0 0 0 6.4 6.4l1.5-1.4c.6-.5 1.5-.5 2.1 0l3.2 2.8c.6.6.7 1.5.1 2.2l-1.4 1.6c-.7.8-1.8 1.1-2.8.8C10.6 20.3 3.7 13.4 2 6.9c-.3-1 0-2.1.8-2.8l1.6-1.4c.7-.6 1.6-.5 2.2.1Z" fill="currentColor"/></svg>`,
  route: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor"/></svg>`,
  tg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.4 3.6 2.9 10.8c-1.2.5-1.2 1.2 0 1.6l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.8-1.5-1.4ZM9.6 14l8.6-7.8c.4-.3 0-.5-.5-.2L7.3 12.6Z" fill="currentColor"/></svg>`,
  wa: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .2-3.2-.7-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4Z" fill="currentColor"/></svg>`,
  vk: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.8 18c-6 0-9.5-4.1-9.6-11h3c.1 5 2.4 7.2 4.2 7.6V7h2.9v4.3c1.8-.2 3.6-2.2 4.3-4.3h2.8c-.5 2.7-2.4 4.7-3.8 5.5 1.4.7 3.6 2.4 4.4 5.5h-3.1c-.7-2.1-2.3-3.7-4.6-3.9V18Z" fill="currentColor"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

/* ---------- helpers ---------- */

function makeImg(images, base) {
  return (name, alt, sizes, { cls = '', eager = false } = {}) => {
    const m = images[name];
    if (!m) return '';
    const srcset = m.widths.map((w) => `${base}img/${name}-${w}.webp ${w}w`).join(', ');
    const mid = m.widths.find((w) => w >= 960) || m.widths[m.widths.length - 1];
    return `<img class="${cls}" src="${base}img/${name}-${mid}.webp" srcset="${srcset}" sizes="${sizes}" width="${m.width}" height="${m.height}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}"${eager ? ' fetchpriority="high"' : ''} decoding="async">`;
  };
}

const yaRoute = (p) => `https://yandex.ru/maps/?rtext=~${p.lat}%2C${p.lon}&amp;rtt=pd`;
const pad2 = (n) => String(n).padStart(2, '0');

/* ---------- head ---------- */

export function renderHead(site, base) {
  const url = site.siteUrl.replace(/\/?$/, '/');
  const og = url + site.seo.ogImage;
  const dayMap = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
  const ld = {
    '@context': 'https://schema.org',
    '@graph': site.points.map((p) => ({
      '@type': 'CafeOrCoffeeShop',
      '@id': `${url}#${p.id}`,
      name: `${site.brand.name} — ${p.kind.toLowerCase()} на ${p.title.replace(/,.*/, '')}`,
      alternateName: site.brand.nameLatin,
      description: site.beans.quote,
      url,
      image: og,
      telephone: site.contacts.phone.replace(/[^+\d]/g, ''),
      servesCuisine: 'Кофе',
      priceRange: '₽',
      address: {
        '@type': 'PostalAddress',
        streetAddress: p.address,
        addressLocality: p.city,
        addressRegion: p.city,
        addressCountry: 'RU',
      },
      geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lon },
      hasMap: p.yandexUrl || p.gisUrl,
      openingHoursSpecification: Object.entries(p.schedule).map(([d, [o, c]]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${dayMap[d]}`,
        opens: o,
        closes: c,
      })),
      sameAs: [site.contacts.telegram, site.contacts.vk, p.yandexUrl, p.gisUrl].filter(Boolean),
    })),
  };

  return `
    <title>${esc(site.seo.title)}</title>
    <meta name="description" content="${esc(site.seo.description)}">
    ${site.demo ? '<meta name="robots" content="noindex, nofollow">' : ''}
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="ru_RU">
    <meta property="og:site_name" content="${esc(site.brand.name)}">
    <meta property="og:title" content="${esc(site.seo.title)}">
    <meta property="og:description" content="${esc(site.seo.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${og}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
    <link rel="icon" href="${base}favicon-32.png" sizes="32x32" type="image/png">
    <link rel="apple-touch-icon" href="${base}apple-touch-icon.png">
    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}

/* ---------- body ---------- */

export function renderBody(site, menu, images, base) {
  const img = makeImg(images, base);
  const [p1, p2] = site.points;
  const c = site.contacts;
  const r = site.ratings;

  const letters = (word) =>
    [...word].map((ch) => `<span class="ch"><span class="ch__i">${ch}</span></span>`).join('');

  /* --- header --- */
  const header = `
<a class="skip" href="#main">Перейти к содержимому</a>
<header class="hdr" data-hdr>
  <a class="hdr__brand" href="#top" aria-label="${esc(site.brand.name)} — в начало">${mark()}<span>${esc(site.brand.name)}</span></a>
  <nav class="hdr__nav" aria-label="Разделы">
    <a href="#menu">Меню</a><a href="#beans">Зерно</a><a href="#points">Точки</a><a href="#contacts">Контакты</a>
  </nav>
  <a class="status" href="#points" data-status="${p1.id}" title="${esc(p1.address)}">
    <span class="status__dot" aria-hidden="true"></span><span class="status__text">${esc(scheduleText(p1.schedule))}</span>
  </a>
  <button class="burger" type="button" aria-expanded="false" aria-controls="mnav" aria-label="Открыть навигацию"><span></span><span></span></button>
</header>
<div class="mnav" id="mnav" hidden>
  <nav aria-label="Навигация">
    <a href="#menu"><span class="mono">01</span>Меню</a>
    <a href="#beans"><span class="mono">02</span>Зерно домой</a>
    <a href="#points"><span class="mono">03</span>Две точки</a>
    <a href="#contacts"><span class="mono">04</span>Контакты</a>
  </nav>
  <p class="mnav__foot mono">${esc(p1.address)} · ${esc(scheduleText(p1.schedule))}</p>
</div>`;

  /* --- hero --- */
  const floats = [
    bean('fl fl--b1'), berry('fl fl--r1'), bean('fl fl--b2'), berry('fl fl--r2'), bean('fl fl--b3'), berry('fl fl--r3'),
  ].join('');

  const hero = `
<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="hero__floats" aria-hidden="true">${floats}</div>
  <div class="wrap hero__wrap">
    <div class="hero__meta mono"><span>${esc(site.hero.label)}</span><span class="hero__roast"><i aria-hidden="true"></i>${esc(site.hero.roast)}</span></div>
    <div class="hero__grid">
      <div class="hero__main">
        <h1 class="hero__title" id="hero-title" aria-label="${esc(site.brand.name)}">
          <span class="hero__l1" aria-hidden="true">${letters('Микро')}</span>
          <span class="hero__l2" aria-hidden="true">${cup()}<em>${letters('лот')}</em></span>
        </h1>
        <a class="badge" href="${esc(r.yandex.url)}" target="_blank" rel="noopener">
          ${stars()}<b>${String(r.yandex.value).replace('.', ',')}</b> на Яндекс Картах <span class="badge__n">· ${r.yandex.votes} оценок</span>
        </a>
        <p class="hero__sub">${esc(site.hero.subtitle)}</p>
        <div class="hero__cta">
          <a class="btn btn--solid magnetic" href="#menu">Смотреть меню ${icon.arrow}</a>
          <a class="btn btn--line magnetic" href="#points">Как добраться</a>
        </div>
      </div>
      <figure class="hero__card">
        <div class="tag">
          <div class="tag__head mono"><span>Microlot Coffee</span><span>№ 166</span></div>
          <div class="tag__photo">${img(site.hero.photo, site.hero.photoAlt, '(min-width: 1024px) 34vw, 86vw', { eager: true })}</div>
          <div class="tag__foot mono"><span>${esc(p1.district)}</span><span>Зал до 9 мест</span></div>
        </div>
        <div class="seal seal--hero" aria-hidden="true">
          <svg viewBox="0 0 120 120"><defs><path id="sealc" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/></defs><text><textPath href="#sealc" textLength="286" lengthAdjust="spacing">ЯНДЕКС КАРТЫ · ОЦЕНКА ГОСТЕЙ ·</textPath></text></svg>
          <b>${String(r.yandex.value).replace('.', ',')}</b>
        </div>
      </figure>
    </div>
    <dl class="passport mono">
      <div><dt>Кофейня</dt><dd>${esc(p1.address)}</dd><dd>${esc(scheduleText(p1.schedule))}</dd></div>
      <div><dt>С собой</dt><dd>${esc(p2.address)}</dd><dd>${esc(scheduleText(p2.schedule))}</dd></div>
      <div><dt>Телефон</dt><dd><a href="${c.phoneHref}">${esc(c.phone)}</a></dd><dd>Санкт-Петербург</dd></div>
    </dl>
  </div>
</section>`;

  /* --- what is microlot --- */
  const steps = site.steps
    .map(
      (s, i) => `
      <li class="step">
        <div class="step__card">
          <div class="step__head mono"><span>Этап ${s.n} / ${pad2(site.steps.length)}</span><span>${esc(s.key)}</span></div>
          <div class="step__icon">${stepIcon[s.icon] || ''}</div>
          <h3 class="step__title">${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
          <span class="step__num" aria-hidden="true">${s.n}</span>
        </div>
      </li>`
    )
    .join('');

  const lot = `
<section class="lot dark" id="lot" aria-labelledby="lot-title">
  <div class="lot__pin" data-lot-pin>
    <div class="wrap lot__intro">
      <p class="eyebrow mono">Паспорт лота · путь зерна</p>
      <h2 id="lot-title" class="h2">Что такое <em>микролот</em></h2>
      <p class="lead">Небольшая партия кофе с одной фермы или одного участка, одного урожая. Происхождение прослеживается до склона, а вкус оценён на каппинге.</p>
    </div>
    <div class="lot__viewport">
      <ol class="steps" data-steps>${steps}
      </ol>
    </div>
    <div class="wrap lot__bar" aria-hidden="true"><span class="mono">Ферма</span><i><b data-lot-progress></b></i><span class="mono">Чашка</span></div>
  </div>
</section>`;

  /* --- menu --- */
  const tabs = menu.categories
    .map(
      (cat, i) =>
        `<button class="tab${cat.seasonal ? ' tab--season' : ''}" role="tab" type="button" id="tab-${cat.id}" aria-controls="panel-${cat.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${cat.seasonal ? leaf : ''}${esc(cat.title)}</button>`
    )
    .join('');
  const panels = menu.categories
    .map(
      (cat, i) => `
      <div class="panel${cat.image ? ' panel--poster' : ''}" role="tabpanel" id="panel-${cat.id}" aria-labelledby="tab-${cat.id}" tabindex="0"${i === 0 ? '' : ' hidden'}>
        ${cat.seasonal ? '<p class="season-tag mono">' + leaf + 'Сезонное предложение</p>' : ''}
        <ul class="rows">${cat.items
          .map(
            (it) => `
          <li class="row"><span class="row__name">${esc(it.name)}${it.note ? ` <small>${esc(it.note)}</small>` : ''}</span><span class="row__dots" aria-hidden="true"></span><span class="row__size mono">${esc(it.size || '')}</span><span class="row__price">${rub(it.price)}</span></li>`
          )
          .join('')}
        </ul>${
          cat.image && images[cat.image]
            ? `
        <a class="poster" href="${base}img/${cat.image}-${images[cat.image].widths[images[cat.image].widths.length - 1]}.webp" target="_blank" rel="noopener">
          ${img(cat.image, cat.imageAlt || '', '(min-width: 600px) 200px, 72px', { cls: 'poster__img' })}
          <span class="poster__t">Афиша сезонного меню<span class="mono">Открыть картинку ↗</span></span>
        </a>`
            : ''
        }
      </div>`
    )
    .join('');

  const menuSec = `
<section class="menu" id="menu" aria-labelledby="menu-title">
  <div class="wrap">
    <div class="sec-head">
      <p class="eyebrow mono">Меню · Ленинский, 166</p>
      <h2 id="menu-title" class="h2">Что в чашке</h2>
    </div>
    <div class="label">
      <div class="label__top mono"><span>Microlot · меню</span><span>Объём / цена</span></div>
      <div class="tabs" role="tablist" aria-label="Категории меню">${tabs}</div>
      <div class="panels">${panels}
      </div>
      <div class="label__bottom mono"><span>Цены уточняйте у бариста</span><span class="perf" aria-hidden="true"></span><span>Кофе и еда навынос</span></div>
    </div>
    <div class="more">
      <h3 class="more__title">Ещё у нас</h3>
      <ul class="chips">${menu.more.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
      <p class="syrups">${berry('syrups__berry')}<span>${esc(menu.syrupsNote)}</span></p>
    </div>
  </div>
</section>`;

  /* --- beans --- */
  const field = (label, v) =>
    `<div><dt>${label}</dt><dd>${v ? esc(v) : '<span class="blank"><span class="sr">заполним</span></span>'}</dd></div>`;
  const bags = site.beans.cards
    .map(
      (b, i) => `
      <li class="bag bag--${i + 1}">
        <div class="bag__top" aria-hidden="true"></div>
        <div class="bag__body">
          <div class="bag__brand">${mark('mark mark--bag')}<span>Микролот</span></div>
          <p class="bag__lot mono">Лот № ${b.lot ? esc(b.lot) : '<span class="blank blank--s"></span>'}</p>
          <dl class="bag__fields mono">
            ${field('Страна', b.country)}
            ${field('Обработка', b.process)}
            ${field('Вкус', b.notes)}
            ${field('Вес', b.weight)}
            ${field('Цена', b.price)}
          </dl>
          <span class="stamp stamp--bag" aria-hidden="true">Образец</span>
        </div>
      </li>`
    )
    .join('');

  const beans = `
<section class="beans" id="beans" aria-labelledby="beans-title">
  <div class="wrap beans__grid">
    <div class="beans__text">
      <p class="eyebrow mono">Зерно домой</p>
      <h2 id="beans-title" class="h2">Понравилось в&nbsp;чашке — <em>возьмите домой</em></h2>
      <blockquote class="quote"><p>${esc(site.beans.quote)}</p></blockquote>
      <figure class="beans__photo">${img(site.beans.photo, site.beans.photoAlt, '(min-width: 1024px) 20vw, 40vw')}<figcaption class="mono">Полка с зерном · Ленинский</figcaption></figure>
      <a class="btn btn--solid magnetic" href="${esc(c.telegram)}" target="_blank" rel="noopener">${icon.tg} Какие лоты сейчас — в канале</a>
    </div>
    <div class="beans__bags">
      <ul class="bags" aria-label="Шаблоны карточек лотов">${bags}
      </ul>
      <p class="beans__note mono"><span aria-hidden="true">✳</span> ${esc(site.beans.note)}</p>
    </div>
  </div>
</section>`;

  /* --- why --- */
  const why = `
<section class="why" id="why" aria-labelledby="why-title">
  <div class="wrap why__grid">
    <div class="sec-head">
      <p class="eyebrow mono">Протокол визита</p>
      <h2 id="why-title" class="h2">За что нас <em>любят</em> гости</h2>
      <p class="lead lead--ink">Собрали главное из отзывов на картах — коротко и своими словами.</p>
    </div>
    <div class="sheet">
      <div class="sheet__head mono"><span>Параметр</span><span>Заметка</span></div>
      <ol class="sheet__rows">${site.why
        .map(
          (w, i) => `
        <li class="srow"><span class="srow__n mono">${pad2(i + 1)}</span><span class="srow__k mono">${esc(w.key)}</span><span class="srow__v">${esc(w.value)}</span><span class="srow__ok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17 19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span></li>`
        )
        .join('')}
      </ol>
      <span class="stamp stamp--sheet" aria-hidden="true">Проверено гостями</span>
    </div>
  </div>
</section>`;

  /* --- gallery --- */
  const gallery = `
<section class="gallery dark" id="atmosphere" aria-labelledby="gal-title">
  <div class="wrap">
    <div class="sec-head sec-head--row">
      <div><p class="eyebrow mono">Кадры · Ленинский, 166</p><h2 id="gal-title" class="h2">Атмосфера</h2></div>
      <p class="lead">Кирпич, мох, кожаные кресла и тёплый свет. Девять мест — уютно и без суеты.</p>
    </div>
  </div>
  <ul class="shots" aria-label="Фотографии кофейни">${site.gallery
    .map(
      (g, i) => `
    <li class="shot shot--${i + 1}"><figure>${img(g.src, g.alt, '(min-width: 1024px) 30vw, 78vw')}<figcaption class="mono"><span>${pad2(i + 1)}</span>${esc(g.caption)}</figcaption></figure></li>`
    )
    .join('')}
  </ul>
</section>`;

  /* --- rating --- */
  const fmt = (v) => String(v).replace('.', ',');
  const rating = `
<section class="rating" id="rating" aria-labelledby="rating-title">
  <div class="wrap rating__grid">
    <div class="seal seal--big">
      <svg viewBox="0 0 400 400" aria-hidden="true"><defs><path id="sealc2" d="M200 200m-168 0a168 168 0 1 1 336 0a168 168 0 1 1-336 0"/></defs><text><textPath href="#sealc2" textLength="1050" lengthAdjust="spacing">ОЦЕНКА ГОСТЕЙ · ЯНДЕКС КАРТЫ · ОЦЕНКА ГОСТЕЙ · ЯНДЕКС КАРТЫ · ОЦЕНКА ГОСТЕЙ · ЯНДЕКС КАРТЫ ·</textPath></text></svg>
      <div class="seal__in">
        <b class="count" data-count="${r.yandex.value}">${fmt(r.yandex.value)}</b>
        ${stars()}
        <span class="mono">из 5</span>
      </div>
    </div>
    <div class="rating__text">
      <p class="eyebrow mono">Рейтинг</p>
      <h2 id="rating-title" class="h2"><span class="sr">Рейтинг ${fmt(r.yandex.value)} на Яндекс Картах. </span>Гости ставят <em>высший балл</em></h2>
      <p class="rating__meta mono">Яндекс Карты · ${r.yandex.votes} оценок · ${r.yandex.reviews} отзыв${r.yandex.reviews % 10 === 1 && r.yandex.reviews % 100 !== 11 ? '' : 'ов'}</p>
      <ul class="gis">${r.gis
        .map(
          (g) => `
        <li><span class="mono">2ГИС · ${esc(g.point)}</span><b class="count" data-count="${g.value}">${fmt(g.value)}</b></li>`
        )
        .join('')}
      </ul>
      <div class="rating__cta">
        <a class="btn btn--solid magnetic" href="${esc(r.yandex.url)}" target="_blank" rel="noopener">Читать отзывы на Яндекс Картах</a>
        <a class="btn btn--line magnetic" href="${esc(r.gis[0].url)}" target="_blank" rel="noopener">Отзывы в 2ГИС</a>
      </div>
    </div>
  </div>
</section>`;

  /* --- points --- */
  const pointCard = (p, i) => `
    <article class="ticket" aria-labelledby="pt-${p.id}">
      <div class="ticket__stub mono" aria-hidden="true"><span>${esc(p.lot)}</span><b>${i + 1}</b></div>
      <div class="ticket__main">
        <p class="ticket__kind mono">${esc(p.kind)}</p>
        <h3 class="ticket__title" id="pt-${p.id}">${esc(p.title)}</h3>
        <p class="ticket__addr">${esc(p.city)}, ${esc(p.address)}<br><span>${esc(p.district)}</span></p>
        <p class="pstatus" data-status="${p.id}"><span class="status__dot" aria-hidden="true"></span><span class="status__text">${esc(scheduleText(p.schedule))}</span></p>
        <dl class="hours mono">${groupSchedule(p.schedule)
          .map((g) => `<div><dt>${g.days}</dt><dd>${g.hours}</dd></div>`)
          .join('')}</dl>
        <ul class="ticket__notes">${[...p.notes, ...p.transit].map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
        <div class="ticket__cta">
          <a class="btn btn--solid btn--sm" href="${yaRoute(p)}" target="_blank" rel="noopener">${icon.route} Маршрут в Яндекс Картах</a>
          <a class="btn btn--line btn--sm" href="${esc(p.gisUrl)}" target="_blank" rel="noopener">2ГИС</a>
        </div>
      </div>
    </article>`;

  const scheme = `
<figure class="scheme">
  <svg viewBox="0 0 420 400" role="img" aria-labelledby="scheme-t">
    <title id="scheme-t">Схема: кофейня на Ленинском проспекте, 166 — около 750 метров от метро «Московская»; точка кофе с собой на Варшавской улице, 23 к1 — севернее</title>
    <defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" fill="none" stroke="currentColor" stroke-width=".6" opacity=".16"/></pattern></defs>
    <rect width="420" height="400" fill="url(#grid)"/>
    <g fill="none" stroke="currentColor" stroke-linecap="round">
      <path d="M0 330H420M300 0V400" stroke-width="12" opacity=".1"/>
      <path d="M0 330H420M300 0V400" stroke-width="1.6"/>
      <path d="M190 24V240" stroke-width="7" opacity=".08"/>
      <path d="M190 24V240" stroke-width="1.4" stroke-dasharray="2 6"/>
    </g>
    <path class="scheme__route" d="M300 330H140" fill="none" stroke="var(--berry)" stroke-width="3" stroke-dasharray="7 6"/>
    <g font-family="JetBrains Mono, monospace" font-size="12" fill="currentColor" letter-spacing=".6">
      <text x="16" y="358">ЛЕНИНСКИЙ ПР.</text>
      <text x="310" y="20" transform="rotate(90 310 20)">МОСКОВСКИЙ ПР.</text>
      <text x="198" y="128" transform="rotate(90 198 128)">ВАРШАВСКАЯ УЛ.</text>
      <text x="168" y="320" fill="var(--berry)">≈ 750 м</text>
      <text x="16" y="390" font-size="10" opacity=".6">СХЕМА · НЕ В МАСШТАБЕ</text>
      <text x="374" y="30" font-size="14">С↑</text>
      <text x="316" y="358">«МОСКОВСКАЯ»</text>
    </g>
    <g><circle cx="300" cy="330" r="13" fill="var(--paper)" stroke="currentColor" stroke-width="1.6"/><text x="300" y="335" text-anchor="middle" font-family="Onest, sans-serif" font-weight="600" font-size="14" fill="var(--berry)">М</text></g>
    <g class="pin"><circle class="pin__pulse" cx="140" cy="330" r="22" fill="var(--berry)" opacity=".18"/><circle cx="140" cy="330" r="12" fill="var(--berry)"/><text x="140" y="334.5" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="500" fill="#fff">1</text></g>
    <text x="16" y="278" font-family="Cormorant Garamond, serif" font-size="26" font-weight="600" fill="currentColor">Ленинский, 166</text>
    <text x="16" y="298" font-family="JetBrains Mono, monospace" font-size="11" fill="currentColor" opacity=".75">КОФЕЙНЯ · ПЛ. КОНСТИТУЦИИ</text>
    <g class="pin"><circle class="pin__pulse" cx="190" cy="80" r="22" fill="var(--leaf)" opacity=".18"/><circle cx="190" cy="80" r="12" fill="var(--leaf)"/><text x="190" y="84.5" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="500" fill="#fff">2</text></g>
    <text x="164" y="76" text-anchor="end" font-family="Cormorant Garamond, serif" font-size="24" font-weight="600" fill="currentColor">Варшавская,</text>
    <text x="164" y="100" text-anchor="end" font-family="Cormorant Garamond, serif" font-size="24" font-weight="600" fill="currentColor">23 к1</text>
    <text x="164" y="120" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="11" fill="currentColor" opacity=".75">КОФЕ С СОБОЙ</text>
  </svg>
</figure>`;

  const mapSrc = `https://yandex.ru/map-widget/v1/?ll=${p1.lon}%2C${p1.lat}&amp;z=16&amp;oid=${p1.yandexOid}&amp;ol=biz`;

  const points = `
<section class="points" id="points" aria-labelledby="points-title">
  <div class="wrap">
    <div class="sec-head sec-head--row">
      <div><p class="eyebrow mono">Две точки · Московский район</p><h2 id="points-title" class="h2">Где нас <em>найти</em></h2></div>
      <p class="lead lead--ink">Посидеть с ноутбуком — на Ленинском. Взять по дороге — на Варшавской.</p>
    </div>
    ${scheme}
    <div class="tickets">${site.points.map(pointCard).join('')}</div>
    <div class="ymap" data-ymap data-src="${mapSrc}" hidden>
      <p class="ymap__label mono">Живая карта · Ленинский, 166</p>
    </div>
  </div>
</section>`;

  /* --- contacts + footer --- */
  const contacts = `
<section class="contacts dark" id="contacts" aria-labelledby="contacts-title">
  <div class="wrap">
    <p class="eyebrow mono">Контакты</p>
    <h2 id="contacts-title" class="h2">Заходите <em>или пишите</em></h2>
    <a class="bigphone" href="${c.phoneHref}">${esc(c.phone)}</a>
    <div class="socials">
      <a class="soc magnetic" href="${esc(c.telegram)}" target="_blank" rel="noopener">${icon.tg}<span>Telegram</span></a>
      <a class="soc magnetic" href="${esc(c.whatsapp)}" target="_blank" rel="noopener">${icon.wa}<span>WhatsApp</span></a>
      <a class="soc magnetic" href="${esc(c.vk)}" target="_blank" rel="noopener">${icon.vk}<span>ВКонтакте</span></a>
    </div>
    <a class="channel" href="${esc(c.telegram)}" target="_blank" rel="noopener">
      <span class="channel__k mono">Telegram-канал ${esc(c.telegramHandle)}</span>
      <span class="channel__t">Подписаться на канал — там новые лоты</span>
      <span class="channel__a" aria-hidden="true">${icon.arrow}</span>
    </a>
    <div class="foot-hours">${site.points
      .map(
        (p) => `
      <div><p class="mono">${esc(p.kind)}</p><p class="foot-hours__t">${esc(p.address)}</p><p class="mono foot-hours__h">${esc(scheduleText(p.schedule))}</p></div>`
      )
      .join('')}
    </div>
  </div>
</section>`;

  const footer = `
  <footer class="footer dark">
    <div class="wrap footer__in">
      ${img(site.logo, 'Логотип кофейни «Микролот»', '72px', { cls: 'footer__logo' })}
      <p class="mono">© ${new Date().getFullYear()} ${esc(site.brand.name)} · ${esc(site.brand.nameLatin)}<br>Спешелти-кофейня · Санкт-Петербург</p>
      <a class="mono footer__top" href="#top">Наверх ↑</a>
    </div>
  </footer>
`;

  /* --- dock & demo --- */
  const dock = `
<nav class="dock" aria-label="Быстрые действия">
  <a href="${c.phoneHref}">${icon.phone}<span>Позвонить</span></a>
  <a href="${yaRoute(p1)}" target="_blank" rel="noopener">${icon.route}<span>Маршрут</span></a>
  <a href="${esc(c.telegram)}" target="_blank" rel="noopener">${icon.tg}<span>Telegram</span></a>
</nav>`;

  const demo = site.demo
    ? `<a class="demo mono" href="${esc(site.author.telegram)}" target="_blank" rel="noopener"><i aria-hidden="true"></i>Концепт сайта · ${esc(site.author.name)}</a>`
    : '';

  return `${sprite}${header}
<main id="main">${hero}${lot}${menuSec}${beans}${why}${gallery}${rating}${points}${contacts}
</main>${footer}${dock}${demo}`;
}
