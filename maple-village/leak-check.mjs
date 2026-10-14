// The public edition's leak check: refuses to pass while anything personal is left in the game.
//   node leak-check.mjs           -> checks the built game (dist/maple-village.html) and lists where each hit lives in src/
//   node leak-check.mjs --summary -> just the counts
// Exit code 1 while there's anything left. The public game is only ever published after this passes.
// Terms are whole words, case-sensitive where the word is also an ordinary one (Mum, Dad, Maple).
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
// [label, regex]
export const TERMS = [
  // the family
  ["Darren", /\bDarren\b/g], ["Evan", /\bEvan\b/g], ["Maple (the fox)", /\bMaple\b/g], ["Mum", /\bMum\b/g], ["Dad", /\bDad\b/g],
  ["Marcus", /\bMarcus\b/g], ["Angelina", /\bAngell?ina\b/gi], ["Ma Ma", /\bMa Ma\b/g], ["Gong Gong", /\bGong ?Gong\b/gi],
  ["Jason", /\bJason\b/g], ["Luca", /\bLuca\b/g], ["Mel", /\bMel\b/g], ["Melody", /\bMelody\b/g], ["Zeh", /\bZeh\b/g],
  // her work and connectors
  ["Sunsama", /sunsama/gi], ["Gmail", /gmail/gi], ["Notion", /\bnotion\b/gi], ["Zapier", /zapier/gi], ["Google Calendar", /google ?calendar/gi],
  ["Chord", /\bChord\b/g], ["Fresh Pages", /fresh ?pages/gi], ["Chico", /\bChico\b/g], ["Luna", /\bLuna\b/g], ["Ohayo", /\bOhayo\b/g],
  ["ClickUp", /clickup/gi], ["GHL", /\bGHL\b/g], ["mcp", /\bmcp\b/gi], ["window.claude", /window\.claude/g], ["email address", /[\w.+-]+@(gmail|freshpages|thelumen)[\w.]*/gi],
  // where she lives
  ["Singapore", /singapore/gi], ["Asia/Singapore", /Asia\/Singapore/g]
];
const bundle = join(root, "dist", "maple-village.html");
if (!existsSync(bundle)) { console.error("Build first: node build.mjs"); process.exit(2); }
const text = readFileSync(bundle, "utf8");
// The opening story (a tired office worker in Singapore inherits a vineyard) is the one place Singapore is allowed:
// its two files may use the word, and the game may carry exactly as many as they do. Nowhere else.
const ALLOW = {"Singapore": ["src/game/intro.js", "src/art/intro.js"]};
const allowed = label => (ALLOW[label] || []).reduce((n, f) => n + (readFileSync(join(root, f), "utf8").match(TERMS.find(t => t[0] === label)[1]) || []).length, 0);
const hits = TERMS.map(([label, re]) => [label, Math.max(0, (text.match(re) || []).length - allowed(label))]).filter(([, n]) => n > 0);

const summary = process.argv.includes("--summary");
if (!hits.length) { console.log("leak check: clean. Nothing personal in the public game."); process.exit(0); }
console.log(`leak check: ${hits.reduce((a, [, n]) => a + n, 0)} personal references left in the public game\n`);
const files = []; const walk = d => readdirSync(d).forEach(f => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.(js|html|css)$/.test(f) && files.push(p); });
walk(join(root, "src"));
for (const [label, n] of hits) {
  console.log(`  ${label}: ${n}`);
  if (summary) continue;
  const re = TERMS.find(t => t[0] === label)[1];
  const per = files.map(f => [relative(root, f), (readFileSync(f, "utf8").match(re) || []).length]).filter(([f, k]) => k && !(ALLOW[label] || []).includes(f)).sort((a, b) => b[1] - a[1]);
  console.log("     " + per.slice(0, 8).map(([f, k]) => `${f} (${k})`).join(", ") + (per.length > 8 ? `, and ${per.length - 8} more files` : ""));
}
process.exit(1);
