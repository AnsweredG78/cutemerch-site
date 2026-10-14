// Tiny static-site builder: wraps each src/pages/*.html in the shared layout,
// copies css/js/img/data, and writes dist/. No dependencies.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const dist = join(root, 'dist');
const cfg = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'));

// Environment variables win over the file, so tokens need not live in git.
cfg.shopify.storeDomain = process.env.SHOPIFY_STORE_DOMAIN || cfg.shopify.storeDomain;
cfg.shopify.storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN || cfg.shopify.storefrontToken;
if (process.env.PREVIEW) cfg.preview = process.env.PREVIEW !== 'false';

if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(dist, { recursive: true });
for (const d of ['css', 'js', 'img', 'data']) cpSync(join(src, d), join(dist, d), { recursive: true });

const layout = readFileSync(join(src, 'partials/layout.html'), 'utf8');
const header = readFileSync(join(src, 'partials/header.html'), 'utf8');
const footer = readFileSync(join(src, 'partials/footer.html'), 'utf8');

const meta = (html, key, fallback = '') => (html.match(new RegExp(`<!--\\s*${key}:\\s*(.*?)\\s*-->`)) || [, fallback])[1];

for (const file of readdirSync(join(src, 'pages')).filter((f) => f.endsWith('.html'))) {
  const raw = readFileSync(join(src, 'pages', file), 'utf8');
  const title = meta(raw, 'title', cfg.siteName);
  const desc = meta(raw, 'desc', 'Cute stickers, apparel and mugs from an original cast of hand-drawn characters.');
  const nav = meta(raw, 'nav', '');
  const content = raw.replace(/<!--\s*(title|desc|nav):.*?-->\s*/g, '');
  const page = layout
    .replaceAll('{{title}}', title === cfg.siteName ? cfg.siteName : `${title} | ${cfg.siteName}`)
    .replaceAll('{{description}}', desc)
    .replaceAll('{{robots}}', cfg.preview ? '<meta name="robots" content="noindex, nofollow">' : '')
    .replace('{{header}}', header.replace(`data-nav="${nav}"`, `data-nav="${nav}" aria-current="page"`))
    .replace('{{footer}}', footer)
    .replace('{{content}}', content);
  writeFileSync(join(dist, file), page);
}

writeFileSync(join(dist, 'config.js'), `window.CUTEMERCH_CONFIG = ${JSON.stringify({ preview: cfg.preview, shopify: cfg.shopify })};\n`);
writeFileSync(join(dist, 'robots.txt'), cfg.preview ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');
console.log(`Built ${readdirSync(join(src, 'pages')).length} pages to dist/ (preview mode: ${cfg.preview})`);
