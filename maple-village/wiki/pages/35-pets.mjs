// Pets: your companion (the five species), spoiling it, the friendship levels; the animal run; adopting a pet for a friend.
import { ITEMS, LEVELS, DECOR } from "../../src/data/items.js";
import { SPECIES, KINDS } from "../../src/art/pets.js";
import { RUNS, KINDS as RUN_KINDS } from "../../src/game/pets.js";
import { PETS as ADOPT, PET_HOMES } from "../../src/game/companions.js";
import { FRIEND_HEARTS } from "../../src/game/quests.js";
import { esc, table, ico, itemIcon, coin, lede } from "../lib.mjs";
import { petSvg } from "./10-start.mjs";

const h2 = (id, t, icon) => `<h2 id="${id}">${icon ? ico(icon, 22) + " " : ""}${esc(t)}</h2>`;
const pace = p => p < .7 ? "ambles behind you, slowly" : p < 1 ? "takes its time" : p > 1 ? "bounds along" : "trots along at your heels";
const sleepy = s => s > 1.3 ? "naps longest of all" : s > 1 ? "naps a little longer" : s < 1 ? "is up again quickest after a nap" : "naps now and then";
const sayOf = it => (it.say || "").replace(/\{kind\}/g, "pet");

export async function pages(){
  const portraits = await Promise.all(KINDS.map(async k => [k, await petSvg(k, 72)]));
  const treats = Object.entries(ITEMS).filter(([, it]) => it.tab === "treats" && it.kind === "food");
  const care = Object.entries(ITEMS).filter(([, it]) => it.tab === "care");
  const fruit = Object.entries(ITEMS).filter(([, it]) => it.kind === "food" && !it.tab && it.say).map(([id]) => id);
  const unlock = it => it.need ? ` <span class="muted">(once you've earned ${it.need} coins that day)</span>` : "";
  const adoptIds = Object.keys(ITEMS).filter(id => ITEMS[id].kind === "pet" && ITEMS[id].pet && ADOPT[ITEMS[id].pet]);
  const html = lede("Uncle Wilf's companion is yours to look after now: a fox, a rabbit, a tortoise, a quokka or a capybara, chosen when you start a new game. Honeybrook also has a little animal run at home, and pets looking for homes at the markets.")
  + h2("your-pet", "Your pet", "fox")
  + `<p>You choose which of the five was waiting on the porch when you arrive, and give it a name (each has suggested names, or type your own). The species stays the same for the whole game; the name can be changed in the settings. See <a href="/getting-started#pets">Getting started</a>.</p>`
  + `<div class="cards">${portraits.map(([k, svg]) => `<div class="card" id="${k}">${svg}<span><b>${esc(SPECIES[k].n)}</b><small>${esc(SPECIES[k].line)}</small><small>Names: ${esc(SPECIES[k].names.join(", "))}</small><small>It ${pace(SPECIES[k].pace)}, and ${sleepy(SPECIES[k].sleepy)}.</small></span></div>`).join("")}</div>`
  + h2("what-it-does", "What your pet does", "sparkle")
  + `<ul class="plain"><li>Follows you everywhere, and curls up for naps.</li>
    <li>Rides along: its head peeps out of the bike basket when you hire a bike, and out of the back of the car once you have one. It hops on the front of your paddleboard too.</li>
    <li>Talks to you in a little speech bubble: how many tasks are left, a villager hoping for a hand, a crop that's ready. With "Peace and quiet" on, it keeps quiet once your list is done.</li>
    <li>Sleeps in its basket beside your bed. A cosy pet bed (${coin(DECOR.fox_bed.price)}, in the market's "Me &amp; my room" tab) upgrades the basket.</li></ul>`
  + h2("spoiling", "Spoiling your pet", "heart")
  + `<p>Open your backpack to see your pet on its rug ("Spoil ${"&lt;name&gt;"}"). Treats are eaten; care things like the brush, the ball and the yarn are kept and can be used again (they give XP at most every 20 minutes); a bubble bath, a flower crown and a fort kit are used up. All of it is at the market: treats in the Treats tab, the rest in Care. Each brings friendship XP.</p>`
  + table(["Treat", "Price", "What your pet says"], treats.map(([id, it]) => [`${itemIcon(id, 24)}<b>${esc(it.n)}</b>`, coin(it.price) + unlock(it), `<span class="muted">"${esc(sayOf(it))}"</span>`]))
  + table(["Care", "Price", "Kept?", "What your pet says"], care.map(([id, it]) => [`${itemIcon(id, 24)}<b>${esc(it.n)}</b>`, coin(it.price) + unlock(it), it.kind === "tool" ? "Kept" : "Used up", `<span class="muted">"${esc(sayOf(it))}"</span>`]))
  + `<p>Your pet will also eat what you grow and pick: ${fruit.map(id => `<span title="${esc(ITEMS[id].n)}">${itemIcon(id, 22)}</span>`).join(" ")} <span class="muted">(${esc(fruit.map(id => ITEMS[id].n.toLowerCase()).join(", "))})</span>.</p>
  <p><b>Play for free:</b> a pat, a game of hide and seek, or a nap together.</p>`
  + h2("friendship", "Friendship levels", "heart")
  + `<p>Friendship grows with XP: from looking after your pet, and from your day in Honeybrook (ticking tasks, feeding the animals, giving gifts, and 5 XP the first time you earn coins each day). Some levels bring a present for the rug.</p>`
  + table(["Level", "XP", "Name", "Present"], LEVELS.map((l, i) => [String(i + 1), String(l.xp), esc(l.name), l.gift ? esc(l.gift) : ""]))
  + h2("the-animal-run", "The animal run", "hen")
  + `<p>Beside the garden at home is a little run for animals bought at the market's Animals tab. Each eats once a day, from your backpack. After three days of meals a chick grows into a hen, a bunny into a rabbit and a kid into a goat. Nobody ever gets ill or leaves: a hungry animal just looks a little sorry for itself until it's fed.</p>
  <ul class="plain"><li>A grown <b>hen</b> eats three meals a day (breakfast before noon, lunch till 5pm, dinner after) and lays an egg after each one.</li>
    <li>A grown <b>goat</b> gives a bottle of goat's milk when fed.</li>
    <li>Scatter the seeds of a garden sunflower in the run and every hen lays two eggs a meal for the rest of the day.</li></ul>`
  + table(["Animal", "Price", "Grows into", "Eats"], Object.entries(RUN_KINDS).map(([k, a]) => { const id = k === "goat" ? "goat" : k; return [`${itemIcon(id, 24)}<b>${esc(ITEMS[id] ? ITEMS[id].n : a.n)}</b>`, ITEMS[id] ? coin(ITEMS[id].price) : "", esc(a.grown), a.food.map(f => `${itemIcon(f, 22)}${esc(ITEMS[f].n)}${ITEMS[f].price ? " " + coin(ITEMS[f].price) : ""}`).join("<br>")]; }))
  + table(["Run", "Price", "Room for", ""], RUNS.map(r => [`<b>${esc(r.n)}</b>`, r.price ? coin(r.price) : "Free", String(r.cap), esc(r.what)]))
  + `<p class="muted">Some suggested names: chicks ${esc(RUN_KINDS.chick.names.slice(0, 4).join(", "))}; bunnies ${esc(RUN_KINDS.rabbit.names.slice(0, 4).join(", "))}; kids ${esc(RUN_KINDS.goat.names.slice(0, 4).join(", "))}.</p>`
  + h2("adopting", "Adopting a pet for a friend", "pet_kitten")
  + `<p>Noor's pet adoption corner stands on the grass by the river at the <a href="/markets#sunday-farmers-market">Sunday farmers market</a> and the <a href="/markets#field-fair">field fair</a>. Every animal there needs a home. Buy one and give it to a villager at ${FRIEND_HEARTS} hearts or more, who'll look after it on the screen you choose. Tap a pet to pat it; when its owner is on the same screen they play together (a little XP, once a day).</p>`
  + table(["Pet", "Price", "Names it might have", "Lives"], adoptIds.map(id => { const it = ITEMS[id], p = ADOPT[it.pet]; return [`${itemIcon(id, 26)}<b>${esc(it.n)}</b><br><small class="muted">${esc(it.line || "")}</small>`, coin(it.price), esc(p.names.join(", ")), p.indoor ? "Indoors only" : "Indoors or out"]; }))
  + `<p><b>Where a pet can live:</b> ${esc(Object.values(PET_HOMES).map(h => h.n).join(", "))}.</p>`;
  const search = [{t: "Your pet", d: "Fox, rabbit, tortoise, quokka or capybara", a: "/pets#your-pet"}, ...KINDS.map(k => ({t: SPECIES[k].n + " (pet)", d: SPECIES[k].line, a: "/pets#" + k})),
    {t: "Pet treats and care", d: "Spoiling your pet", a: "/pets#spoiling"}, {t: "Friendship levels", d: "Your pet's friendship", a: "/pets#friendship"},
    {t: "Animal run", d: "Chicks, bunnies and goats at home", a: "/pets#the-animal-run"}, {t: "Hens and eggs", d: "The animal run", a: "/pets#the-animal-run"},
    {t: "Pet adoption", d: "Noor's corner at the markets", a: "/pets#adopting"}, ...adoptIds.map(id => ({t: ITEMS[id].n + " (adopt)", d: "Noor's adoption corner", a: "/pets#adopting"}))];
  return [{slug: "pets", title: "Pets", section: "people", blurb: "Your pet, spoiling it, the animal run, and adopting a pet for a friend", html, search}];
}
