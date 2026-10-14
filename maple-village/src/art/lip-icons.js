// Lip balms and lip oils (round 187): the tin's lid and the oil take the colour of the flower they were dyed with.
//   balm_<flower | none>     a little round tin, the lid in the flower's colour, a cream balm inside the rim
//   lipoil_<flower | none>   a slim roller bottle, the oil tinted the flower's colour (golden if undyed)
//   beeswax                  a block of beeswax
import { FLOWERS } from "../data/orchard.js";
const f = c => `style="fill:${c}"`;
export function lipIcon(name){
  if (name === "beeswax") return [`<path d="M4 11l4 -4h12v9l-4 4H4z" ${f("#E8C060")}/><path d="M4 11h12v9H4z" ${f("#F3D98A")}/><path d="M16 11l4 -4v9l-4 4z" ${f("#D9A84A")}/>${[[7, 14], [11, 16], [9, 18]].map(([x, y]) => `<path d="M${x} ${y}l1 -.6l1 .6v1.1l-1 .6l-1 -.6z" fill="none" stroke="#C99A3A" stroke-width=".5"/>`).join("")}`,
    `<path d="M4 11l4 -4h12v9l-4 4H4zM4 11h12v9M16 11l4 -4"/>`];
  const m = name.match(/^(balm|lipoil)_([a-z]+)$/); if (!m) return null;
  const [, kind, d] = m, col = (FLOWERS[d] || {}).col;
  if (kind === "balm") return [`<ellipse cx="12" cy="15" rx="8" ry="4" ${f("#C9CDD2")}/><rect x="4" y="12" width="16" height="3" ${f("#C9CDD2")}/><ellipse cx="12" cy="12" rx="8" ry="4" ${f(col || "#F3D98A")}/><ellipse cx="12" cy="12" rx="5" ry="2.2" ${f("#FFFDF6")} opacity=".55"/>`,
    `<ellipse cx="12" cy="15" rx="8" ry="4"/><ellipse cx="12" cy="12" rx="8" ry="4"/><path d="M4 12v3M20 12v3"/>`];
  return [`<rect x="9" y="7" width="6" height="14" rx="2" ${f("#F3F7F8")}/><rect x="9.6" y="10" width="4.8" height="10.4" rx="1.6" ${f(col || "#E8C060")} opacity=".85"/><rect x="9.5" y="3.5" width="5" height="4" rx="1" ${f("#C9A27E")}/><circle cx="12" cy="7.4" r="1.3" ${f("#FFFDF6")}/>`,
    `<rect x="9" y="7" width="6" height="14" rx="2"/><rect x="9.5" y="3.5" width="5" height="4" rx="1"/>`];
}
