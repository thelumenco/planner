// The wardrobe at home: the accessories bought at Hana's "Me & my room" tab. Owned (F.decorOwned.me_*) and worn while
// F.decor.me_* is set (the same switch as tapping it in the shop). The hat only shows outdoors, the pyjamas only in your room.
import { esc } from "../util.js";
import { icon } from "../art/icons.js";

export const ACCESSORIES = [["me_bow", "bow", "Velvet hair bow", ""], ["me_scarf", "scarf", "Silk neck scarf", ""], ["me_hat", "sunhat", "Straw sun hat", "outdoors"], ["me_pj", "pyjamas", "Silk pyjamas", "in your room"]];
export const wearing = (F, k) => !!(F.decor || {})[k];
function accessories(F){
  const own = ACCESSORIES.filter(([k]) => (F.decorOwned || {})[k] || (F.decor || {})[k]);
  if (!own.length) return "";
  return `<p class="eyebrow" style="margin:6px 0 6px">Your accessories</p><div class="accs">${own.map(([k, ico, n, where]) => `<div class="acc"><span class="e">${icon(ico, 30)}</span><span class="n">${esc(n)}${where ? `<small>${where}</small>` : ""}</span>
    <button class="btn small ${wearing(F, k) ? "primary" : "alt"}" data-acc="${k}" aria-pressed="${wearing(F, k)}">${wearing(F, k) ? "Wearing" : "Put on"}</button></div>`).join("")}</div>`;
}

export function wardrobePanel(F){
  const acc = accessories(F);
  return `<span class="tape stripe" aria-hidden="true"></span><h2>The wardrobe</h2>` + (acc || `<p class="sub">Nothing hanging up yet. Hana sells bows, scarves, hats and pyjamas in the market's "Me &amp; my room" tab.</p>`);
}
