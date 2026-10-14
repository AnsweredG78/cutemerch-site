// Shopify Storefront API client (public token only; safe to expose in the browser).
// Docs: https://shopify.dev/docs/api/storefront
const cfg = (window.CUTEMERCH_CONFIG && window.CUTEMERCH_CONFIG.shopify) || {};
const CART_KEY = 'cm_cart_id';

export const isLive = () => Boolean(cfg.storeDomain && cfg.storefrontToken);

async function gql(query, variables = {}) {
  const res = await fetch(`https://${cfg.storeDomain}/api/${cfg.apiVersion || '2026-04'}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': cfg.storefrontToken },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify request failed (${res.status})`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data;
}

const PRODUCT_FIELDS = `
  id handle title description productType
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 1) { nodes { id availableForSale } }`;

const shape = (p) => ({
  id: p.id, handle: p.handle, title: p.title, description: p.description || '', type: p.productType || 'Other',
  price: p.priceRange.minVariantPrice.amount, image: p.featuredImage && p.featuredImage.url,
  alt: (p.featuredImage && p.featuredImage.altText) || p.title,
  variantId: p.variants.nodes[0] && p.variants.nodes[0].id,
  available: p.variants.nodes[0] ? p.variants.nodes[0].availableForSale : false,
});

export async function listProducts() {
  if (!isLive()) return null;
  const data = await gql(`query { products(first: 48) { nodes { ${PRODUCT_FIELDS} } } }`);
  return data.products.nodes.map(shape);
}

export async function getProduct(handle) {
  if (!isLive()) return null;
  const data = await gql(`query($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`, { handle });
  return data.product ? shape(data.product) : null;
}

/* ---- cart ---- */
const store = {
  get() { try { return localStorage.getItem(CART_KEY); } catch { return null; } },
  set(v) { try { v ? localStorage.setItem(CART_KEY, v) : localStorage.removeItem(CART_KEY); } catch { /* storage blocked: cart lasts this page only */ } },
};

const CART_FIELDS = `
  id checkoutUrl totalQuantity
  cost { totalAmount { amount currencyCode } }
  lines(first: 50) { nodes { id quantity
    merchandise { ... on ProductVariant { id title product { title handle } image { url altText } price { amount } } } } }`;

export async function getCart() {
  const id = store.get();
  if (!isLive() || !id) return null;
  const data = await gql(`query($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }`, { id });
  if (!data.cart) { store.set(null); return null; }
  return data.cart;
}

export async function addToCart(variantId, quantity = 1) {
  const id = store.get();
  const lines = [{ merchandiseId: variantId, quantity }];
  if (id) {
    const data = await gql(`mutation($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } } }`, { cartId: id, lines });
    if (data.cartLinesAdd.cart) return data.cartLinesAdd.cart;
  }
  const data = await gql(`mutation($lines: [CartLineInput!]!) { cartCreate(input: { lines: $lines }) { cart { ${CART_FIELDS} } userErrors { message } } }`, { lines });
  const cart = data.cartCreate.cart;
  if (cart) store.set(cart.id);
  return cart;
}

export async function removeLine(lineId) {
  const id = store.get();
  const data = await gql(`mutation($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${CART_FIELDS} } } }`, { cartId: id, lineIds: [lineId] });
  return data.cartLinesRemove.cart;
}

export async function cartCount() {
  try { const c = await getCart(); return c ? c.totalQuantity : 0; } catch { return 0; }
}

export const money = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount));
