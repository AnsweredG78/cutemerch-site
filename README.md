# CuteMerch site

Static pages (HTML, CSS, a little JavaScript) plus a Shopify **Storefront API** connection for products, cart and checkout. No frameworks and no dependencies; the only tool needed is Node 18 or newer. Built from Charlotte's design mock-ups.

## Run it on your computer

```
npm run dev      # builds into dist/ and serves http://localhost:8080
npm run build    # just builds dist/
```

Until Shopify is connected, the Shop page shows clearly marked **preview items** with disabled "Coming soon" buttons, so nothing can be bought by accident.

## Connect Shopify

1. In Shopify admin, add the **Headless** sales channel (or create a custom app with Storefront API access) and create a storefront. Copy the **public Storefront access token** (it is meant to be public; never use a private/admin token here).
2. Set two environment variables in your host's build settings (or put them in `site.config.json` for local testing):
   - `SHOPIFY_STORE_DOMAIN` = `yourstore.myshopify.com`
   - `SHOPIFY_STOREFRONT_TOKEN` = the public token
3. Rebuild. Products load from Shopify, "Add to cart" creates a Shopify cart, and **Checkout** goes to Shopify's own secure checkout page (so no card details ever touch this site).
4. Keep the Shopify storefront itself **password-protected** until launch (Shopify admin, Online Store, Preferences).

The API version is set in `site.config.json` (`apiVersion`). Shopify retires old versions on a schedule, so check it every few months.

## Host it (private preview)

- Build command `npm run build`, output folder `dist`. Good free hosts: Cloudflare Pages, Netlify, Vercel.
- **Preview mode** (`"preview": true` in `site.config.json`) adds `noindex` tags, a `robots.txt` that blocks search engines and a "private preview" note. Set it to `false` (or `PREVIEW=false`) only at launch.
- **Password gate:** a gate written in page JavaScript is not real security. Use the host: Cloudflare Access (free for a small list of allowed emails, one-time email codes) on a Cloudflare Pages site is the easiest; Netlify and Vercel password protection are paid features. Check current plan details before choosing.
- Point `cutemerch.co` at the host in your DNS settings. A sub-domain such as `shop.cutemerch.co` can be used for Shopify's checkout later.

## Privacy rules for this site

Only the first name "Charlotte" appears. No last name, age, photo, school or location, and no kids' personal data is collected. If you add anything that takes input (forms, accounts, comments), have the attorney review it first. See the project docs `claude/attorney-review-list.md` and `claude/launch-checklist.md`.

## What's built and what's next

Built: Home, Shop (filters, live or preview items), Product, Cart (add, remove, checkout), Characters (27, grouped like the Friends Map), About and Contact (draft text), FAQ, Shipping & Returns, Size Guide, Track Your Order, Our Promises, Privacy Policy and Terms of Service (all **draft starter text**, clearly marked; the attorney replaces the legal pages), 404.

Next, in order: attorney text for Privacy and Terms; confirm every [bracketed] item with the printer and the real store settings; real product photos and print files; accessibility and speed pass; then the held-back pages (Cute Cookies, Secret Hideout, Cuteville, 12 Days, Ask a Character, cards) once reviewed. Held back until reviewed: Fan Gallery, Pen Pal, contest, accounts, wishlist, email club.

## Files

```
src/pages/     one HTML file per page (comments at the top set title and nav)
src/partials/  layout, header, footer
src/css/       site.css (brand colors and fonts as variables)
src/js/        shopify.js (API client), site.js, pages/*.js
src/data/      characters.json, products.sample.json (placeholders)
src/img/       character drawings (WebP) and background pattern
scripts/       build.mjs (builder), serve.mjs (local server)
```
