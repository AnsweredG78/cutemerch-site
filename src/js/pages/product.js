import { getProduct, addToCart, money } from '../shopify.js';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function product(root, { isLive }) {
  const handle = new URLSearchParams(location.search).get('handle');
  const out = root.querySelector('[data-product]');
  let p = null, sample = false;
  try { p = handle ? await getProduct(handle) : null; } catch { p = null; }
  if (!p) {
    const data = await (await fetch('data/products.sample.json')).json();
    const s = data.products.find((x) => x.handle === handle);
    if (s) { p = { ...s, alt: s.title, description: 'Preview item. Real details come from the shop once it is connected.', variantId: null, available: false }; sample = true; }
  }
  if (!p) { out.innerHTML = '<p>We could not find that item. <a href="shop.html">Back to the shop</a></p>'; return; }
  document.title = `${p.title} | CuteMerch`;
  out.innerHTML = `
    <div class="hero-grid">
      <div class="product"><div class="img">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.alt)}">` : ''}</div></div>
      <div>
        <p class="tag">${esc(p.type)}</p>
        <h1 style="font-family:var(--f-head);font-size:clamp(32px,5vw,48px);margin:12px 0">${esc(p.title)}</h1>
        <p style="font-weight:700;color:var(--berry);font-size:22px;margin:0 0 12px">${money(p.price)}</p>
        <p>${esc(p.description)}</p>
        ${sample || !p.available ? `<button class="btn" disabled>${sample ? 'Coming soon' : 'Sold out'}</button>`
          : '<button class="btn" data-add>Add to cart</button>'}
      </div>
    </div>`;
  const add = out.querySelector('[data-add]');
  if (add) add.addEventListener('click', async () => {
    add.disabled = true; add.textContent = 'Adding...';
    try { const c = await addToCart(p.variantId); document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = c.totalQuantity)); add.textContent = 'Added! View cart'; add.onclick = () => (location.href = 'cart.html'); }
    catch { add.textContent = 'Try again'; }
    add.disabled = false;
  });
}
