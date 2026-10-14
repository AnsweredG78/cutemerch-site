import { getCart, removeLine, money } from '../shopify.js';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function cartPage(root, { isLive }) {
  const out = root.querySelector('[data-cart]');
  const render = (cart) => {
    document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = cart ? cart.totalQuantity : 0));
    if (!cart || !cart.lines.nodes.length) {
      out.innerHTML = `<p>${isLive() ? 'Your cart is empty.' : 'Our shop opens soon! Check back to fill your cart.'}</p><p><a class="btn" href="shop.html">Browse the shop</a></p>`;
      return;
    }
    out.innerHTML = `<ul class="cart-lines">${cart.lines.nodes.map((l) => `
      <li class="cart-line">
        ${l.merchandise.image ? `<img src="${esc(l.merchandise.image.url)}" alt="${esc(l.merchandise.image.altText || '')}">` : '<span></span>'}
        <div><strong>${esc(l.merchandise.product.title)}</strong><br><small>Qty ${l.quantity} &middot; ${money(l.merchandise.price.amount)}</small></div>
        <button class="chip" data-remove="${esc(l.id)}">Remove</button>
      </li>`).join('')}</ul>
      <div class="cart-total"><span>Total</span><span>${money(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}</span></div>
      <p><a class="btn" href="${esc(cart.checkoutUrl)}">Checkout</a></p>
      <p><small>Shipping and tax are shown at checkout. Checkout happens on our secure Shopify page.</small></p>`;
  };
  try { render(await getCart()); } catch { out.innerHTML = '<p>We could not load your cart just now. Please try again.</p>'; }
  out.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    b.disabled = true;
    try { render(await removeLine(b.dataset.remove)); } catch { b.disabled = false; }
  });
}
