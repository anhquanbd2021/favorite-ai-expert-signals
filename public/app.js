const out = document.getElementById('out');
const vc = (v) => ({ operator: 'v-operator', 'probably reads docs': 'v-probably', unclear: 'v-unclear', commentator: 'v-commentator' }[v] || '');

document.getElementById('go').onclick = async () => {
  const text = document.getElementById('txt').value.trim();
  if (!text) return;
  const r = await (await fetch('/api/score', { method: 'POST', body: JSON.stringify({ text }) })).json();
  out.hidden = false;
  out.innerHTML = `<div>score <b>${r.score}</b> — <span class="verdict ${vc(r.verdict)}">${r.verdict}</span></div>` +
    (r.hits.map((h) => `<div class="hit ${h.kind}">${h.pts > 0 ? '+' : ''}${h.pts} — ${h.why}</div>`).join('') || '<div class="hit">no signals either way — thin post</div>');
};

const feed = await (await fetch('/api/feed')).json();
document.getElementById('feed').innerHTML = feed.map((p) =>
  `<div class="post"><span class="who">${p.author}</span><div class="txt">${p.text}</div><div class="sc">score ${p.score} — <span class="verdict ${vc(p.verdict)}">${p.verdict}</span> · ${p.hits.map((h) => h.why).join('; ') || 'no signals'}</div></div>`
).join('');
