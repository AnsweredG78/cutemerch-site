import { isLive, cartCount } from './shopify.js';

const cfg = window.CUTEMERCH_CONFIG || {};

// Preview banner
if (cfg.preview) document.querySelectorAll('[data-preview-note]').forEach((el) => (el.hidden = false));

// Cart count in the header
cartCount().then((n) => document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = n)));

// Page modules: each page sets <div data-page="shop"> and gets js/pages/<name>.js
const page = document.querySelector('[data-page]');
if (page) import(`./pages/${page.dataset.page}.js`).then((m) => m.default && m.default(page, { isLive }));
