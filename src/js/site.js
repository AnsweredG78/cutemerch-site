import { isLive, cartCount } from './shopify.js';

const cfg = window.CUTEMERCH_CONFIG || {};

// "Opens soon" banner until the Shopify store is connected
if (!isLive()) document.querySelectorAll('[data-soon-banner]').forEach((el) => (el.hidden = false));

// Cart count in the header
cartCount().then((n) => document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = n)));

// Page modules: each page sets <div data-page="shop"> and gets js/pages/<name>.js
const page = document.querySelector('[data-page]');
if (page) import(`./pages/${page.dataset.page}.js`).then((m) => m.default && m.default(page, { isLive }));
