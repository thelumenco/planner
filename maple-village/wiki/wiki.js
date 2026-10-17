// The Honeybrook Wiki: the contents drawer on phones, and search over search.json
(() => {
  const side = document.getElementById("side"), btn = document.getElementById("menuBtn");
  btn && btn.addEventListener("click", () => { const o = side.classList.toggle("open"); btn.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; });   // the page behind stays put while the contents scroll
  document.querySelectorAll(".side a").forEach(a => { if (a.getAttribute("href") === location.pathname.replace(/\.html$/, "") || (a.getAttribute("href") === "/" && location.pathname === "/")) a.classList.add("here"); });
  const q = document.getElementById("q"), hits = document.getElementById("hits"); let idx = null, sel = -1;
  const load = () => idx ? Promise.resolve(idx) : fetch("/search.json").then(r => r.json()).then(j => (idx = j));
  const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const esc = s => s.replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
  function show(list){ sel = -1; hits.hidden = !list.length; hits.innerHTML = list.map(h => `<li><a href="${h.a}">${esc(h.t)}${h.d ? `<small>${esc(h.d)}</small>` : ""}</a></li>`).join(""); }
  q && q.addEventListener("input", () => { const v = norm(q.value.trim()); if (v.length < 2) return show([]);
    load().then(all => { const words = v.split(/\s+/);
      const scored = all.map(h => { const t = norm(h.t), d = norm(h.d || ""); if (!words.every(w => t.includes(w) || d.includes(w))) return null;
        return [h, (t.startsWith(v) ? 0 : t.includes(v) ? 1 : 2) + (h.p ? 0 : .5)]; }).filter(Boolean).sort((a, b) => a[1] - b[1]).slice(0, 12).map(x => x[0]);
      show(scored); }); });
  q && q.addEventListener("keydown", e => { const a = [...hits.querySelectorAll("a")]; if (!a.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = (sel + (e.key === "ArrowDown" ? 1 : -1) + a.length) % a.length; a.forEach((x, i) => x.classList.toggle("on", i === sel)); }
    if (e.key === "Enter") { e.preventDefault(); location.href = (a[sel] || a[0]).getAttribute("href"); }
    if (e.key === "Escape") show([]); });
  document.addEventListener("click", e => { if (!e.target.closest(".search")) show([]); });
})();
