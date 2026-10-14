const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function characters(root) {
  const list = await (await fetch('data/characters.json')).json();
  const groups = [...new Set(list.map((c) => c.group))];
  root.querySelector('[data-chars]').innerHTML = groups.map((g) => `
    <h2 class="group-head">${esc(g)}</h2>
    <div class="char-grid">${list.filter((c) => c.group === g).map((c) => `
      <div class="char">
        <div class="pic">${c.image ? `<img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy">` : '<div class="soon">Drawing coming soon</div>'}</div>
        <strong>${esc(c.name)}</strong>
      </div>`).join('')}</div>`).join('');
  root.querySelector('[data-count]').textContent = list.length;
}
