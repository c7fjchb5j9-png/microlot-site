import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { renderHead, renderBody } from './src/render.js';

const read = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf-8'));

// BASE_PATH задаётся в GitHub Actions (/<имя-репозитория>/). Локально — «/».
const base = process.env.BASE_PATH || '/';

/** Собирает HTML из src/data/*.json и создаёт robots.txt по флагу demo. */
function microlot() {
  const load = () => ({
    site: read('./src/data/site.json'),
    menu: read('./src/data/menu.json'),
    images: read('./src/data/images.json'),
  });
  const robots = (demo) =>
    demo ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n';

  return {
    name: 'microlot-render',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const { site, menu, images } = load();
        return html
          .replace('<!--head-->', renderHead(site, base))
          .replace('<!--app-->', renderBody(site, menu, images, base));
      },
    },
    configureServer(server) {
      server.watcher.add(['src/data/site.json', 'src/data/menu.json']);
      server.watcher.on('change', (f) => {
        if (/data[\\/](site|menu)\.json$/.test(f)) server.ws.send({ type: 'full-reload' });
      });
      server.middlewares.use('/robots.txt', (_req, res) => {
        res.setHeader('Content-Type', 'text/plain');
        res.end(robots(load().site.demo));
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots(load().site.demo) });
    },
  };
}

/** В сборке: CSS встраивается в HTML (без блокирующего запроса), ключевые шрифты — preload. */
function inlineCss() {
  return {
    name: 'microlot-inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const files = Object.values(ctx.bundle || {});
        for (const f of files.filter((f) => f.fileName.endsWith('.css'))) {
          const re = new RegExp(`<link rel="stylesheet"[^>]*href="[^"]*${f.fileName.replace(/[.]/g, '\\.')}"[^>]*>`);
          if (re.test(html)) {
            html = html.replace(re, () => `<style>${f.source}</style>`);
            delete ctx.bundle[f.fileName];
          }
        }
        const preload = files
          .filter((f) => /(cormorant-garamond-cyrillic-600-normal|onest-cyrillic-400-normal).*\.woff2$/.test(f.fileName))
          .map((f) => `<link rel="preload" href="${base}${f.fileName}" as="font" type="font/woff2" crossorigin>`)
          .join('');
        return html.replace('</title>', `</title>${preload}`);
      },
    },
  };
}

export default defineConfig({
  base,
  plugins: [microlot(), inlineCss()],
  build: { target: 'es2019', cssCodeSplit: false, assetsInlineLimit: 0 },
  server: { host: true },
});
