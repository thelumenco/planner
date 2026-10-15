// Bali's people (round 220), local: "bali". All in boat hours (from 8am, home by 7pm). Balinese names follow birth
// order: Wayan (first), Made (second), Nyoman (third), Ketut (fourth); Komang is another third-born name.
//   The storytellers (stories.js): Ibu Wayan, who has made the village's offerings every morning for sixty years;
//   Made, who teaches the gamelan; Ketut, the silversmith.
//   Also: Nyoman, who runs the warung on the beach (and surfs at dawn); Komang at the market; two of Made's players,
//   Putu and Gede; and visitors: Jess, a surfer, and Lars, doing yoga in Ubud for a month.
import { BA_ROOM_STAND, BA_PLAYERS } from "./bali-rooms-layout.js";
const hm = s => { const [h, m] = s.split(":").map(Number); return h*60 + (m || 0); };
const slot = (from, to, scene, where, opts) => Object.assign({from: hm(from), to: hm(to), scene}, Array.isArray(where[0]) ? {wander: where} : {at: where}, opts || {});
const P = (id, name, job, look, routine, lines, intro, away, more) => ({id, local: "bali", pitch: .82 + (id.charCodeAt(2) % 6)*.06, name, job, look, routine, lines, intro, away, ...(more || {})});
const at = room => BA_ROOM_STAND[room];

