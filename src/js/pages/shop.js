import { listProducts, addToCart, money } from '../shopify.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function shop(root, { isLive }) {
  const grid = root.querySelector('[data-grid]');
  const filters = root.querySelector('[data-filters]');
  const notice = root.querySelector('[data-notice]');
  let products;
  try {
    products = await listProducts();
  } catch (e) {
    products = null;
    notice.hidden = false;
    notice.textContent = 'We could not reach the shop just now. Showing preview items instead.';
  }
  const sample = !products;
  if (sample) {
    const data = await (await fetch('data/products.sample.json')).json();
    products = data.products.map((p) => ({ ...p, alt: p.title, variantId: null }));
    if (!isLive()) { notice.hidden = false; notice.textContent = 'Preview items only: the shop is not connected yet, so nothing can be bought.'; }
  }

  const types = ['All', ...new Set(products.map((p) => p.type))];
  let current = 'All';
  const draw = () => {
    filters.innerHTML = types.map((t) => `<button class="chip" aria-pressed="${t === current}" data-type="${esc(t)}">${esc(t)}</button>`).join('');
    grid.innerHTML = products.filter((p) => current === 'All' || p.type === current).map((p) => `
      <article class="product">
        <a class="img" href="product.html?handle=${encodeURIComponent(p.handle)}">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.alt)}" loading="lazy">` : ''}</a>
        <div class="body">
          <h3>${esc(p.title)}</h3>
          <span class="price">${money(p.price)}</span>
          ${sample || !p.available
            ? `<button class="btn" disabled>${sample ? 'Coming soon' : 'Sold out'}</button>`
            : `<button class="btn" data-add="${esc(p.variantId)}">Add to cart</button>`}
        </div>
      </article>`).join('');
  };
  draw();
  filters.addEventListener('click', (e) => { const b = e.target.closest('[data-type]'); if (b) { current = b.dataset.type; draw(); } });
  grid.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    b.disabled = true; b.textContent = 'Adding...';
    try {
      const cart = await addToCart(b.dataset.add);
      document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = cart.totalQuantity));
      b.textContent = 'Added!';
    } catch { b.textContent = 'Try again'; }
    setTimeout(() => { b.disabled = false; b.textContent = 'Add to cart'; }, 1400);
  });
}