export const BA_PEOPLE = [
  P("bawayan", "Ibu Wayan", "Makes the village's offerings every morning", {skin: "#B9825E", hair: "#C9C2BA", hairStyle: "bun", top: "#FFFDF6", bottom: "#7A2E5A"},
    [slot("8:00", "11:00", "ba_offer", at("ba_offer"), {dir: -1}), slot("11:00", "12:30", "ba_ubud", [[260, 420], [300, 460]]), slot("12:30", "14:00", "ba_temple", [[260, 440], [300, 470]]), slot("14:00", "19:00", "ba_offer", at("ba_offer"), {dir: -1})],
    ["White to the east, red to the south, yellow to the west, blue to the north. The flowers know where to go.", "Every morning, for the gods, for the ancestors, and a little bit for the dogs. They eat the rice.", "Sixty years of offerings. My hands do it by themselves now. I just watch.", "You don't make it perfect. You make it with your heart. That's what makes it perfect."],
    "Om Swastiastu. I am Ibu Wayan. Sit, sit. You want to learn the offerings? Good. Hands first, thinking after.", "Ibu Wayan is at the temple."),
  P("bamade", "Made", "Teaches the village gamelan", {skin: "#A8754F", hair: "#1E1A18", hairStyle: "short", top: "#E8C23A", bottom: "#2F2B28"},
    [slot("9:00", "12:00", "ba_gamelan", at("ba_gamelan"), {dir: 1}), slot("12:00", "13:00", "ba_warung", [[220, 500], [320, 520]]), slot("13:00", "15:00", "ba_terraces", [[260, 420], [300, 450]]), slot("15:00", "18:30", "ba_gamelan", at("ba_gamelan"), {dir: 1})],
    ["Gamelan is not one person playing. It is twenty people being one person.", "Listen to the gong. The big gong is the heart. Everything comes back to it.", "The competition is in three weeks. The children practise. I don't sleep.", "Kotekan: you play the gaps in my notes, I play the gaps in yours. Together, one fast melody."],
    "Made! I teach gamelan. Come, come and play. No, you can't play badly. The gongs forgive everybody.", "Made is in the rice fields, thinking about music."),
  P("baketut", "Ketut", "Makes silver jewellery in his workshop", {skin: "#B9825E", hair: "#3A3430", hairStyle: "short", top: "#3E6B8C", bottom: "#5A4A3E"},
    [slot("9:00", "13:00", "ba_silver", at("ba_silver"), {dir: -1}), slot("13:00", "14:00", "ba_warung", [[240, 500], [340, 520]]), slot("14:00", "18:30", "ba_silver", at("ba_silver"), {dir: -1})],
    ["Filigree: silver wire, thin as hair, twisted and twisted. Patience is the main tool.", "My father was a silversmith. His father too. My daughter will marry in silver I made. One flower at a time.", "A tiny flame, a tiny breath. Too much and the silver runs away.", "Every piece has a little mistake. That's how the gods know a person made it."],
    "Ketut. Silver. Please, look, everything is handmade. No machines. Just me and my bad eyes.", "Ketut is having lunch at the warung."),
  P("banyoman", "Nyoman", "Runs the warung on the beach, and surfs at dawn", {skin: "#8A5A3A", hair: "#1E1A18", hairStyle: "spiky", top: "#4F9CC4", bottom: "#F3D34A"},
    [slot("8:00", "18:30", "ba_warung", at("ba_warung"), {dir: -1})],
    ["Friend! Coconut? Coconut. Always coconut.", "I surf at six, I cook at eight. Best of both, friend.", "My mother's sambal. Careful. Very careful. Okay, a little bit careful.", "Sunset from here is free. Best thing on the menu."],
    "Hello, friend! Nyoman. Sit anywhere, the sand is the floor. Today is good: the fish came in early."),
  P("bakomang", "Komang", "Sells spices, vanilla and sarongs at the market", {skin: "#A8754F", hair: "#2A2420", hairStyle: "long", top: "#E8566C", bottom: "#3E5E44"},
    [slot("8:00", "17:00", "ba_market", at("ba_market"), {dir: -1})],
    ["Smell this vanilla. No, really smell it. You see? Bali vanilla.", "Snake fruit! Scaly outside, sweet inside. Like my husband.", "Sarong for the temple, you need a sash too. I have both. Of course I have both."],
    "Komang! Vanilla, coffee, spices, sarongs, baskets. Anything you want, I have, or my cousin has."),
  P("baplayer1", "Putu", "Plays the gangsa in Made's gamelan", {skin: "#B9825E", hair: "#1E1A18", hairStyle: "short", top: "#C9483A", bottom: "#2F2B28"},
    [slot("10:00", "12:00", "ba_gamelan", BA_PLAYERS[0], {dir: 1}), slot("15:00", "18:00", "ba_gamelan", BA_PLAYERS[0], {dir: 1}), slot("12:00", "15:00", "ba_ubud", [[240, 460], [300, 480]])],
    ["Faster! Made always says faster.", "I've played since I was seven. My hands dream about it."],
    "Putu! I play the gangsa. The fast one. The show-off one."),
  P("baplayer2", "Gede", "Plays the big gong in Made's gamelan", {skin: "#8A5A3A", hair: "#3A3430", hairStyle: "short", top: "#E3C26A", bottom: "#2F2B28"},
    [slot("10:00", "12:00", "ba_gamelan", BA_PLAYERS[1], {dir: -1}), slot("15:00", "18:00", "ba_gamelan", BA_PLAYERS[1], {dir: -1}), slot("12:00", "15:00", "ba_beach", [[260, 380], [320, 400]])],
    ["I play the big gong. Once every sixteen beats. Very important. Very relaxing.", "The gong has to be struck at exactly the right moment. No pressure."],
    "Gede. Big gong. I wait a long time, then BONG. Best job."),
  P("basurfer", "Jess", "On a surf trip", {skin: "#F2D3BC", hair: "#E8C48E", hairStyle: "long", top: "#2F2B28", bottom: "#4F9CC4"},
    [slot("8:00", "11:00", "ba_beach", [[260, 360], [320, 380], [220, 400]]), slot("11:00", "12:30", "ba_warung", [[220, 520], [320, 540]]), slot("12:30", "15:00", "ba_ubud", [[260, 440], [300, 470]])],
    ["Waves were glassy at dawn. Nyoman got the best one. He always does.", "I came for two weeks. That was a year ago.", "Did you know there's a ceremony on the beach tomorrow? Everyone in white. Beautiful."],
    "Hey! Jess. Surfing, mostly. And eating. And surfing.", null, {tourist: true}),
  P("bayogi", "Lars", "Doing yoga in Ubud for a month", {skin: "#F6DCC6", hair: "#C9785A", hairStyle: "short", top: "#FFFDF6", bottom: "#7FA35A"},
    [slot("9:00", "11:00", "ba_terraces", [[260, 400], [300, 420]]), slot("11:00", "13:00", "ba_temple", [[260, 440], [300, 460]]), slot("13:00", "15:00", "ba_market", [[220, 500], [320, 520]])],
    ["Breathe in the rice fields. Breathe out the inbox.", "A monkey took my sunglasses. I've decided to see it as a lesson in letting go.", "The water temple. I stood in the spring and felt about twelve years old."],
    "Hej! Lars, from Malmö. A month of yoga. My back is happier. My knees, we'll see.", null, {tourist: true})
];
