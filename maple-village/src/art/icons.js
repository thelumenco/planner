import { TREES, FLOWERS } from "../data/orchard.js";
import { GOODS } from "../data/stall-goods.js";
// Hand-drawn icon set (ink outline + marker fill, same look as the map). No emoji anywhere in the game.
//   icon(name, size)        -> inline <svg> for HTML (buttons, panels, notes)
//   iconAt(name, x, y, s)   -> nested <svg> centred at x,y for use inside the world SVG
// Names: see I below. Seed packets are "seed:<crop>".

const C = {ink: "var(--line)", fox: "var(--fox)", cream: "var(--cream)", rose: "var(--rose)", blush: "var(--blush)", butter: "var(--butter)",
  honey: "var(--honey)", sage: "var(--sage)", moss: "var(--moss)", moss2: "var(--moss2)", peri: "var(--peri)", peri2: "var(--peri2)", sky: "var(--sky)",
  peach: "var(--peach)", wood: "var(--wood)", stone: "var(--stone)", paper: "#FFFDF6", sock: "var(--sock)", water: "#9CC3E0"};
const f = (c) => `style="fill:${c}"`;

// [fill art, outline art]
const I = {
  // HUD + trackers
  board: [`<rect x="3" y="4" width="18" height="15" rx="1.5" ${f(C.wood)}/><rect x="5.5" y="6.5" width="5" height="5" ${f(C.paper)}/><rect x="12.5" y="6" width="6" height="4.5" ${f(C.butter)}/><rect x="7" y="12.5" width="6" height="4.5" ${f(C.blush)}/><rect x="14" y="12" width="4.5" height="5" ${f(C.peri)}/>`,
    `<rect x="3" y="4" width="18" height="15" rx="1.5"/><rect x="5.5" y="6.5" width="5" height="5"/><rect x="12.5" y="6" width="6" height="4.5"/><rect x="7" y="12.5" width="6" height="4.5"/><rect x="14" y="12" width="4.5" height="5"/><path d="M8 19v2.5M16 19v2.5"/>`],
  bag: [`<path d="M5 9c0-2.5 2-4 7-4s7 1.5 7 4v10.5c0 .8-.7 1.5-1.5 1.5h-11c-.8 0-1.5-.7-1.5-1.5z" ${f(C.peach)}/><rect x="8" y="13" width="8" height="5" rx="1" ${f(C.butter)}/>`,
    `<path d="M5 9c0-2.5 2-4 7-4s7 1.5 7 4v10.5c0 .8-.7 1.5-1.5 1.5h-11c-.8 0-1.5-.7-1.5-1.5z"/><path d="M9 5.4C9 3.5 10.3 2.5 12 2.5s3 1 3 2.9"/><rect x="8" y="13" width="8" height="5" rx="1"/><path d="M8 15.5h8M5 11h14"/>`],
  heart: [`<path d="M12 20s-7.5-4.5-7.5-10A4 4 0 0 1 12 7.6 4 4 0 0 1 19.5 10C19.5 15.5 12 20 12 20z" ${f(C.rose)}/>`,
    `<path d="M12 20s-7.5-4.5-7.5-10A4 4 0 0 1 12 7.6 4 4 0 0 1 19.5 10C19.5 15.5 12 20 12 20z"/><path d="M7.5 10.5c0-1.2.8-2 1.8-2.2" opacity=".6"/>`],
  letter: [`<rect x="3" y="6" width="18" height="13" rx="1.5" ${f(C.paper)}/><circle cx="12" cy="13" r="2" ${f(C.rose)}/>`,
    `<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3.5 6.8L12 13l8.5-6.2"/><circle cx="12" cy="13" r="2"/>`],
  letterOpen: [`<path d="M3 10l9-6 9 6v9.5c0 .8-.7 1.5-1.5 1.5h-15C3.7 21 3 20.3 3 19.5z" ${f(C.paper)}/><rect x="6" y="7" width="12" height="9" ${f("#F4EEE3")}/>`,
    `<path d="M3 10l9-6 9 6v9.5c0 .8-.7 1.5-1.5 1.5h-15C3.7 21 3 20.3 3 19.5z"/><path d="M3.5 10.5L12 16l8.5-5.5M8 9.5h8M8 12h6"/>`],
  drop: [`<path d="M12 3.5C9 8 6.5 11 6.5 14.5a5.5 5.5 0 0 0 11 0C17.5 11 15 8 12 3.5z" ${f(C.water)}/>`,
    `<path d="M12 3.5C9 8 6.5 11 6.5 14.5a5.5 5.5 0 0 0 11 0C17.5 11 15 8 12 3.5z"/><path d="M9.3 15c0 1.4.9 2.4 2.1 2.7" opacity=".7"/>`],
  steps: [`<path d="M7.5 3.5c2 0 3 2 3 4.5s-1 4.5-3 4.5-2.8-2-2.8-4.5 1-4.5 2.8-4.5z" ${f(C.sage)}/><path d="M16.5 10c1.9 0 2.8 2 2.8 4.5s-1 4.5-2.8 4.5-3-2-3-4.5 1-4.5 3-4.5z" ${f(C.sage)}/>`,
    `<path d="M7.5 3.5c2 0 3 2 3 4.5s-1 4.5-3 4.5-2.8-2-2.8-4.5 1-4.5 2.8-4.5z"/><path d="M6.2 14.5h3l-.4 3h-2.2z"/><path d="M16.5 10c1.9 0 2.8 2 2.8 4.5s-1 4.5-2.8 4.5-3-2-3-4.5 1-4.5 3-4.5z"/><path d="M15.2 21h3"/>`],
  coin: [`<ellipse cx="12" cy="12.5" rx="8" ry="8" ${f(C.honey)}/><ellipse cx="12" cy="12.5" rx="5" ry="5" ${f(C.butter)}/>`,
    `<circle cx="12" cy="12.5" r="8"/><circle cx="12" cy="12.5" r="5"/><path d="M12 10.3v4.4M10.6 11.3l1.4-1 1.4 1" /><path d="M6.8 8.5c.8-1 1.8-1.7 3-2.1" opacity=".6"/>`],
  // quest-note stickers
  pause: [`<rect x="6.5" y="5" width="4" height="14" rx="1.2" ${f(C.peri)}/><rect x="13.5" y="5" width="4" height="14" rx="1.2" ${f(C.peri)}/>`, `<rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/>`],
  play: [`<path d="M7.5 4.5l11 7.5-11 7.5z" ${f(C.sage)}/>`, `<path d="M7.5 4.5l11 7.5-11 7.5z"/>`],
  reset: [`<circle cx="12" cy="12.5" r="7" ${f(C.paper)}/>`, `<path d="M5.4 10.5A7 7 0 1 1 6 16"/><path d="M4.5 6.5l1 4.2 4.1-1.1"/>`],
  clock: [`<circle cx="12" cy="13" r="8" ${f(C.paper)}/>`, `<circle cx="12" cy="13" r="8"/><path d="M12 8.5V13l3 2M6 4.5l-2 2M18 4.5l2 2"/>`],
  chat: [`<path d="M4 6.5c0-1.4 1.1-2.5 2.5-2.5h11c1.4 0 2.5 1.1 2.5 2.5v7c0 1.4-1.1 2.5-2.5 2.5H10l-4 3.5V16h0c-1.1 0-2-1.1-2-2.5z" ${f(C.peri)}/>`,
    `<path d="M4 6.5c0-1.4 1.1-2.5 2.5-2.5h11c1.4 0 2.5 1.1 2.5 2.5v7c0 1.4-1.1 2.5-2.5 2.5H10l-4 3.5V16h0c-1.1 0-2-1.1-2-2.5z"/><path d="M8 9h8M8 12h5"/>`],
  note: [`<path d="M6 3h9l4 4v13.5c0 .3-.2.5-.5.5h-12.5c-.3 0-.5-.2-.5-.5v-17z" ${f(C.paper)}/>`,
    `<path d="M6 3h9l4 4v13.5c0 .3-.2.5-.5.5h-12.5c-.3 0-.5-.2-.5-.5v-17z"/><path d="M15 3v4h4M8.5 11h7M8.5 14h7M8.5 17h4.5"/>`],
  walker: [`<circle cx="13" cy="4.5" r="2" ${f(C.peach)}/><path d="M10.5 8.5l3.5-.5 1.5 4.5 2.5 1.5-.8 1.2-3.2-1.5-1-2.2-.9 3.3 2.4 2.7-.2 4.5h-1.6l-.1-3.6-3-2.8 1.2-5-1.6.9-.9 2.9-1.4-.5 1.1-3.6z" ${f(C.sage)}/>`,
    `<circle cx="13" cy="4.5" r="2"/><path d="M10.5 8.5l3.5-.5 1.5 4.5 2.5 1.5M13 13l2.4 2.7-.2 4.5M12 14l-2.6 3.8-2.6.7M10.5 8.5l-2.1 1.3-.9 2.9"/>`],
  fox: [`<path d="M4 4l4.5 4.5h7L20 4l-.5 7.5c0 4.5-3.4 8-7.5 8s-7.5-3.5-7.5-8z" ${f(C.fox)}/><path d="M6 12.5c1.5 3 3.6 4.4 6 3.2 2.4 1.2 4.5-.2 6-3.2-2 .8-4 .5-6-1.2-2 1.7-4 2-6 1.2z" ${f(C.cream)}/>`,
    `<path d="M4 4l4.5 4.5h7L20 4l-.5 7.5c0 4.5-3.4 8-7.5 8s-7.5-3.5-7.5-8z"/><circle cx="9.3" cy="11" r=".9" fill="var(--line)"/><circle cx="14.7" cy="11" r=".9" fill="var(--line)"/><path d="M11.2 14.2h1.6l-.8.9z" fill="var(--line)"/>`],
  sparkle: [`<path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z" ${f(C.butter)}/>`, `<path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z"/>`],
  sprout: [`<path d="M12 21v-8" /><path d="M12 13c-4 0-6-2-6.5-6 4 0 6 2 6.5 6z" ${f(C.moss)}/><path d="M12 11c.5-4 2.5-6 6.5-6-.5 4-2.5 6-6.5 6z" ${f(C.moss)}/>`,
    `<path d="M12 21v-9"/><path d="M12 13c-4 0-6-2-6.5-6 4 0 6 2 6.5 6zM12 11c.5-4 2.5-6 6.5-6-.5 4-2.5 6-6.5 6z"/><path d="M8 21h8"/>`],
  bowl: [`<path d="M3.5 11h17c0 5-3.8 8.5-8.5 8.5S3.5 16 3.5 11z" ${f(C.peri)}/>`, `<path d="M3.5 11h17c0 5-3.8 8.5-8.5 8.5S3.5 16 3.5 11z"/><path d="M8 8c0-1.5 1-1.5 1-3M12 8c0-1.5 1-1.5 1-3M16 8c0-1.5 1-1.5 1-3"/>`],
  eyes: [`<ellipse cx="8" cy="12" rx="3.5" ry="4.5" ${f(C.paper)}/><ellipse cx="16" cy="12" rx="3.5" ry="4.5" ${f(C.paper)}/>`, `<ellipse cx="8" cy="12" rx="3.5" ry="4.5"/><ellipse cx="16" cy="12" rx="3.5" ry="4.5"/><circle cx="8.8" cy="13" r="1.5" fill="var(--line)"/><circle cx="16.8" cy="13" r="1.5" fill="var(--line)"/>`],
  bubbles: [`<circle cx="9" cy="14" r="5" ${f("#D8ECF6")}/><circle cx="16.5" cy="8.5" r="3.2" ${f("#D8ECF6")}/><circle cx="17" cy="17" r="2" ${f("#D8ECF6")}/>`, `<circle cx="9" cy="14" r="5"/><circle cx="16.5" cy="8.5" r="3.2"/><circle cx="17" cy="17" r="2"/><path d="M6.5 12.5c.3-1 1-1.6 1.9-1.8" opacity=".6"/>`],
  // places (quest lists)
  hall: [`<path d="M3 9l9-5 9 5z" ${f(C.peri)}/><rect x="4" y="9" width="16" height="10" ${f(C.paper)}/>`, `<path d="M3 9l9-5 9 5zM4 9h16v10H4zM7 11v6M10.3 11v6M13.7 11v6M17 11v6M2.5 20.5h19"/>`],
  chord: [`<circle cx="12" cy="12" r="6.5" ${f(C.sage)}/>`, `<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.4"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>`],
  fresh: [`<path d="M12 6.5C9.5 5 6.5 4.5 3 5v13c3.5-.5 6.5 0 9 1.5 2.5-1.5 5.5-2 9-1.5V5c-3.5-.5-6.5 0-9 1.5z" ${f(C.peach)}/>`, `<path d="M12 6.5C9.5 5 6.5 4.5 3 5v13c3.5-.5 6.5 0 9 1.5 2.5-1.5 5.5-2 9-1.5V5c-3.5-.5-6.5 0-9 1.5zM12 6.5v13M5.5 9c1.5 0 3 .2 4 .7M5.5 12c1.5 0 3 .2 4 .7M14.5 9.7c1-.5 2.5-.7 4-.7"/>`],
  chico: [`<path d="M3 12c0-5 4-8 9-8s9 3 9 8z" ${f(C.rose)}/><rect x="5" y="12" width="14" height="8" rx="1" ${f("#FBEFEA")}/>`, `<path d="M3 12c0-5 4-8 9-8s9 3 9 8zM5 12h14v8H5zM10 20v-4a2 2 0 0 1 4 0v4"/><path d="M12 8.4c-.6-.9-1.8-.4-1.2.5l1.2 1.1 1.2-1.1c.6-.9-.6-1.4-1.2-.5z"/>`],
  luna: [`<path d="M15 4a8 8 0 1 0 5 13 6.5 6.5 0 1 1-5-13z" ${f("#B9A6E8")}/>`, `<path d="M15 4a8 8 0 1 0 5 13 6.5 6.5 0 1 1-5-13z"/><path d="M6 6l.6 1.3 1.3.2-1 .9.3 1.3L6 9l-1.2.7.3-1.3-1-.9 1.3-.2z"/>`],
  ohayo: [`<circle cx="12" cy="13" r="5" ${f("#F3C969")}/>`, `<circle cx="12" cy="13" r="5"/><path d="M12 4.5V6.5M4.5 13H6.5M17.5 13h2M6.7 7.7l1.4 1.4M17.3 7.7l-1.4 1.4M3 20h18"/>`],
  post: [`<rect x="4" y="7" width="16" height="13" ${f("#EAF1F6")}/><rect x="3" y="4.5" width="18" height="3" ${f(C.sky)}/>`, `<rect x="4" y="7" width="16" height="13"/><rect x="3" y="4.5" width="18" height="3"/><path d="M7 10h10v6H7zM7 10l5 3.5 5-3.5"/>`],
  home: [`<path d="M3 11l9-7 9 7z" ${f(C.butter)}/><rect x="5" y="11" width="14" height="9" ${f(C.paper)}/>`, `<path d="M3 11l9-7 9 7zM5 11h14v9H5zM10 20v-5h4v5M16 6.5V4h2v4"/>`],
  market: [`<path d="M3 5h18l-1.5 4h-15z" ${f(C.rose)}/><rect x="5" y="11" width="14" height="7" ${f(C.wood)}/>`, `<path d="M3 5h18l-1.5 4h-15zM5 9v11M19 9v11M5 11h14v7H5z"/><circle cx="9" cy="14.5" r="1.4"/><circle cx="13" cy="14.5" r="1.4"/>`],
  farm: null,  // alias of sprout, set below
  // treats + tools + produce
  apple: [`<path d="M12 7.5c-2-1.5-7-1.5-7 4.5 0 4.5 3 8 5 8 1 0 1.3-.5 2-.5s1 .5 2 .5c2 0 5-3.5 5-8 0-6-5-6-7-4.5z" ${f(C.rose)}/><path d="M12.3 7c.5-2 2-3 4-3-.5 2-2 3-4 3z" ${f(C.moss)}/>`,
    `<path d="M12 7.5c-2-1.5-7-1.5-7 4.5 0 4.5 3 8 5 8 1 0 1.3-.5 2-.5s1 .5 2 .5c2 0 5-3.5 5-8 0-6-5-6-7-4.5z"/><path d="M12 7.5c0-1.5-.5-3-1.5-4M12.3 7c.5-2 2-3 4-3-.5 2-2 3-4 3zM7.5 11c.2-1.2.8-2 1.8-2.3"/>`],
  dumpling: [`<path d="M3.5 15c0-5 4-8.5 8.5-8.5s8.5 3.5 8.5 8.5c0 1.5-1.5 2.5-3 2.5H6.5c-1.5 0-3-1-3-2.5z" ${f(C.paper)}/>`,
    `<path d="M3.5 15c0-5 4-8.5 8.5-8.5s8.5 3.5 8.5 8.5c0 1.5-1.5 2.5-3 2.5H6.5c-1.5 0-3-1-3-2.5z"/><path d="M8 8.2l1 2.3M12 6.6v2.6M16 8.2l-1 2.3"/>`],
  fish: [`<path d="M3 12c3-4.5 9-5.5 13-2l4-3v10l-4-3c-4 3.5-10 2.5-13-2z" ${f(C.sky)}/>`,
    `<path d="M3 12c3-4.5 9-5.5 13-2l4-3v10l-4-3c-4 3.5-10 2.5-13-2z"/><circle cx="7.5" cy="11" r=".9" fill="var(--line)"/><path d="M11 9.5c1 1.5 1 3.5 0 5" opacity=".6"/>`],
  toast: [`<path d="M5 9.5C3.5 9.5 3 8 3 7c0-2 2-3.5 9-3.5S21 5 21 7c0 1-.5 2.5-2 2.5V20H5z" ${f(C.honey)}/><path d="M7 9.5h10v8H7z" ${f(C.butter)}/>`,
    `<path d="M5 9.5C3.5 9.5 3 8 3 7c0-2 2-3.5 9-3.5S21 5 21 7c0 1-.5 2.5-2 2.5V20H5z"/><path d="M8 11c2 1 4 1 8 0M10 14c.5 1.5 0 2-1 2.5" opacity=".7"/>`],
  picnic: [`<path d="M3.5 11h17l-2 9h-13z" ${f(C.wood)}/><path d="M3 9h18v2.5H3z" ${f(C.rose)}/>`,
    `<path d="M3.5 11h17l-2 9h-13zM3 9h18v2.5H3zM7 9a5 5 0 0 1 10 0M6.5 14h11M7.5 17h9"/>`],
  brush: [`<rect x="10" y="2.5" width="4" height="10" rx="2" ${f(C.wood)}/><path d="M6.5 12.5h11l-1 8h-9z" ${f(C.peach)}/>`,
    `<rect x="10" y="2.5" width="4" height="10" rx="2"/><path d="M6.5 12.5h11l-1 8h-9zM9 15v5M12 15v5M15 15v5"/>`],
  ball: [`<circle cx="12" cy="12" r="8" ${f(C.paper)}/><path d="M12 8l3 2.2-1.2 3.5h-3.6L9 10.2z" ${f(C.sock)}/>`,
    `<circle cx="12" cy="12" r="8"/><path d="M12 8l3 2.2-1.2 3.5h-3.6L9 10.2zM12 8V4.2M15 10.2l3.8-1.3M13.8 13.7l2.3 3.2M10.2 13.7l-2.3 3.2M9 10.2L5.2 8.9"/>`],
  yarn: [`<circle cx="11" cy="12" r="7" ${f(C.rose)}/>`, `<circle cx="11" cy="12" r="7"/><path d="M5.5 8.5c3 1 6 4 7.5 9.5M8 6c3 2 5.5 5 6.5 10M4.5 13c3-1 6.5-.5 10.5 2M17.5 15c1.5 1 3 1 3.5 3"/>`],
  bath: [`<path d="M3 11h18v2.5c0 3.5-3 6-6.5 6h-5C6 19.5 3 17 3 13.5z" ${f(C.paper)}/><circle cx="8" cy="8.5" r="2.2" ${f("#D8ECF6")}/><circle cx="13" cy="7" r="2.8" ${f("#D8ECF6")}/><circle cx="17.5" cy="9" r="1.8" ${f("#D8ECF6")}/>`,
    `<path d="M3 11h18v2.5c0 3.5-3 6-6.5 6h-5C6 19.5 3 17 3 13.5zM6 19.5l-1 2M18 19.5l1 2"/><circle cx="8" cy="8.5" r="2.2"/><circle cx="13" cy="7" r="2.8"/><circle cx="17.5" cy="9" r="1.8"/>`],
  crown: [`<path d="M4 14c2-3 14-3 16 0" fill="none"/><circle cx="6" cy="12.5" r="2.4" ${f(C.rose)}/><circle cx="10" cy="10.8" r="2.4" ${f(C.paper)}/><circle cx="14" cy="10.8" r="2.4" ${f(C.honey)}/><circle cx="18" cy="12.5" r="2.4" ${f(C.rose)}/>`,
    `<path d="M3.5 15.5c2.5-2.5 14.5-2.5 17 0"/><circle cx="6" cy="12.5" r="2.4"/><circle cx="10" cy="10.8" r="2.4"/><circle cx="14" cy="10.8" r="2.4"/><circle cx="18" cy="12.5" r="2.4"/><path d="M8 15l-1.5 3M16 15l1.5 3" opacity=".7"/>`],
  fort: [`<path d="M2.5 20L12 4l9.5 16z" ${f(C.butter)}/><path d="M9.5 20l2.5-6 2.5 6z" ${f(C.wood)}/>`, `<path d="M2.5 20L12 4l9.5 16zM9.5 20l2.5-6 2.5 6M12 4V2"/><path d="M12 2l3 1-3 1"/>`],
  tulip: [`<path d="M12 21v-9" /><path d="M7.5 5l2.5 2.5L12 4l2 3.5L16.5 5v4.5c0 2.5-2 4-4.5 4s-4.5-1.5-4.5-4z" ${f(C.rose)}/><path d="M12 18c-2.5 0-4-1.5-4.5-3.5 2.5 0 4 1.5 4.5 3.5z" ${f(C.moss)}/>`,
    `<path d="M12 21v-7.5M7.5 5l2.5 2.5L12 4l2 3.5L16.5 5v4.5c0 2.5-2 4-4.5 4s-4.5-1.5-4.5-4zM12 18c-2.5 0-4-1.5-4.5-3.5 2.5 0 4 1.5 4.5 3.5z"/>`],
  sunflower: [`<circle cx="12" cy="9" r="6.5" ${f(C.honey)}/><circle cx="12" cy="9" r="3" ${f(C.wood)}/><path d="M12 21v-6" />`,
    `<path d="M12 2.5v2M12 13.5v2M5.5 9h2M16.5 9h2M7.4 4.4l1.4 1.4M15.2 12.2l1.4 1.4M7.4 13.6l1.4-1.4M15.2 5.8l1.4-1.4"/><circle cx="12" cy="9" r="4.5"/><circle cx="12" cy="9" r="3"/><path d="M12 15v6M12 18.5c-1.5-1.5-3-1.5-4-1"/>`],
  carrot: [`<path d="M16.5 7.5L4 20.5c-.5-1.5 3.5-10 6.5-13s4.5-2.5 6-0z" ${f(C.peach)}/><path d="M15.5 8c1-2.5 2-4 3.5-5M16 8.5c2-.5 3.5-.5 5 .5M15.8 8c0-2-.5-3.5-1.5-5" ${f("none")}/>`,
    `<path d="M16.5 7.5L4 20.5c-.5-1.5 3.5-10 6.5-13s4.5-2.5 6-0zM8.5 13l1.5 1M7 16l1.2.8M11 10.5l1.2.8"/><path d="M15.5 8c1-2.5 2-4 3.5-5M16 8.5c2-.5 3.5-.5 5 .5M15.8 8c0-2-.5-3.5-1.5-5" style="stroke:var(--moss2)"/>`],
  corn: [`<path d="M12 3c3 0 4 4 4 8.5S14.5 21 12 21s-4-5-4-9.5S9 3 12 3z" ${f(C.honey)}/><path d="M8.5 12c-2 2-2.5 5-1.5 9 2-1 4-3 4.5-5z" ${f(C.moss)}/><path d="M15.5 12c2 2 2.5 5 1.5 9-2-1-4-3-4.5-5z" ${f(C.moss)}/>`,
    `<path d="M12 3c3 0 4 4 4 8.5S14.5 21 12 21s-4-5-4-9.5S9 3 12 3zM10 6h4M9.5 9h5M9.3 12h5.4"/><path d="M8.5 12c-2 2-2.5 5-1.5 9 2-1 4-3 4.5-5zM15.5 12c2 2 2.5 5 1.5 9-2-1-4-3-4.5-5z"/>`],
  strawberry: [`<path d="M12 7c4 0 7 1.5 7 4.5 0 4.5-4 9-7 9.5-3-.5-7-5-7-9.5C5 8.5 8 7 12 7z" ${f(C.rose)}/><path d="M7.5 7.5L9 5l3 1.5L15 5l1.5 2.5c-3 1-6 1-9 0z" ${f(C.moss)}/>`,
    `<path d="M12 7c4 0 7 1.5 7 4.5 0 4.5-4 9-7 9.5-3-.5-7-5-7-9.5C5 8.5 8 7 12 7zM7.5 7.5L9 5l3 1.5L15 5l1.5 2.5M12 6.5V3.5"/><path d="M9 11h.1M12 12.5h.1M15 11h.1M10.5 15.5h.1M13.5 15.5h.1" stroke-width="1.6"/>`],
  blueberry: [`<circle cx="8.5" cy="14" r="4.5" ${f(C.peri2)}/><circle cx="15.5" cy="13" r="4.5" ${f(C.peri)}/><circle cx="12" cy="7.5" r="3.8" ${f(C.peri2)}/>`,
    `<circle cx="8.5" cy="14" r="4.5"/><circle cx="15.5" cy="13" r="4.5"/><circle cx="12" cy="7.5" r="3.8"/><path d="M7.5 13.2l1 1 1-1M14.5 12.2l1 1 1-1M11 6.7l1 1 1-1"/>`]
};
I.zoomOut = [`<circle cx="10.5" cy="10.5" r="6.5" style="fill:#FFFDF6"/>`, `<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3l5 5M7.5 10.5h6"/>`];
I.zoomIn = [`<circle cx="10.5" cy="10.5" r="6.5" style="fill:#FFFDF6"/>`, `<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3l5 5M7.5 10.5h6M10.5 7.5v6"/>`];
I.lantern = [`<path d="M8 6h8l2 4v6l-2 4H8l-2-4v-6z" style="fill:#F6C26B"/><circle cx="12" cy="13" r="2.4" style="fill:#FFF3C4"/>`, `<path d="M8 6h8l2 4v6l-2 4H8l-2-4v-6zM10 3.5h4v2.5h-4zM12 20v2M6 10h12M6 16h12"/>`];
I.wallpaper = [`<rect x="4" y="4" width="11" height="16" rx="1" style="fill:#F4C7CF"/><path d="M15 4c3 0 5 1.5 5 3.5S18 11 15 11z" style="fill:#F9DDE2"/>`, `<rect x="4" y="4" width="11" height="16" rx="1"/><path d="M15 4c3 0 5 1.5 5 3.5S18 11 15 11"/><circle cx="7.5" cy="8" r=".9"/><circle cx="11.5" cy="11" r=".9"/><circle cx="7.5" cy="14" r=".9"/><circle cx="11.5" cy="17" r=".9"/>`];
I.rug = [`<ellipse cx="12" cy="13" rx="9.5" ry="6" style="fill:var(--peri)"/><ellipse cx="12" cy="13" rx="5.5" ry="3.2" style="fill:var(--butter)"/>`, `<ellipse cx="12" cy="13" rx="9.5" ry="6"/><ellipse cx="12" cy="13" rx="5.5" ry="3.2"/><path d="M2.5 13h-1.5M21.5 13h1.5" stroke-dasharray="1 1"/>`];
I.lamp = [`<path d="M7 4h10l2 7H5z" style="fill:var(--butter)"/>`, `<path d="M7 4h10l2 7H5zM12 11v8M8 20h8"/><path d="M10 13c.5 1 1.3 1.5 2 1.5" opacity=".5"/>`];
I.pot = [`<path d="M7 14h10l-1.5 7h-7z" style="fill:#E3A27E"/><path d="M12 14c-4-1-6-5-5-9 3 1 5 4 5 9zM12 14c1-5 3-8 6-9 0 4-2 8-6 9z" style="fill:var(--moss)"/>`, `<path d="M7 14h10l-1.5 7h-7zM12 14c-4-1-6-5-5-9 3 1 5 4 5 9zM12 14c1-5 3-8 6-9 0 4-2 8-6 9z"/>`];
I.painting = [`<rect x="3.5" y="5" width="17" height="14" rx="1" style="fill:var(--wood)"/><rect x="6" y="7.5" width="12" height="9" style="fill:var(--sky)"/><path d="M6 16.5l4-4 3 3 2-2 3 3z" style="fill:var(--moss)"/>`, `<rect x="3.5" y="5" width="17" height="14" rx="1"/><rect x="6" y="7.5" width="12" height="9"/><path d="M6 16.5l4-4 3 3 2-2 3 3"/><circle cx="15.5" cy="10" r="1.2"/>`];
I.bed = [`<ellipse cx="12" cy="15" rx="9" ry="5" style="fill:var(--peach)"/><ellipse cx="12" cy="14.5" rx="6" ry="3" style="fill:var(--cream)"/>`, `<ellipse cx="12" cy="15" rx="9" ry="5"/><ellipse cx="12" cy="14.5" rx="6" ry="3"/><path d="M8 9.5c1-1.5 2.5-1.5 3 0M13 9.5c1-1.5 2.5-1.5 3 0" opacity=".5"/>`];
I.calendar = [`<rect x="3.5" y="5" width="17" height="15.5" rx="2" style="fill:#FFFDF6"/><path d="M3.5 7c0-1.1.9-2 2-2h13c1.1 0 2 .9 2 2v3h-17z" style="fill:var(--rose)"/>`, `<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M7 13.5h2M11 13.5h2M15 13.5h2M7 17h2M11 17h2" stroke-width="1.6"/>`];
I.gear = [`<circle cx="12" cy="12" r="6.5" style="fill:var(--oat)"/><circle cx="12" cy="12" r="2.6" style="fill:#FFFDF6"/>`, `<path d="M12 2.8l1.5 2.4 2.8-.6.6 2.8 2.4 1.5-1.2 2.6 1.2 2.6-2.4 1.5-.6 2.8-2.8-.6L12 21.2l-1.5-2.4-2.8.6-.6-2.8-2.4-1.5 1.2-2.6-1.2-2.6 2.4-1.5.6-2.8 2.8.6z"/><circle cx="12" cy="12" r="2.6"/>`];
I.music = [`<circle cx="7" cy="17.5" r="2.8" style="fill:var(--peri)"/><circle cx="17" cy="15.5" r="2.8" style="fill:var(--peri)"/>`, `<circle cx="7" cy="17.5" r="2.8"/><circle cx="17" cy="15.5" r="2.8"/><path d="M9.8 17.5V6l10-2v11.5M9.8 9l10-2"/>`];
I.farm = I.sprout;
I.water = I.drop;
I.well = I.drop;

const art = name => {
  if (name.startsWith("seed:")) {   // a seed packet with the crop drawn on it
    const inner = I[name.slice(5)] || I.sprout;
    return [`<path d="M5 3h14l-1 18H6z" ${f(C.paper)}/><path d="M5 3h14v3.5H5z" ${f(C.sage)}/><g transform="translate(7 8) scale(.42)">${inner[0]}</g>`,
      `<path d="M5 3h14l-1 18H6zM5 6.5h14"/><path d="M7 4.8h1.5M10 4.8h1.5M13 4.8h1.5" stroke-dasharray="1 1"/><g transform="translate(7 8) scale(.42)" stroke-width="2.6">${inner[1]}</g>`];
  }
  return I[name] || I.sparkle;
};
const body = name => { const [a, l] = art(name); return `<g filter="url(#markerS)">${a}</g><g filter="url(#wobS)" fill="none" stroke="var(--line)" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">${l}</g>`; };

// shed tools
I.wateringCan = [`<rect x="4" y="9" width="11" height="10" rx="2" ${f(C.water)}/>`, `<rect x="4" y="9" width="11" height="10" rx="2"/><path d="M15 12l5-4M19 6.5l2 2.5M6 9c0-3 7-3 7 0"/><circle cx="21" cy="11" r=".6"/><circle cx="20" cy="13.5" r=".6"/>`];
I.compost = [`<path d="M5 9h14l-1.5 11h-11z" ${f(C.wood)}/><path d="M8 8c1-2 2-3 4-3s3 1 4 3" ${f(C.moss)}/>`, `<path d="M5 9h14l-1.5 11h-11zM4 9h16M8 13h8M8.5 16.5h7"/><path d="M8 8c1-2 2-3 4-3s3 1 4 3"/>`];
I.sprinkler = [`<circle cx="12" cy="17" r="3" ${f(C.stone)}/>`, `<circle cx="12" cy="17" r="3"/><path d="M12 14v-3M12 21h0M5 9c2-3 4-4 7-4s5 1 7 4M8 10.5c1-1.5 2.5-2 4-2s3 .5 4 2"/><circle cx="5" cy="12" r=".7"/><circle cx="19" cy="12" r=".7"/><circle cx="8" cy="13" r=".7"/><circle cx="16" cy="13" r=".7"/>`];
// gifts for Marcus and Angellina (Hana's Family tab)
I.protbar = [`<rect x="3" y="9" width="18" height="7" rx="2" ${f("#9CC27E")}/><rect x="8" y="9" width="8" height="7" ${f("#FFFDF6")}/>`, `<rect x="3" y="9" width="18" height="7" rx="2"/><path d="M8 9v7M16 9v7M10 12.5h4"/>`];
I.jerky = [`<path d="M5 5c4-1 9 0 12 3s3 9 1 11-9 0-12-3-4-10-1-11z" ${f("#9A4A32")}/>`, `<path d="M5 5c4-1 9 0 12 3s3 9 1 11-9 0-12-3-4-10-1-11z"/><path d="M8 9c2 1 4 3 5 6M11 7c2 1 4 3 5 6" opacity=".6"/>`];
I.chickenbox = [`<rect x="3" y="8" width="18" height="11" rx="2" ${f("#2F2B28")}/><rect x="5" y="10" width="7" height="7" rx="1" ${f("#FFFDF6")}/><rect x="13" y="10" width="6" height="7" rx="1" ${f("#E8A65A")}/>`, `<rect x="3" y="8" width="18" height="11" rx="2"/><rect x="5" y="10" width="7" height="7" rx="1"/><rect x="13" y="10" width="6" height="7" rx="1"/>`];
I.oatlatte = [`<path d="M7 7h10l-1.2 13H8.2z" ${f("#E8D3B0")}/><path d="M6.5 5h11v2h-11z" ${f("#FFFDF6")}/>`, `<path d="M7 7h10l-1.2 13H8.2zM6.5 5h11v2h-11zM8 12h8"/>`];
I.bubbletea = [`<path d="M6.5 7h11l-1.5 13.5h-8z" ${f("#D9B48A")}/><circle cx="10" cy="18" r="1.2" ${f("#2F2B28")}/><circle cx="13" cy="18.5" r="1.2" ${f("#2F2B28")}/><circle cx="11.5" cy="16.5" r="1.2" ${f("#2F2B28")}/>`, `<path d="M6.5 7h11l-1.5 13.5h-8zM6 7h12M13 7l2-5"/>`];
I.highlighters = [`<rect x="4" y="6" width="4" height="13" rx="1" ${f("#F4C7CF")}/><rect x="10" y="5" width="4" height="14" rx="1" ${f("#C3E8B8")}/><rect x="16" y="6" width="4" height="13" rx="1" ${f("#C3CDEE")}/>`, `<rect x="4" y="6" width="4" height="13" rx="1"/><rect x="10" y="5" width="4" height="14" rx="1"/><rect x="16" y="6" width="4" height="13" rx="1"/><path d="M4 9h4M10 8h4M16 9h4"/>`];
I.mochi = [`<rect x="3" y="9" width="18" height="10" rx="2" ${f("#F6EEF4")}/><circle cx="8" cy="14" r="3" ${f("#F4C7CF")}/><circle cx="16" cy="14" r="3" ${f("#C3E8B8")}/>`, `<rect x="3" y="9" width="18" height="10" rx="2"/><circle cx="8" cy="14" r="3"/><circle cx="16" cy="14" r="3"/>`];
// pantry staples on Hana's deli shelf, and grapes from the crates
I.chocolate = [`<rect x="5" y="5" width="14" height="15" rx="1.5" ${f("#5A3A2A")}/><path d="M5 5h14v6l-4 3-5-3-5 2z" ${f("#E8566C")}/>`, `<rect x="5" y="5" width="14" height="15" rx="1.5"/><path d="M5 14l5-3 5 3 4-3M12 14v6M5 17h14"/>`];
I.vanilla = [`<path d="M7 20c2-6 6-12 10-16" ${f("#3A2A22")} stroke-width="3"/><path d="M14 18c1-1 3-1 4 0s-1 3-2 3-2-2-2-3z" ${f("#F6EBC8")}/>`, `<path d="M6 20c2-6 6-12 10-16M8 20c2-6 6-12 10-16"/><path d="M14 18c1-1 3-1 4 0s-1 3-2 3-2-2-2-3z"/>`];
I.coffee = [`<path d="M6 7h12l-1 13H7z" ${f("#C9A27E")}/><ellipse cx="12" cy="13" rx="2.6" ry="3.6" ${f("#5A3A2A")}/>`, `<path d="M6 7h12l-1 13H7zM6 7l2-3h8l2 3"/><path d="M12 9.5c-1 2-1 5 0 7"/>`];
I.pistachio = [`<ellipse cx="9" cy="13" rx="4" ry="6" ${f("#E8D9B8")}/><ellipse cx="15" cy="12" rx="4" ry="6" ${f("#A8C98A")}/>`, `<ellipse cx="9" cy="13" rx="4" ry="6"/><ellipse cx="15" cy="12" rx="4" ry="6"/>`];
I.hazelnut = [`<circle cx="12" cy="14" r="6" ${f("#B98A5A")}/><path d="M7 11c1-4 9-4 10 0z" ${f("#E8D9B8")}/>`, `<circle cx="12" cy="14" r="6"/><path d="M7 11c1-4 9-4 10 0M12 6v2"/>`];
I.coconut = [`<circle cx="12" cy="13" r="8" ${f("#8A5A3A")}/><path d="M6 11c2-3 10-3 12 0 0 5-12 5-12 0z" ${f("#F6F1E8")}/>`, `<circle cx="12" cy="13" r="8"/><path d="M6 11c2-3 10-3 12 0"/><circle cx="10" cy="7" r=".8"/><circle cx="14" cy="7" r=".8"/>`];
I.matcha = [`<path d="M4 12h16c0 5-3.6 8-8 8s-8-3-8-8z" ${f("#FFFDF6")}/><ellipse cx="12" cy="12" rx="8" ry="2.4" ${f("#8FB86A")}/>`, `<path d="M4 12h16c0 5-3.6 8-8 8s-8-3-8-8z"/><ellipse cx="12" cy="12" rx="8" ry="2.4"/>`];
I.pandan = [`<path d="M12 21C8 15 6 9 8 3c2 6 4 12 4 18zM12 21c4-6 6-12 4-18-2 6-4 12-4 18z" ${f("#7FB86A")}/>`, `<path d="M12 21C8 15 6 9 8 3c2 6 4 12 4 18zM12 21c4-6 6-12 4-18-2 6-4 12-4 18z"/>`];
I.gulamelaka = [`<path d="M5 9h14v9H5z" ${f("#9A5A2E")}/><ellipse cx="12" cy="9" rx="7" ry="2.4" ${f("#B97A4A")}/>`, `<path d="M5 9v9h14V9"/><ellipse cx="12" cy="9" rx="7" ry="2.4"/><path d="M5 18c2 1.4 12 1.4 14 0"/>`];
I.sesame = [`<path d="M4 12h16c0 5-3.6 8-8 8s-8-3-8-8z" ${f("#FFFDF6")}/>${[[8, 12], [11, 11], [14, 12], [10, 14], [13, 14]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1" ry="1.6" ${f("#2F2B28")}/>`).join("")}`, `<path d="M4 12h16c0 5-3.6 8-8 8s-8-3-8-8zM4 12h16"/>`];
I.mint = [`<ellipse cx="9" cy="12" rx="4" ry="6" transform="rotate(-25 9 12)" ${f("#9FD3B2")}/><ellipse cx="15" cy="11" rx="4" ry="6" transform="rotate(25 15 11)" ${f("#7FB86A")}/>`, `<ellipse cx="9" cy="12" rx="4" ry="6" transform="rotate(-25 9 12)"/><ellipse cx="15" cy="11" rx="4" ry="6" transform="rotate(25 15 11)"/><path d="M12 21v-6"/>`];
I.banana = [`<path d="M5 8c2 8 9 11 14 8-1 3-5 5-9 4S4 14 5 8z" ${f("#F3E07A")}/>`, `<path d="M5 8c2 8 9 11 14 8-1 3-5 5-9 4S4 14 5 8zM5 8l-1-2"/>`];
const grapes = c => [`${[[9, 8], [15, 8], [12, 12], [6, 12], [18, 12], [9, 16], [15, 16], [12, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" ${f(c)}/>`).join("")}`, `${[[9, 8], [15, 8], [12, 12], [6, 12], [18, 12], [9, 16], [15, 16], [12, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join("")}<path d="M12 5V2"/>`];
I.grape_red = grapes("#7A2E5A"); I.grape_white = grapes("#C9D98A");
I.loaf = [`<path d="M4 15c0-6 4-8 8-8s8 2 8 8v4H4z" ${f("#D9A066")}/>`, `<path d="M4 15c0-6 4-8 8-8s8 2 8 8v4H4zM9 9l1 4M13 8l1 4M17 9l-1 4"/>`];
// the Scoop Shack: an ice cream to give, by type
I.ic_cup = [`<path d="M6 12h12l-1.6 8h-8.8z" ${f("#F4C7CF")}/><path d="M7 12c0-4 2.5-6 5-6s5 2 5 6z" ${f("#FFF6DC")}/>`, `<path d="M6 12h12l-1.6 8h-8.8zM7 12c0-4 2.5-6 5-6s5 2 5 6"/><path d="M14 6l3-3"/>`];
I.ic_cone = [`<path d="M8 11h8l-4 11z" ${f("#E8C48E")}/><circle cx="12" cy="8.5" r="4.5" ${f("#F4C7CF")}/>`, `<path d="M8 11h8l-4 11zM9.5 14l4 3M14.5 14l-4 3"/><circle cx="12" cy="8.5" r="4.5"/>`];
I.ic_float = [`<path d="M7 7h10l-1.5 14h-7z" ${f("#E3C9A8")}/><circle cx="12" cy="7" r="4" ${f("#FFF6DC")}/>`, `<path d="M7 7h10l-1.5 14h-7zM14 4l3-3"/><circle cx="12" cy="7" r="4"/><circle cx="10" cy="15" r=".7"/><circle cx="13" cy="17" r=".7"/>`];
I.ic_waffle = [`<path d="M3 15l9-5 9 5-9 5z" ${f("#E8B86A")}/><circle cx="12" cy="10" r="4" ${f("#C3E8B8")}/>`, `<path d="M3 15l9-5 9 5-9 5zM7.5 12.5l9 5M16.5 12.5l-9 5"/><circle cx="12" cy="10" r="4"/>`];
// the night market
I.friedchicken = [`<path d="M5 5c5-2 12 0 14 5s-1 10-6 10-10-2-10-7 0-6 2-8z" ${f("#D99A4A")}/>`, `<path d="M5 5c5-2 12 0 14 5s-1 10-6 10-10-2-10-7 0-6 2-8z"/><path d="M8 9l1 1M12 8l1 1M15 11l1 1M9 14l1 1M13 15l1 1" opacity=".7"/>`];
I.scallion = [`<circle cx="12" cy="12.5" r="8" ${f("#F0C878")}/>`, `<circle cx="12" cy="12.5" r="8"/><path d="M8 10h1M14 9h1M11 14h1M15 15h1M8 15h1" stroke="#5E8A4A" stroke-width="1.8"/><path d="M12 12.5c2 0 3-1 3-3" opacity=".5"/>`];
I.hotteok = [`<ellipse cx="12" cy="13" rx="8.5" ry="6" ${f("#E3B06A")}/><path d="M9 12c2 2 4 2 6 0" ${f("#8C5A3C")}/>`, `<ellipse cx="12" cy="13" rx="8.5" ry="6"/><path d="M9 12c2 2 4 2 6 0"/>`];
I.tteokbokki = [`<path d="M3.5 11h17c0 5-3.8 8.5-8.5 8.5S3.5 16 3.5 11z" ${f("#E8574C")}/><rect x="7" y="8" width="5" height="3" rx="1.5" ${f("#FFFDF6")}/><rect x="12" y="7.5" width="5" height="3" rx="1.5" ${f("#FFFDF6")}/>`, `<path d="M3.5 11h17c0 5-3.8 8.5-8.5 8.5S3.5 16 3.5 11z"/><rect x="7" y="8" width="5" height="3" rx="1.5"/><rect x="12" y="7.5" width="5" height="3" rx="1.5"/>`];
I.eggbread = [`<rect x="5" y="7" width="14" height="11" rx="3" ${f("#E8B86A")}/><ellipse cx="12" cy="11" rx="4" ry="3" ${f("#FFFDF6")}/><circle cx="12" cy="11" r="1.6" ${f("#F3C969")}/>`, `<rect x="5" y="7" width="14" height="11" rx="3"/><ellipse cx="12" cy="11" rx="4" ry="3"/>`];
I.pearlclip = [`<rect x="4" y="10" width="16" height="4" rx="2" ${f("#D9B46A")}/>${[7, 10, 13, 16].map(x => `<circle cx="${x + .5}" cy="12" r="1.6" ${f("#FFFDF6")}/>`).join("")}`, `<rect x="4" y="10" width="16" height="4" rx="2"/>${[7, 10, 13, 16].map(x => `<circle cx="${x + .5}" cy="12" r="1.6"/>`).join("")}`];
I.clawclip = [`<path d="M6 6c3 3 9 3 12 0v6c-3 3-9 3-12 0z" ${f("#A0623A")}/>`, `<path d="M6 6c3 3 9 3 12 0v6c-3 3-9 3-12 0zM8 12v6M11 13v6M13 13v6M16 12v6"/>`];
I.scrunchie = [`<ellipse cx="12" cy="12" rx="8" ry="7" ${f("#8E2C48")}/><ellipse cx="12" cy="12" rx="3.5" ry="3" ${f("#FFFDF6")}/>`, `<ellipse cx="12" cy="12" rx="8" ry="7"/><ellipse cx="12" cy="12" rx="3.5" ry="3"/><path d="M6 8l2 2M18 8l-2 2M6 16l2-2M18 16l-2-2" opacity=".6"/>`];
I.dinokey = [`<path d="M6 17c0-5 3-8 7-8 2-3 6-2 6 1 0 2-2 2-3 2 1 2 1 4 0 5z" ${f("#B8E8A0")}/>`, `<path d="M6 17c0-5 3-8 7-8 2-3 6-2 6 1 0 2-2 2-3 2 1 2 1 4 0 5zM6 17h11"/><circle cx="6" cy="5" r="2.5"/><path d="M6 7.5V10"/><circle cx="17" cy="9.5" r=".5"/>`];
I.luckycharm = [`<circle cx="12" cy="14" r="6" ${f("#FFFDF6")}/><path d="M7 10l1-4 3 3M17 10l-1-4-3 3" ${f("#FFFDF6")}/>`, `<circle cx="12" cy="14" r="6"/><path d="M7 10l1-4 3 3M17 10l-1-4-3 3M10 13h0M14 13h0M11 16q1 1 2 0"/><path d="M18 12l3-3" stroke="#E8574C" stroke-width="2"/>`];
I.cosysocks = [`<path d="M7 3h6v9l4 4c1.5 1.5 0 4-2 4h-4c-3 0-4-2-4-4z" ${f("#C3CDEE")}/>`, `<path d="M7 3h6v9l4 4c1.5 1.5 0 4-2 4h-4c-3 0-4-2-4-4zM7 6h6"/>`];
I.buckethat = [`<path d="M7 7c0-2 10-2 10 0l1.5 7h-13z" ${f("#3E6B8C")}/><path d="M3 14c3-1.5 15-1.5 18 0l-1 2.5c-4-1-12-1-16 0z" ${f("#3E6B8C")}/>`, `<path d="M7 7c0-2 10-2 10 0l1.5 7h-13zM3 14c3-1.5 15-1.5 18 0l-1 2.5c-4-1-12-1-16 0z"/>`];
I.dinotee = [`<path d="M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3c-1 2-7 2-8 0z" ${f("#7FB8E8")}/><path d="M9 15c1-3 4-4 6-2" ${f("#9CC27E")}/>`, `<path d="M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3c-1 2-7 2-8 0z"/>`];
I.tanghulu = [`${[6, 10, 14].map(y => `<circle cx="12" cy="${y}" r="3" ${f("#E8574C")}/>`).join("")}`, `<path d="M12 3v19"/>${[6, 10, 14].map(y => `<circle cx="12" cy="${y}" r="3"/>`).join("")}`];
I.eggwaffle = [`<path d="M5 5c6-2 12 1 14 6s-2 9-7 9-8-3-8-8 0-6 1-7z" ${f("#F3C969")}/>`, `<path d="M5 5c6-2 12 1 14 6s-2 9-7 9-8-3-8-8 0-6 1-7z"/>${[[8, 9], [12, 8], [15, 11], [9, 13], [13, 14], [11, 17]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join("")}`];
I.sugarcane = [`<path d="M7 6h10l-1.2 14H8.2z" ${f("#D8E8A8")}/>`, `<path d="M7 6h10l-1.2 14H8.2zM12 6l3-4"/><path d="M5 20l3-16M4 9h3M4 14h3" stroke="#7FA35A"/>`];
I.grassjelly = [`<path d="M7 7h10l-1.2 13H8.2z" ${f("#3A3230")}/><path d="M7.5 10h9" ${f("#FFFDF6")}/>`, `<path d="M7 7h10l-1.2 13H8.2zM6.5 7h11M13 7l2-5"/>`];
// gifts for Evan and Darren
I.icecream = [`<path d="M8.5 11h7L12 21z" ${f("#E8C48E")}/><circle cx="12" cy="8.5" r="4" ${f(C.blush)}/><circle cx="9.5" cy="10" r="2.4" ${f(C.paper)}/>`, `<path d="M8.5 11h7L12 21zM10 13.5l3.6 3M14 13.5l-3.4 3"/><path d="M8.2 10.6A4 4 0 1 1 15.8 10.6"/><circle cx="9.5" cy="10" r="2.4"/>`];
I.balloon = [`<ellipse cx="12" cy="9" rx="5.5" ry="6.5" ${f("#E8574C")}/>`, `<ellipse cx="12" cy="9" rx="5.5" ry="6.5"/><path d="M11 15.5h2l-1 1.5zM12 17c-1 1.5 1 2.5 0 5"/><path d="M9.5 6.5c.5-1.2 1.4-1.8 2.4-2" opacity=".6"/>`];
I.wand = [`<circle cx="15" cy="7" r="4" ${f("#D8ECF6")}/><circle cx="7" cy="6" r="2" ${f("#D8ECF6")}/>`, `<circle cx="15" cy="7" r="4"/><circle cx="15" cy="7" r="2.2"/><path d="M12.5 10l-6 10"/><circle cx="7" cy="6" r="2"/><circle cx="19.5" cy="14" r="1.3"/>`];
I.storybook = [`<path d="M3.5 6c3-1.5 5.5-1.5 8.5 0v13c-3-1.5-5.5-1.5-8.5 0z" ${f(C.sage)}/><path d="M12 6c3-1.5 5.5-1.5 8.5 0v13c-3-1.5-5.5-1.5-8.5 0z" ${f(C.butter)}/>`, `<path d="M3.5 6c3-1.5 5.5-1.5 8.5 0v13c-3-1.5-5.5-1.5-8.5 0zM12 6c3-1.5 5.5-1.5 8.5 0v13c-3-1.5-5.5-1.5-8.5 0z"/><circle cx="16.3" cy="10" r="1.6"/><path d="M6 10h3.5M6 13h3"/>`];
I.kopi = [`<path d="M5 9h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" ${f(C.paper)}/><path d="M6 11h9v1H6z" ${f("#8A5A3A")}/>`, `<path d="M5 9h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path class="smoke" d="M9 6.5q-1-1.5 0-3M12.5 6.5q-1-1.5 0-3" opacity=".7"/>`];
I.kaya = I.toast;
I.currypuff = [`<path d="M3.5 16c0-5 4-9 8.5-9s8.5 4 8.5 9z" ${f("#E8B36A")}/>`, `<path d="M3.5 16c0-5 4-9 8.5-9s8.5 4 8.5 9zM3.5 16h17"/><path d="M6 14l1-1.5 1 1.5 1-1.5 1 1.5 1-1.5 1 1.5 1-1.5 1 1.5 1-1.5 1 1.5 1-1.5 1 1.5"/>`];
I.sandpit = [`<rect x="3" y="12" width="18" height="8" rx="2" ${f("#F2DDA8")}/><path d="M14 9h4l-1 4h-2z" ${f(C.rose)}/>`, `<rect x="3" y="12" width="18" height="8" rx="2"/><path d="M3 14h18" opacity=".6"/><path d="M14 9h4l-1 4h-2zM16 9V5.5"/><path d="M6 17q2-2 4 0" opacity=".6"/>`];
I.truck = [`<rect x="3" y="9" width="10" height="7" rx="1" ${f(C.butter)}/><path d="M13 11h4l3 3v2h-7z" ${f(C.rose)}/>`, `<rect x="3" y="9" width="10" height="7" rx="1"/><path d="M13 11h4l3 3v2h-7zM15 11v3h4"/><circle cx="7" cy="17.5" r="2"/><circle cx="16.5" cy="17.5" r="2"/>`];
I.headphones = [`<rect x="3.5" y="12" width="4.5" height="7" rx="2" ${f(C.peri)}/><rect x="16" y="12" width="4.5" height="7" rx="2" ${f(C.peri)}/>`, `<path d="M5 13a7 7 0 0 1 14 0"/><rect x="3.5" y="12" width="4.5" height="7" rx="2"/><rect x="16" y="12" width="4.5" height="7" rx="2"/>`];
I.hammock = [`<path d="M5 10q7 7 14 0z" ${f(C.peach)}/>`, `<path d="M3 20V6M21 20V6M3 9l2 1M21 9l-2 1"/><path d="M5 10q7 7 14 0z"/><path d="M8 12.5l1-1.5M12 14l.5-2M16 12.5l-1-1.5" opacity=".6"/>`];
I.hearth = [`<path d="M12 3c1 3.5 5.5 5.5 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.5 1.2-3.8 2.3-5 .3 1.6 1 2.6 2 3 0-3.3.2-5.8 1.2-8.5z" ${f("#F6A23A")}/><path d="M12 13c.6 1.6 2.4 2.4 2.4 4.3a2.4 2.4 0 0 1-4.8 0c0-1.3.9-2.3 2.4-4.3z" ${f("#FFE08A")}/>`, `<path d="M12 3c1 3.5 5.5 5.5 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.5 1.2-3.8 2.3-5 .3 1.6 1 2.6 2 3 0-3.3.2-5.8 1.2-8.5z"/>`];
I.broom = [`<path d="M7 14l-3.5 6.5c2 .8 4.5.6 6.5-.4l1.5-4.4z" ${f(C.butter)}/>`, `<path d="M19.5 3.5L10 15"/><path d="M7 14l-3.5 6.5c2 .8 4.5.6 6.5-.4l1.5-4.4zM8 15.5l-2 4.4M9.8 16.4l-1.3 3.6M7 14l4 1.7"/>`];
I.fridge = [`<rect x="6" y="2.5" width="12" height="19" rx="2" ${f("#F4F1EA")}/><circle cx="14.5" cy="5.5" r="1.2" ${f(C.rose)}/>`, `<rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M6 9.5h12M8.5 5v2.5M8.5 12v4"/>`];
// animals at home base
I.chick = [`<circle cx="11" cy="15" r="6" ${f(C.butter)}/><circle cx="15" cy="9" r="4" ${f(C.butter)}/><path d="M18.8 8.6l2.6 1-2.6 1.2z" ${f(C.honey)}/>`,
  `<circle cx="11" cy="15" r="6"/><circle cx="15" cy="9" r="4"/><path d="M18.8 8.6l2.6 1-2.6 1.2zM9.5 21v2M12.5 21v2M7.5 14.5c1.2 1 2.6 1.3 4 1"/><circle cx="16" cy="8.4" r=".7"/>`];
I.hen = [`<path d="M4 9c-1.5 3-.5 6 1 7" ${f(C.paper)}/><ellipse cx="11" cy="14.5" rx="7" ry="5.5" ${f(C.paper)}/><circle cx="16.5" cy="7.5" r="3.5" ${f(C.paper)}/><path d="M14.5 4q1-2.5 2.5-1 1-2 2.5.5" ${f(C.rose)}/><path d="M19.8 7.2l2.4.8-2.4 1.2z" ${f(C.honey)}/>`,
  `<path d="M4 9c-1.5 3-.5 6 1 7"/><ellipse cx="11" cy="14.5" rx="7" ry="5.5"/><circle cx="16.5" cy="7.5" r="3.5"/><path d="M14.5 4q1-2.5 2.5-1 1-2 2.5.5M19.8 7.2l2.4.8-2.4 1.2zM9.5 20v2.5M12.5 20v2.5M7.5 13.5c1.5 1.4 3.5 1.6 5 .8"/><circle cx="17.3" cy="7" r=".7"/>`];
I.rabbit = [`<ellipse cx="10.5" cy="16" rx="7" ry="5" ${f("#B9A38C")}/><circle cx="16" cy="12.5" r="3.6" ${f("#B9A38C")}/><ellipse cx="14.5" cy="5.5" rx="1.4" ry="4" ${f("#B9A38C")}/><ellipse cx="17.5" cy="5.8" rx="1.4" ry="4" ${f("#B9A38C")}/><circle cx="3.8" cy="15" r="2" ${f(C.paper)}/>`,
  `<ellipse cx="10.5" cy="16" rx="7" ry="5"/><circle cx="16" cy="12.5" r="3.6"/><ellipse cx="14.5" cy="5.5" rx="1.4" ry="4"/><ellipse cx="17.5" cy="5.8" rx="1.4" ry="4"/><circle cx="3.8" cy="15" r="2"/><circle cx="17" cy="12" r=".7"/><path d="M19.4 13.4h.1"/>`];
I.chickfeed = [`<path d="M6 7h12l1 13H5z" ${f("#E8D3A6")}/><path d="M6 7l1.5-3h9L18 7z" ${f(C.honey)}/><circle cx="12" cy="14" r="3" ${f(C.butter)}/>`,
  `<path d="M6 7h12l1 13H5zM6 7l1.5-3h9L18 7"/><circle cx="12" cy="14" r="3"/><path d="M14.5 13.8l1.2.4-1.2.6"/>`];
I.rabbitfeed = [`<path d="M6 7h12l1 13H5z" ${f("#DCE8C8")}/><path d="M6 7l1.5-3h9L18 7z" ${f(C.sage)}/><ellipse cx="12" cy="15" rx="3.2" ry="2.4" ${f("#B9A38C")}/><ellipse cx="11" cy="11.2" rx=".8" ry="2" ${f("#B9A38C")}/><ellipse cx="13" cy="11.2" rx=".8" ry="2" ${f("#B9A38C")}/>`,
  `<path d="M6 7h12l1 13H5zM6 7l1.5-3h9L18 7"/><ellipse cx="12" cy="15" rx="3.2" ry="2.4"/><ellipse cx="11" cy="11.2" rx=".8" ry="2"/><ellipse cx="13" cy="11.2" rx=".8" ry="2"/>`];
// kitchen goods: new crops, Hana's deli shelf, the goat and her milk
I.tomato = [`<circle cx="12" cy="14" r="7" ${f("#E8574C")}/><path d="M9 7.5l3 1.5l3-1.5l-1 2.5l2.5 .5l-4.5 1l-4.5-1l2.5-.5z" ${f(C.moss)}/>`, `<circle cx="12" cy="14" r="7"/><path d="M9 7.5l3 1.5l3-1.5l-1 2.5l2.5 .5l-4.5 1l-4.5-1l2.5-.5z M12 9V6"/><path d="M8.5 13a3.5 3.5 0 0 1 2-2.5" opacity=".6"/>`];
I.potato = [`<path d="M5 13c0-4 3.5-7 8-7s6 3 6 6.5-3 6.5-7.5 6.5S5 17 5 13z" ${f("#C9A27E")}/>`, `<path d="M5 13c0-4 3.5-7 8-7s6 3 6 6.5-3 6.5-7.5 6.5S5 17 5 13z"/><circle cx="10" cy="11" r=".7"/><circle cx="14.5" cy="14" r=".7"/><circle cx="11" cy="16" r=".7"/>`];
I.pepper = [`<path d="M8 8c3-1.5 9-1 9.5 3S14 20 10 20.5 5 17 5.5 13 6 9 8 8z" ${f("#D9433A")}/><path d="M11 7.5c0-2 1-3.5 3-4" ${f("none")}/>`, `<path d="M8 8c3-1.5 9-1 9.5 3S14 20 10 20.5 5 17 5.5 13 6 9 8 8z"/><path d="M11 7.5c0-2 1-3.5 3-4"/><path d="M8 12c0 2 .5 4 1.5 5.5" opacity=".6"/>`];
I.pea = [`<path d="M4 15c3-6 12-9 16-7c-1 5-9 10-16 7z" ${f(C.moss)}/><circle cx="9" cy="13" r="1.8" ${f("#B9D88A")}/><circle cx="12.5" cy="11.5" r="1.8" ${f("#B9D88A")}/><circle cx="16" cy="10.2" r="1.8" ${f("#B9D88A")}/>`, `<path d="M4 15c3-6 12-9 16-7c-1 5-9 10-16 7z"/><path d="M20 8c1-1.5 1-3 0-4.5"/>`];
I.pumpkin = [`<path d="M12 7c5 0 9 3 9 7s-4 7-9 7-9-3-9-7 4-7 9-7z" ${f("#F08A3C")}/><path d="M11 7c0-2 1-3.5 3-4" ${f("none")}/>`, `<path d="M12 7c5 0 9 3 9 7s-4 7-9 7-9-3-9-7 4-7 9-7z"/><path d="M12 7c-2.5 3-2.5 11 0 14M12 7c2.5 3 2.5 11 0 14M7.5 8.5c-2 3-2 8 0 11M16.5 8.5c2 3 2 8 0 11" opacity=".55"/><path d="M11 7c0-2 1-3.5 3-4"/>`];
I.leek = [`<path d="M10 21V11h4v10z" ${f("#F4EEE3")}/><path d="M10 11C8 7 6 4 4 2c3 1 6 4 7 7M14 11c2-4 4-7 6-9c-3 1-6 4-7 7M12 10V3" ${f("#7FA35A")}/>`, `<path d="M10 21V11h4v10z"/><path d="M10 11C8 7 6 4 4 2c3 1 6 4 7 7M14 11c2-4 4-7 6-9c-3 1-6 4-7 7M12 10V3"/><path d="M10 21h4" />`];
I.flour = [`<path d="M6 8h12l1.5 12h-15z" ${f("#F4EEE3")}/><path d="M7 8l1-3h8l1 3z" ${f("#E8D3A6")}/><path d="M9 13.5l3 3 3-3" ${f("none")}/>`, `<path d="M6 8h12l1.5 12h-15z M7 8l1-3h8l1 3"/><path d="M9.5 12.5q2.5-2.5 5 0" opacity=".7"/><path d="M12 12v5" opacity=".7"/>`];
I.cheese = [`<path d="M3 15l10-8l8 5v6H3z" ${f("#F3C969")}/><path d="M3 15h18" ${f("none")}/>`, `<path d="M3 15l10-8l8 5v6H3z M3 15h18"/><circle cx="8" cy="17.5" r="1"/><circle cx="15" cy="17" r="1.2"/><circle cx="13" cy="12.5" r=".9"/>`];
I.olives = [`<path d="M7 7h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" ${f("#E3F0F5")}/><rect x="6.5" y="4" width="11" height="3" rx="1" ${f(C.moss2)}/><ellipse cx="10" cy="15" rx="2" ry="1.6" ${f("#7FA35A")}/><ellipse cx="14" cy="13" rx="2" ry="1.6" ${f("#7FA35A")}/><ellipse cx="12.5" cy="17.5" rx="2" ry="1.6" ${f("#5E7A4E")}/>`, `<path d="M7 7h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><rect x="6.5" y="4" width="11" height="3" rx="1"/>`];
I.milk = [`<path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z" ${f("#FFFDF6")}/><rect x="8.5" y="2" width="7" height="2.5" rx=".8" ${f(C.sky)}/><path d="M7 12h10v5H7z" ${f("#E3EEF5")}/>`, `<path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z"/><rect x="8.5" y="2" width="7" height="2.5" rx=".8"/>`];
I.goat = [`<ellipse cx="10" cy="14" rx="7" ry="4.5" ${f("#F4EEE3")}/><path d="M15 11c1-4 4-5 6-3s0 5-3 5z" ${f("#F4EEE3")}/>`, `<ellipse cx="10" cy="14" rx="7" ry="4.5"/><path d="M15 11c1-4 4-5 6-3s0 5-3 5z"/><path d="M17 8c-.5-2.5-2-3.5-3.5-3.5M19.5 7.5c.5-2.5 2-3 3-3"/><path d="M6 18v3M9 18.5v2.5M12 18.5v2.5M15 18v3M3 13c-1-1-1-2.5 0-3"/><circle cx="19" cy="9.5" r=".6"/>`];
I.goatfeed = [`<path d="M6 7h12l1 13H5z" ${f("#D9C79A")}/><path d="M6 7l1.5-3h9L18 7z" ${f(C.sage)}/><path d="M9 15q3-4 6 0q-3 3-6 0z" ${f(C.moss)}/>`, `<path d="M6 7h12l1 13H5z M6 7l1.5-3h9L18 7"/><path d="M9 15q3-4 6 0q-3 3-6 0z"/>`];
I.loaf = [`<path d="M4 15c0-5 3.5-8 8-8s8 3 8 8v3H4z" ${f("#D9A066")}/>`, `<path d="M4 15c0-5 3.5-8 8-8s8 3 8 8v3H4z"/><path d="M8 10l1.5 3M12 9l.5 3.5M16 10l-1.5 3"/>`];
I.goatmilk = [`<path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z" ${f("#FFFDF6")}/><rect x="8.5" y="2" width="7" height="2.5" rx=".8" ${f("#9CC27E")}/><path d="M7 12h10v5H7z" ${f("#E3EED2")}/>`, `<path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z"/><rect x="8.5" y="2" width="7" height="2.5" rx=".8"/><path d="M7 12h10M7 17h10"/><path d="M10 14.5q2-1.5 4 0" opacity=".6"/>`];
I.yoghurt = [`<path d="M6 9h12l-1.5 10a2 2 0 0 1-2 1.7h-5a2 2 0 0 1-2-1.7z" ${f("#FFFDF6")}/><rect x="5.5" y="6.5" width="13" height="3" rx="1" ${f("#9FD3E8")}/>`, `<path d="M6 9h12l-1.5 10a2 2 0 0 1-2 1.7h-5a2 2 0 0 1-2-1.7z"/><rect x="5.5" y="6.5" width="13" height="3" rx="1"/><path d="M8.5 13h7" opacity=".5"/>`];
{ const wedge = c => [`<path d="M3 17l15-9 3 2v7z" ${f(c)}/><circle cx="12" cy="15" r="1.2" ${f("#FFFDF6")}/>`, `<path d="M3 17l15-9 3 2v7zM3 17h18M18 8v9"/><circle cx="12" cy="15" r="1.2"/>`];
  I.chz_cheddar = wedge("#F3C969"); I.chz_blue = wedge("#DCE3E8"); I.chz_brie = wedge("#FFF6E0"); I.chz_smoked = wedge("#D9944A");
  I.chz_halloumi = [`<rect x="4" y="9" width="16" height="9" rx="2" ${f("#F6F1E8")}/>`, `<rect x="4" y="9" width="16" height="9" rx="2"/><path d="M7 12h10M7 15h10" opacity=".35"/>`];
  I.chz_fresh = [`<rect x="4" y="9" width="16" height="9" rx="4.5" ${f("#FFF8EC")}/>`, `<rect x="4" y="9" width="16" height="9" rx="4.5"/><path d="M8 11v5M12 11v5M16 11v5" opacity=".35"/>`];
  // an excellent cut: the same, with a little gold star
  ["chz_fresh", "chz_cheddar", "chz_blue", "chz_brie", "chz_halloumi", "chz_smoked"].forEach(k => { I[k + "_ex"] = [I[k][0] + `<path d="M18 3l1 2.2 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" ${f("#F3C33A")}/>`, I[k][1]]; }); }
// fishing catches: a fish in its own colours (body, fin), plus squid, octopus, crayfish, the koi, a boot and sea glass
{ const fsh = (a, b) => [`<path d="M3 12c3-4.5 9-5.5 13-2l4-3v10l-4-3c-4 3.5-10 2.5-13-2z" ${f(a)}/><path d="M9 8.4q2-2.6 4-.6" ${f(b)}/>`, `<path d="M3 12c3-4.5 9-5.5 13-2l4-3v10l-4-3c-4 3.5-10 2.5-13-2z"/><circle cx="6.8" cy="11" r=".8"/><path d="M10 9.6q1.5 2.4 0 4.8" opacity=".6"/>`];
  I.trout = fsh("#C9D6B8", "#E8899A"); I.sardine = fsh("#BFD3E2", "#8FA9BF"); I.mackerel = fsh("#9FC0C8", "#3E6B8C"); I.seabream = fsh("#E3D6CF", "#D9A93A"); I.koi = fsh("#F3B23A", "#FFFDF6");
  I.squid = [`<path d="M12 2c3 2 4 6 3 10H9c-1-4 0-8 3-10z" ${f("#F4C7CF")}/><path d="M9 12l-2 9M11 12l-.5 9M13 12l.5 9M15 12l2 9" ${f("none")}/>`, `<path d="M12 2c3 2 4 6 3 10H9c-1-4 0-8 3-10zM9 12l-2 9M11 12l-.5 9M13 12l.5 9M15 12l2 9"/><circle cx="11" cy="9" r=".7"/><circle cx="13" cy="9" r=".7"/>`];
  I.octopus = [`<path d="M6 11a6 6 0 0 1 12 0v2H6z" ${f("#E8899A")}/><path d="M6 13q-2 4-4 4M9 13q-1 5-3 7M12 13v7M15 13q1 5 3 7M18 13q2 4 4 4" ${f("none")}/>`, `<path d="M6 11a6 6 0 0 1 12 0v2H6zM6 13q-2 4-4 4M9 13q-1 5-3 7M12 13v7M15 13q1 5 3 7M18 13q2 4 4 4"/><circle cx="10" cy="10" r=".8"/><circle cx="14" cy="10" r=".8"/>`];
  I.crayfish = [`<path d="M8 9h8v7a4 4 0 0 1-8 0z" ${f("#D9614C")}/><path d="M8 10L4 6l2-2 3 4M16 10l4-4-2-2-3 4" ${f("#D9614C")}/>`, `<path d="M8 9h8v7a4 4 0 0 1-8 0zM8 10L4 6l2-2 3 4M16 10l4-4-2-2-3 4M9 13h6M9 16h6M10 20l-1 2M14 20l1 2"/>`];
  I.boot = [`<path d="M8 3h6v11l6 3v4H8z" ${f("#5E8A5A")}/>`, `<path d="M8 3h6v11l6 3v4H8zM8 18h12M8 6h6"/>`];
  I.seaglass = [`<path d="M6 10l5-5 7 3 1 7-6 5-6-3z" ${f("#9FD3C0")}/>`, `<path d="M6 10l5-5 7 3 1 7-6 5-6-3z"/><path d="M10 9l3 1" opacity=".6"/>`];
  I.syrup = [`<path d="M10 3h4v4l2 3v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10l2-3z" ${f("#F4B8C8")}/><path d="M8 13h8v5H8z" ${f("#FFFDF6")}/>`, `<path d="M10 3h4v4l2 3v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10l2-3zM8 13h8M8 18h8"/><circle cx="12" cy="15.5" r="1.2"/>`];
  I.rod = [`<path d="M4 21L19 4" ${f("none")}/><circle cx="7" cy="17" r="2.2" ${f("#F3C969")}/>`, `<path d="M4 21L19 4M19 4v9"/><circle cx="7" cy="17" r="2.2"/><circle cx="19" cy="14" r="1.4"/>`]; }
I.egg = [`<path d="M12 3c3.5 0 6 6 6 10a6 6 0 0 1-12 0c0-4 2.5-10 6-10z" ${f("#F6EBDD")}/>`, `<path d="M12 3c3.5 0 6 6 6 10a6 6 0 0 1-12 0c0-4 2.5-10 6-10z"/><path d="M9 12c0-2 .8-3.6 1.8-4.5" opacity=".6"/>`];
I.coop = [`<path d="M3 11l9-7 9 7z" ${f(C.rose)}/><rect x="5" y="11" width="14" height="9" ${f(C.butter)}/><rect x="10" y="14" width="4" height="6" ${f(C.wood)}/>`,
  `<path d="M3 11l9-7 9 7"/><rect x="5" y="11" width="14" height="9"/><rect x="10" y="14" width="4" height="6"/><path d="M14 20l5 2.5"/>`];
I.dog = [`<ellipse cx="10" cy="15" rx="7" ry="4.5" ${f("#E3B07A")}/><circle cx="17" cy="10" r="4" ${f("#E3B07A")}/><path d="M14.5 7.5c-1.5 0-2.5 2-2 4.5 1.2-.3 2-1.5 2-4.5z" ${f("#A9744A")}/>`,
  `<ellipse cx="10" cy="15" rx="7" ry="4.5"/><circle cx="17" cy="10" r="4"/><path d="M14.5 7.5c-1.5 0-2.5 2-2 4.5 1.2-.3 2-1.5 2-4.5zM3.5 13c-1.5-1-2-2.5-1.5-4M6 19v2.5M13 19v2.5"/><circle cx="18" cy="9.4" r=".7"/><path d="M21 11h.1"/>`];
// Mel's room and things she wears
I.mirror = [`<ellipse cx="12" cy="10" rx="6.5" ry="7.5" ${f("#DCE8F4")}/><rect x="5" y="18" width="14" height="3" rx="1" ${f(C.wood)}/>`, `<ellipse cx="12" cy="10" rx="6.5" ry="7.5"/><path d="M12 17.5v1M5 18h14v3H5zM9.5 7.5l3-3" />`];
I.throw = [`<path d="M4 6h16v13H4z" ${f(C.blush)}/>`, `<path d="M4 6h16v13H4zM8 6v13M12 6v13M16 6v13M4 19l-1 2M8 19l-1 2M12 19l-1 2M16 19l-1 2M20 19l-1 2"/>`];
I.candle = [`<rect x="9" y="10" width="6" height="11" rx="1.5" ${f(C.paper)}/><path d="M12 9c-2-2.5-1.5-4.5 0-6.5 1.5 2 2 4 0 6.5z" ${f("#F6A23A")}/>`, `<rect x="9" y="10" width="6" height="11" rx="1.5"/><path d="M12 9c-2-2.5-1.5-4.5 0-6.5 1.5 2 2 4 0 6.5zM12 10v-1"/>`];
I.bow = [`<path d="M12 12L4 7v10zM12 12l8-5v10z" ${f("#8E2C48")}/><circle cx="12" cy="12" r="2.4" ${f("#6E1F36")}/>`, `<path d="M12 12L4 7v10zM12 12l8-5v10z"/><circle cx="12" cy="12" r="2.4"/>`];
I.scarf = [`<path d="M5 6c4 3 10 3 14 0l-1 4c-4 2-8 2-12 0z" ${f(C.peri2)}/><path d="M13 10l3 10-3-1-2 2 0-11z" ${f(C.peri2)}/>`, `<path d="M5 6c4 3 10 3 14 0l-1 4c-4 2-8 2-12 0zM13 10l3 10-3-1-2 2 0-11z"/>`];
I.sunhat = [`<ellipse cx="12" cy="15" rx="10" ry="3.5" ${f("#F3DFA6")}/><path d="M7 15c0-7 10-7 10 0z" ${f("#F3DFA6")}/>`, `<ellipse cx="12" cy="15" rx="10" ry="3.5"/><path d="M7 15c0-7 10-7 10 0z"/><path d="M7 13.5h10" stroke-width="2" style="stroke:#8E2C48"/>`];
I.pyjamas = [`<path d="M6 4h12l2 6-3 1v10H7V11l-3-1z" ${f("#3B4A86")}/>`, `<path d="M6 4h12l2 6-3 1v10H7V11l-3-1zM12 5v16M10 4l2 3 2-3"/><circle cx="12" cy="10" r=".6"/><circle cx="12" cy="14" r=".6"/>`];
I.base = I.sprout;   // quests outdoors at home base
// Gifts for Ma Ma and Gong Gong: nyonya kueh, a mooncake, bird's nest, chicken essence
I.kuehlapis = [`<rect x="5" y="8" width="14" height="11" rx="1.5" ${f("#E8566C")}/>${[10.5, 13, 15.5].map(y => `<rect x="5" y="${y}" width="14" height="1.3" ${f("#F6E3C6")}/>`).join("")}`, `<rect x="5" y="8" width="14" height="11" rx="1.5"/><path d="M5 10.5h14M5 13h14M5 15.5h14" opacity=".5"/>`];
I.ondeh = [`<circle cx="8" cy="14" r="4" ${f("#7FB069")}/><circle cx="16" cy="14" r="4" ${f("#7FB069")}/><circle cx="12" cy="8.5" r="4" ${f("#7FB069")}/>${[[7, 13], [15, 13], [11, 7.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".7" ${f(C.paper)}/>`).join("")}`, `<circle cx="8" cy="14" r="4"/><circle cx="16" cy="14" r="4"/><circle cx="12" cy="8.5" r="4"/>`];
I.angku = [`<path d="M4 13c0-4 4-7 8-7s8 3 8 7-4 6-8 6-8-2-8-6z" ${f("#E8434E")}/><path d="M4 18h16" ${f("none")}/>`, `<path d="M4 13c0-4 4-7 8-7s8 3 8 7-4 6-8 6-8-2-8-6z"/><path d="M8 12q4-3 8 0M9 15q3 2 6 0" opacity=".6"/><path d="M3 19.5h18"/>`];
I.mooncake = [`<circle cx="12" cy="12.5" r="8" ${f("#C98A4A")}/><circle cx="12" cy="12.5" r="5" ${f("#E3B06A")}/>`, `<circle cx="12" cy="12.5" r="8"/><circle cx="12" cy="12.5" r="5"/><path d="M12 9.5v6M9 12.5h6M10 10.5l4 4M14 10.5l-4 4" opacity=".55"/>`];
I.birdsnest = [`<path d="M6 9h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" ${f("#F6EFE3")}/><rect x="5" y="5" width="14" height="4" rx="1.5" ${f("#C2505F")}/>`, `<path d="M6 9h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><rect x="5" y="5" width="14" height="4" rx="1.5"/><path d="M9 14q3 2 6 0" opacity=".6"/>`];
// Sunday market specials: honey and bee things, handmade soap, craft beer
I.honey = [`<path d="M7 8h10v10a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z" ${f(C.honey)}/><rect x="6.5" y="4.5" width="11" height="3.5" rx="1" ${f("#E8D3A6")}/><rect x="8.5" y="11.5" width="7" height="5" rx="1" ${f(C.paper)}/>`, `<path d="M7 8h10v10a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"/><rect x="6.5" y="4.5" width="11" height="3.5" rx="1"/><rect x="8.5" y="11.5" width="7" height="5" rx="1"/><path d="M10 14h4" opacity=".6"/>`];
I.honey_cream = [I.honey[0].replace(/fill:[^"]*"/, 'fill:#F6E6B8"'), I.honey[1]];
I.honey_lav = [I.honey[0].replace(/fill:[^"]*"/, 'fill:#C9A8E0"'), I.honey[1]]; I.honey_blossom = [I.honey[0].replace(/fill:[^"]*"/, 'fill:#F6D98A"'), I.honey[1]];
I.honeycomb = [`<path d="M3 8h18v10H3z" ${f("#F3C33A")}/>`, `<path d="M3 8h18v10H3z"/><path d="M6 10.5l2 -1.2 2 1.2v2.4l-2 1.2-2-1.2zM10 10.5l2-1.2 2 1.2v2.4l-2 1.2-2-1.2zM14 10.5l2-1.2 2 1.2v2.4l-2 1.2-2-1.2zM8 13.9v2.4l2 1.2 2-1.2v-2.4M12 16.3l2 1.2 2-1.2v-2.4"/><path d="M17 18c0 1.5 .5 2.5 1 3" opacity=".7"/>`];
I.beecandle = [`<rect x="8.5" y="9" width="7" height="12" rx="1" ${f("#F3D98A")}/><path d="M12 3.5c1.6 1.8 2 3 2 4a2 2 0 0 1-4 0c0-1 .4-2.2 2-4z" ${f("#F08A3C")}/>`, `<rect x="8.5" y="9" width="7" height="12" rx="1"/><path d="M12 3.5c1.6 1.8 2 3 2 4a2 2 0 0 1-4 0c0-1 .4-2.2 2-4zM12 9.5v-1M8.5 12.5h7M8.5 16h7" /><path d="M10 12.5v3.5M13 12.5v3.5M11.5 16v5" opacity=".5"/>`];
const soap = c => [`<rect x="3.5" y="8" width="17" height="10" rx="3" ${f(c)}/><path d="M7 4.5q1.5 -1.5 3 0M15 3.5q1.5 -1.5 3 0" ${f("none")}/>`, `<rect x="3.5" y="8" width="17" height="10" rx="3"/><path d="M7 13h10" opacity=".6"/><circle cx="8" cy="5" r="1.4"/><circle cx="16.5" cy="4.2" r="1"/>`];
I.soap_lav = soap("#C9A3E0"); I.soap_rose = soap("#F2A0B8");
I.soap_duck = [`<path d="M5 14c0-3 2.5-4.5 5-4.5h1c-1-1-1.5-2-1.5-3a3 3 0 0 1 6 0c0 1-.5 2-1 2.5 2.5 .5 5 2 5 5 0 3.5-3 5.5-7 5.5S5 17.5 5 14z" ${f("#F3D34A")}/><path d="M15.5 6.5l3 .6-3 1z" ${f("#F08A3C")}/>`, `<path d="M5 14c0-3 2.5-4.5 5-4.5h1c-1-1-1.5-2-1.5-3a3 3 0 0 1 6 0c0 1-.5 2-1 2.5 2.5 .5 5 2 5 5 0 3.5-3 5.5-7 5.5S5 17.5 5 14z"/><circle cx="13.5" cy="6.2" r=".8"/><path d="M15.5 6.5l3 .6-3 1zM9 14q3 2 6 0" />`];
I.scrub = [`<path d="M5 10h14v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" ${f("#FFF6E8")}/><rect x="4.5" y="6.5" width="15" height="3.5" rx="1" ${f("#9CC27E")}/><circle cx="9" cy="15" r="1" ${f(C.rose)}/><circle cx="13" cy="17" r="1" ${f(C.rose)}/><circle cx="15" cy="13.5" r="1" ${f(C.rose)}/>`, `<path d="M5 10h14v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><rect x="4.5" y="6.5" width="15" height="3.5" rx="1"/>`];
const beer = c => [`<path d="M9.5 9.5V6.5h5v3c1.5 1 2 2 2 3.5V20a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7c0-1.5.5-2.5 2-3.5z" ${f(c)}/><rect x="10" y="3" width="4" height="3.5" rx=".8" ${f(C.honey)}/><rect x="8" y="13" width="8" height="5" rx="1" ${f(C.paper)}/>`, `<path d="M9.5 9.5V6.5h5v3c1.5 1 2 2 2 3.5V20a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1v-7c0-1.5.5-2.5 2-3.5z"/><rect x="10" y="3" width="4" height="3.5" rx=".8"/><rect x="8" y="13" width="8" height="5" rx="1"/><path d="M10 15.5h4" opacity=".6"/>`];
I.paleale = beer("#D9A441"); I.stout = beer("#4A3226");
I.essence = [`<path d="M9 7h6v3c2 1 2.5 3 2.5 5v4a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-4c0-2 .5-4 2.5-5z" ${f("#8C4A2E")}/><rect x="8.5" y="4" width="7" height="3" rx="1" ${f("#F3C969")}/><rect x="7.5" y="13" width="9" height="5" ${f("#F3C969")}/>`, `<path d="M9 7h6v3c2 1 2.5 3 2.5 5v4a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-4c0-2 .5-4 2.5-5z"/><rect x="8.5" y="4" width="7" height="3" rx="1"/><rect x="7.5" y="13" width="9" height="5"/>`];
I.bakkwa = [`<rect x="4" y="7" width="16" height="11" rx="2" ${f("#A8432E")}/><path d="M6 9.5c3 1 6-1 9 0s3 1 3 1" ${f("none")}/>`, `<rect x="4" y="7" width="16" height="11" rx="2"/><path d="M6 10c3 1.2 6-1 9 0M6 14c3 1.2 6-1 9 0" opacity=".5"/>`];
I.pineappletarts = [`<circle cx="8" cy="14" r="4.2" ${f("#E9C27A")}/><circle cx="16" cy="14" r="4.2" ${f("#E9C27A")}/><circle cx="12" cy="8.5" r="4.2" ${f("#E9C27A")}/>${[[8, 13], [16, 13], [12, 7.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" ${f("#E3A23A")}/>`).join("")}`, `<circle cx="8" cy="14" r="4.2"/><circle cx="16" cy="14" r="4.2"/><circle cx="12" cy="8.5" r="4.2"/>`];
I.bakchang = [`<path d="M12 4l8 15H4z" ${f("#8DB86B")}/>`, `<path d="M12 4l8 15H4z"/><path d="M5.5 16l13 0M8 11l9 5" opacity=".6"/><path d="M12 4v-1.5"/>`];
I.logcake = [`<rect x="4" y="9" width="16" height="9" rx="4.5" ${f("#6E4430")}/><circle cx="18" cy="13.5" r="3.6" ${f("#E3C8A0")}/><path d="M9 9l1.5-3 1.5 3z" ${f("#7FA35A")}/><circle cx="10.5" cy="5.5" r="1" ${f("#D9433A")}/>`, `<rect x="4" y="9" width="16" height="9" rx="4.5"/><circle cx="18" cy="13.5" r="3.6"/><circle cx="18" cy="13.5" r="1.6" opacity=".5"/><path d="M6 12h8M7 15h6" opacity=".5"/>`];
// Orchard fruit, and the flower farm's bouquets and potted flowers, drawn from their colours (data/orchard.js)
{
  const leaf = `<path d="M12.3 7c.5-2 2-3 4-3-.5 2-2 3-4 3z" ${f(C.moss)}/>`, leafL = `<path d="M12.3 7c.5-2 2-3 4-3-.5 2-2 3-4 3z"/>`;
  const round = (col) => [`<circle cx="12" cy="13.5" r="6.8" ${f(col)}/>${leaf}`, `<circle cx="12" cy="13.5" r="6.8"/><path d="M12 7v-1.5"/>${leafL}<path d="M8.6 11.5c.4-1 1.2-1.8 2.2-2.1" opacity=".6"/>`];
  const shapes = {
    cherry: (c) => [`<circle cx="8" cy="16" r="4" ${f(c)}/><circle cx="16" cy="16.5" r="4" ${f(c)}/><path d="M13 4c2 0 4 1 4.5 2.5-1.5.5-3.5 0-4.5-2.5z" ${f(C.moss)}/>`, `<circle cx="8" cy="16" r="4"/><circle cx="16" cy="16.5" r="4"/><path d="M8 12c1-4 3-7 5-8M16 12.5c-.5-4-1.5-6.5-3-8.5M13 4c2 0 4 1 4.5 2.5-1.5.5-3.5 0-4.5-2.5z"/>`],
    lemon: (c) => [`<ellipse cx="12" cy="13" rx="8" ry="5.6" ${f(c)}/>`, `<ellipse cx="12" cy="13" rx="8" ry="5.6"/><path d="M4 13l-1.5-.6M20 13l1.5-.6M8 11c.8-.8 1.8-1.2 3-1.3" opacity=".6"/>`],
    mango: (c) => [`<path d="M6 15c0-6 5-9 9-8s4 6 1 10-10 4-10-2z" ${f(c)}/><path d="M14.5 7c1-1.5 2.5-2.3 4-2.2-.8 1.5-2.3 2.3-4 2.2z" ${f(C.moss)}/>`, `<path d="M6 15c0-6 5-9 9-8s4 6 1 10-10 4-10-2zM14.5 7c1-1.5 2.5-2.3 4-2.2-.8 1.5-2.3 2.3-4 2.2z"/>`],
    pear: (c) => [`<path d="M12 6c-2 0-2.5 3-3.5 5-1.5 2.5-3 4-3 6.5C5.5 20 8.5 21 12 21s6.5-1 6.5-3.5c0-2.5-1.5-4-3-6.5C14.5 9 14 6 12 6z" ${f(c)}/>${leaf}`, `<path d="M12 6c-2 0-2.5 3-3.5 5-1.5 2.5-3 4-3 6.5C5.5 20 8.5 21 12 21s6.5-1 6.5-3.5c0-2.5-1.5-4-3-6.5C14.5 9 14 6 12 6zM12 6V4.5"/>${leafL}`],
    fig: (c) => [`<path d="M12 5c-1 2-6 5-6 10a6 6 0 0 0 12 0c0-5-5-8-6-10z" ${f(c)}/>`, `<path d="M12 5c-1 2-6 5-6 10a6 6 0 0 0 12 0c0-5-5-8-6-10zM12 5V3.5"/><path d="M10 17c1 .6 2.4.6 3.4 0" opacity=".6"/>`]
  };
  Object.values(TREES).forEach(t => { if (I[t.fruit]) return; I[t.fruit] = (shapes[t.fruit] || round)(t.col); });
  Object.keys(FLOWERS).forEach(id => { const c = FLOWERS[id].col;
    const head = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" ${f(c)}/><circle cx="${x}" cy="${y}" r="${r*.38}" ${f(C.butter)}/>`, headL = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
    I["bq_" + id] = [`<path d="M8 13l4 9 4-9z" ${f("#F4EEE3")}/>${head(8.5, 8.5, 3)}${head(15.5, 8.5, 3)}${head(12, 5.5, 3)}<path d="M9.5 15.5h5" stroke-width="2" style="stroke:var(--rose)"/>`,
      `<path d="M8 13l4 9 4-9z"/>${headL(8.5, 8.5, 3)}${headL(15.5, 8.5, 3)}${headL(12, 5.5, 3)}<path d="M10 11.5l2 2.5 2-2.5"/>`];
    I["pot_" + id] = [`<path d="M7 14h10l-1.5 7h-7z" ${f("#C46A4A")}/><path d="M9.5 13.5c0-2 1-3.5 2.5-4.5M14.5 13.5c0-2-1-3.5-2.5-4.5" ${f("none")}/>${head(8.5, 9.5, 2.6)}${head(15.5, 9.5, 2.6)}${head(12, 6, 2.8)}`,
      `<path d="M7 14h10l-1.5 7h-7zM6.5 14h11"/>${headL(8.5, 9.5, 2.6)}${headL(15.5, 9.5, 2.6)}${headL(12, 6, 2.8)}<path d="M12 9v5"/>`]; });
}

// The market stalls' extra goods (data/stall-goods.js): each names a shape and its colours, drawn here
{
  const S = {
    wedge: (a) => [`<path d="M3 17l15-9 3 2v7z" ${f(a)}/><circle cx="12" cy="15" r="1.2" ${f("#FFFDF6")}/>`, `<path d="M3 17l15-9 3 2v7zM3 17h18M18 8v9"/><circle cx="12" cy="15" r="1.2"/>`],
    jar: (a, b = "#E8D3A6") => [`<path d="M7 9h10v9a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z" ${f(a)}/><rect x="6.5" y="5" width="11" height="4" rx="1" ${f(b)}/>`, `<path d="M7 9h10v9a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z"/><rect x="6.5" y="5" width="11" height="4" rx="1"/><rect x="9" y="12" width="6" height="4" rx="1"/>`],
    box: (a, b = "#E8566C") => [`<rect x="4" y="8" width="16" height="11" rx="1.5" ${f(a)}/><rect x="4" y="8" width="16" height="3" ${f(b)}/>`, `<rect x="4" y="8" width="16" height="11" rx="1.5"/><path d="M4 11h16M12 8v11"/>`],
    wheel: (a, b = "#9CC27E") => [`<ellipse cx="12" cy="14" rx="8" ry="4.5" ${f(a)}/><path d="M4 12v2M20 12v2" ${f("none")}/><circle cx="9" cy="12" r="1" ${f(b)}/><circle cx="14" cy="11.5" r="1" ${f(b)}/>`, `<ellipse cx="12" cy="11.5" rx="8" ry="4.5"/><path d="M4 11.5v3c0 2.5 3.6 4.5 8 4.5s8-2 8-4.5v-3"/>`],
    sticks: (a) => [`${[7, 11, 15].map((x, i) => `<rect x="${x}" y="${4 + i}" width="2.4" height="15" rx="1.2" ${f(a)}/>`).join("")}`, `${[7, 11, 15].map((x, i) => `<rect x="${x}" y="${4 + i}" width="2.4" height="15" rx="1.2"/>`).join("")}`],
    tube: (a) => [`<rect x="8.5" y="7" width="7" height="13" rx="2" ${f(a)}/><rect x="9.5" y="3.5" width="5" height="4" rx="1" ${f("#FFFDF6")}/>`, `<rect x="8.5" y="7" width="7" height="13" rx="2"/><rect x="9.5" y="3.5" width="5" height="4" rx="1"/><path d="M10.5 11h3"/>`],
    cloth: (a, b = "#E8566C") => [`<rect x="4" y="6" width="16" height="12" rx="1" ${f(a)}/><circle cx="9" cy="10" r="1.5" ${f(b)}/><circle cx="15" cy="14" r="1.5" ${f(b)}/>`, `<rect x="4" y="6" width="16" height="12" rx="1"/><path d="M4 9h16" opacity=".5"/>`],
    bottle: (a) => [`<path d="M10 3h4v4c2 1 3 2.5 3 4.5V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8.5c0-2 1-3.5 3-4.5z" ${f(a)}/><rect x="8.5" y="13" width="7" height="4" ${f("#FFFDF6")}/>`, `<path d="M10 3h4v4c2 1 3 2.5 3 4.5V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-8.5c0-2 1-3.5 3-4.5z"/><rect x="8.5" y="13" width="7" height="4"/>`],
    soap: (a) => [`<rect x="3.5" y="8" width="17" height="10" rx="3" ${f(a)}/>`, `<rect x="3.5" y="8" width="17" height="10" rx="3"/><path d="M7 4.5q1.5-1.5 3 0M14 3.5q1.5-1.5 3 0"/>`],
    ball: (a, b = "#FFFDF6") => [`<circle cx="12" cy="13" r="7.5" ${f(a)}/><path d="M7 11c3 2 7 2 10 0" ${f("none")}/><circle cx="9.5" cy="10" r="1.2" ${f(b)}/>`, `<circle cx="12" cy="13" r="7.5"/><path d="M7 11.5c3 2 7 2 10 0" opacity=".6"/>`],
    loaf: (a) => [`<path d="M4 15c0-5 3.5-8 8-8s8 3 8 8v3H4z" ${f(a)}/>`, `<path d="M4 15c0-5 3.5-8 8-8s8 3 8 8v3H4zM8 10l2 2M12 9l2 2M16 10l1.5 2"/>`],
    candle: (a) => [`<rect x="6" y="10" width="12" height="10" rx="2" ${f("#D9DEE3")}/><rect x="6" y="13" width="12" height="4" ${f(a)}/><path d="M12 4c1.4 1.6 1.8 2.6 1.8 3.5a1.8 1.8 0 0 1-3.6 0c0-.9.4-1.9 1.8-3.5z" ${f("#F08A3C")}/>`, `<rect x="6" y="10" width="12" height="10" rx="2"/><path d="M12 10V8"/><path d="M12 4c1.4 1.6 1.8 2.6 1.8 3.5a1.8 1.8 0 0 1-3.6 0c0-.9.4-1.9 1.8-3.5z"/>`],
    tart: (a) => [`<path d="M4 12h16l-2 7H6z" ${f("#E3B06A")}/><ellipse cx="12" cy="12" rx="7" ry="2.5" ${f(a)}/>`, `<path d="M4 12h16l-2 7H6z"/><ellipse cx="12" cy="12" rx="7" ry="2.5"/><path d="M8 13l1 5M12 13v5M16 13l-1 5" opacity=".4"/>`],
    crescent: (a) => [`<path d="M3 15c2-6 6-9 9-9s7 3 9 9c-2-2-4-2-5-1-1-3-3-4-4-4s-3 1-4 4c-1-1-3-1-5 1z" ${f(a)}/>`, `<path d="M3 15c2-6 6-9 9-9s7 3 9 9c-2-2-4-2-5-1-1-3-3-4-4-4s-3 1-4 4c-1-1-3-1-5 1z"/><path d="M12 6v4" opacity=".5"/>`],
    bun: (a, b = "#FFFDF6") => [`<path d="M4 15c0-4.5 3.5-7.5 8-7.5s8 3 8 7.5v2H4z" ${f(a)}/><path d="M8 12c2-2 6-2 8 0" ${f("none")}/><circle cx="12" cy="11" r="1.5" ${f(b)}/>`, `<path d="M4 15c0-4.5 3.5-7.5 8-7.5s8 3 8 7.5v2H4zM3 17h18"/><path d="M8 12.5c2-1.5 6-1.5 8 0" opacity=".6"/>`],
    cup: (a) => [`<path d="M7 8h10l-1.5 13h-7z" ${f(a)}/><rect x="6.5" y="6" width="11" height="2.5" rx="1" ${f("#FFFDF6")}/>`, `<path d="M7 8h10l-1.5 13h-7zM6.5 6h11v2.5h-11zM13 6l2-4"/>`],
    apple: (a) => [`<circle cx="12" cy="14" r="6.5" ${f(a)}/>`, `<circle cx="12" cy="14" r="6.5"/><path d="M12 7.5V2"/><path d="M8.5 12c.5-1 1.3-1.6 2.3-1.8" opacity=".6"/>`],
    bag: (a, b = "#E8566C") => [`<path d="M6 7h12l-1 14H7z" ${f(a)}/>${[8, 12, 16].map(x => `<path d="M${x - 1} 7h2l-.4 14h-1.2z" ${f(b)}/>`).join("")}<circle cx="10" cy="5.5" r="2" ${f("#FFFDF6")}/><circle cx="14" cy="5" r="2" ${f("#FFFDF6")}/>`, `<path d="M6 7h12l-1 14H7z"/><circle cx="10" cy="5.5" r="2"/><circle cx="14" cy="5" r="2"/>`],
    cloud: (a) => [`<circle cx="9" cy="9" r="4" ${f(a)}/><circle cx="14.5" cy="8" r="4.5" ${f(a)}/><circle cx="12" cy="12" r="4" ${f(a)}/>`, `<path d="M12 16v6"/><path d="M6 10a4 4 0 0 1 6-4 4.5 4.5 0 0 1 6.5 4 4 4 0 0 1-6.5 5.5A4 4 0 0 1 6 10z"/>`],
    boat: (a) => [`<path d="M3 11h18l-3 8H6z" ${f("#FFFDF6")}/>${[7, 11, 15].map(x => `<circle cx="${x}" cy="10" r="2.6" ${f(a)}/>`).join("")}`, `<path d="M3 11h18l-3 8H6z"/>${[7, 11, 15].map(x => `<circle cx="${x}" cy="10" r="2.6"/>`).join("")}`],
    bao: (a, b = "#A8432E") => [`<path d="M3 14c0-4 4-6 9-6s9 2 9 6c-3 2-15 2-18 0z" ${f(a)}/><path d="M5 13.5c3 1 11 1 14 0v1.5c-3 1-11 1-14 0z" ${f(b)}/>`, `<path d="M3 14c0-4 4-6 9-6s9 2 9 6c-3 2-15 2-18 0z"/><path d="M5 13.5c3 1 11 1 14 0"/>`],
    bowl: (a) => [`<path d="M3 11h18a9 7 0 0 1-18 0z" ${f("#FFFDF6")}/><ellipse cx="12" cy="11" rx="8" ry="2" ${f(a)}/>`, `<path d="M3 11h18a9 7 0 0 1-18 0zM9 20h6"/><ellipse cx="12" cy="11" rx="9" ry="2"/>`],
    plate: (a, b = "#E8566C") => [`<ellipse cx="12" cy="15" rx="9" ry="4" ${f("#FFFDF6")}/><ellipse cx="12" cy="13.5" rx="6" ry="2.6" ${f(a)}/><path d="M9 13c1 .5 2 .5 3 0s2-.5 3 0" ${f("none")} style="stroke:${b}" stroke-width="1.4"/>`, `<ellipse cx="12" cy="15" rx="9" ry="4"/><ellipse cx="12" cy="13.5" rx="6" ry="2.6"/>`],
    roll: (a, b = "#F3D34A") => [`${[6, 12, 18].map(x => `<circle cx="${x}" cy="13" r="3.6" ${f(a)}/><circle cx="${x}" cy="13" r="2" ${f("#FFFDF6")}/><circle cx="${x}" cy="13" r=".9" ${f(b)}/>`).join("")}`, `${[6, 12, 18].map(x => `<circle cx="${x}" cy="13" r="3.6"/>`).join("")}`],
    skewer: (a) => [`<rect x="9" y="4" width="6" height="12" rx="3" ${f(a)}/>`, `<rect x="9" y="4" width="6" height="12" rx="3"/><path d="M12 16v6"/>`],
    fish: (a) => [`<path d="M3 12c3-4 9-5 13-2l4-3v10l-4-3c-4 3-10 2-13-2z" ${f(a)}/>`, `<path d="M3 12c3-4 9-5 13-2l4-3v10l-4-3c-4 3-10 2-13-2z"/><circle cx="7" cy="11" r=".8"/><path d="M10 10q1.5 2 0 4" opacity=".6"/>`],
    disc: (a) => [`<circle cx="12" cy="12" r="8" ${f(a)}/><path d="M12 7.5l1.3 2.8 3 .3-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.3z" ${f("#C98A3A")}/>`, `<circle cx="12" cy="12" r="8"/><path d="M12 7.5l1.3 2.8 3 .3-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.3z"/>`],
    bow: (a) => [`<path d="M12 12L4 7v10zM12 12l8-5v10z" ${f(a)}/><circle cx="12" cy="12" r="2" ${f(a)}/>`, `<path d="M12 12L4 7v10zM12 12l8-5v10z"/><circle cx="12" cy="12" r="2"/><path d="M11 14l-2 6M13 14l2 6"/>`],
    band: (a) => [`<path d="M4 16a8 8 0 0 1 16 0" fill="none" style="stroke:var(--line)" stroke-width="3.6"/>${[5, 7.5, 10.5, 13.5, 16.5, 19].map((x, i) => `<circle cx="${x}" cy="${[15, 11, 9, 9, 11, 15][i]}" r="1.5" ${f(a)}/>`).join("")}`, `${[5, 7.5, 10.5, 13.5, 16.5, 19].map((x, i) => `<circle cx="${x}" cy="${[15, 11, 9, 9, 11, 15][i]}" r="1.5"/>`).join("")}`],
    clip: (a) => [`<path d="M12 12c-2-5-7-6-8-3s3 6 8 3zM12 12c2-5 7-6 8-3s-3 6-8 3z" ${f(a)}/>`, `<path d="M12 12c-2-5-7-6-8-3s3 6 8 3zM12 12c2-5 7-6 8-3s-3 6-8 3zM12 12v8"/>`],
    pins: (a) => [`${[8, 12, 16].map(x => `<circle cx="${x}" cy="6" r="1.8" ${f(a)}/>`).join("")}`, `${[8, 12, 16].map(x => `<circle cx="${x}" cy="6" r="1.8"/><path d="M${x} 8v12"/>`).join("")}`],
    beads: (a) => [`${Array.from({length: 7}, (_, i) => `<circle cx="${12 + 7*Math.cos(i*0.9)}" cy="${12 + 7*Math.sin(i*0.9)}" r="2" ${f(i % 2 ? a : "#FFFDF6")}/>`).join("")}`, `<circle cx="12" cy="12" r="7" opacity=".4"/>`],
    plush: (a) => [`<circle cx="12" cy="13" r="6.5" ${f(a)}/><path d="M6.5 9l1-5 3.5 3.5zM17.5 9l-1-5-3.5 3.5z" ${f(a)}/>`, `<circle cx="12" cy="13" r="6.5"/><path d="M6.5 9l1-5 3.5 3.5M17.5 9l-1-5-3.5 3.5"/><circle cx="9.5" cy="12.5" r=".8"/><circle cx="14.5" cy="12.5" r=".8"/><path d="M11 15q1 1 2 0"/>`],
    pin: (a) => [`<circle cx="12" cy="12" r="7.5" ${f(a)}/><path d="M12 7l1.5 3.2 3.5.4-2.6 2.3.7 3.5-3.1-1.8-3.1 1.8.7-3.5-2.6-2.3 3.5-.4z" ${f("#FFFDF6")}/>`, `<circle cx="12" cy="12" r="7.5"/>`],
    star: (a) => [`<path d="M12 3l2.6 5.6 6 .6-4.5 4 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.5-4 6-.6z" ${f(a)}/>`, `<path d="M12 3l2.6 5.6 6 .6-4.5 4 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.5-4 6-.6z"/>`],
    sock: (a, b = "#FFFDF6") => [`<path d="M8 3h7v10l3 3a3 3 0 0 1-4 4l-6-5z" ${f(a)}/><rect x="8" y="6" width="7" height="2" ${f(b)}/><rect x="8" y="10" width="7" height="2" ${f(b)}/>`, `<path d="M8 3h7v10l3 3a3 3 0 0 1-4 4l-6-5z"/>`],
    tee: (a) => [`<path d="M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3c-1 2-5 2-8 0z" ${f(a)}/>`, `<path d="M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3c-1 2-5 2-8 0z"/>`],
    tote: (a, b = "#E8566C") => [`<rect x="5" y="9" width="14" height="12" rx="1" ${f(a)}/><circle cx="12" cy="15" r="2.5" ${f(b)}/>`, `<rect x="5" y="9" width="14" height="12" rx="1"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>`],
    mask: (a) => [`<path d="M3 10c3-2 15-2 18 0 0 4-3 6-6 5-1.5-.5-2-1.5-3-1.5S10.5 14.5 9 15c-3 1-6-1-6-5z" ${f(a)}/>`, `<path d="M3 10c3-2 15-2 18 0 0 4-3 6-6 5-1.5-.5-2-1.5-3-1.5S10.5 14.5 9 15c-3 1-6-1-6-5zM3 10H1M21 10h2"/>`],
    beanie: (a) => [`<path d="M5 15a7 7 0 0 1 14 0z" ${f(a)}/><rect x="4" y="15" width="16" height="4" rx="1" ${f(a)}/><circle cx="12" cy="6" r="2" ${f("#FFFDF6")}/>`, `<path d="M5 15a7 7 0 0 1 14 0"/><rect x="4" y="15" width="16" height="4" rx="1"/><circle cx="12" cy="6" r="2"/>`],
    lantern: (a) => [`<ellipse cx="12" cy="13" rx="6" ry="7" ${f(a)}/><rect x="9" y="4.5" width="6" height="2" ${f("#F3C969")}/><rect x="9" y="19.5" width="6" height="2" ${f("#F3C969")}/>`, `<ellipse cx="12" cy="13" rx="6" ry="7"/><path d="M12 2v2.5M12 6v14M9 7c-2 4-2 8 0 12M15 7c2 4 2 8 0 12" opacity=".6"/>`],
    bonsai: (a, b = "#7FB8E8") => [`<path d="M7 16h10l-1.5 5h-7z" ${f(b)}/><circle cx="9" cy="9" r="3.5" ${f(a)}/><circle cx="15" cy="8" r="4" ${f(a)}/>`, `<path d="M7 16h10l-1.5 5h-7zM12 16c0-3-1-5-3-7M12 13c1-2 2-3 3-5"/><circle cx="9" cy="9" r="3.5"/><circle cx="15" cy="8" r="4"/>`],
    globe: (a) => [`<circle cx="12" cy="11" r="7.5" ${f(a)}/><path d="M9 14l3-4 3 4z" ${f("#FFFDF6")}/><path d="M6 18h12l1 3H5z" ${f("#C98A4A")}/>`, `<circle cx="12" cy="11" r="7.5"/><path d="M6 18h12l1 3H5zM9 14l3-4 3 4z"/><circle cx="9" cy="8" r=".6"/><circle cx="15" cy="9" r=".6"/>`],
    cone: (a) => [`<path d="M8 11l4 11 4-11z" ${f("#E8C48E")}/><circle cx="12" cy="8.5" r="5" ${f(a)}/>`, `<path d="M8 11l4 11 4-11zM9.5 14l4 3M14.5 14l-4 3"/><circle cx="12" cy="8.5" r="5"/>`],
    owl: (a) => [`<path d="M6 20V9a6 6 0 0 1 12 0v11z" ${f(a)}/><circle cx="9.5" cy="10" r="2.4" ${f("#FFFDF6")}/><circle cx="14.5" cy="10" r="2.4" ${f("#FFFDF6")}/>`, `<path d="M6 20V9a6 6 0 0 1 12 0v11zM6 6l2 2M18 6l-2 2M11 13l1 1.5 1-1.5"/><circle cx="9.5" cy="10" r="2.4"/><circle cx="14.5" cy="10" r="2.4"/><circle cx="9.5" cy="10" r=".7"/><circle cx="14.5" cy="10" r=".7"/>`],
    crane: (a) => [`<path d="M3 13l9-7 9 7-9 2z" ${f(a)}/><path d="M12 15l-2 5h4z" ${f(a)}/>`, `<path d="M3 13l9-7 9 7-9 2zM12 6v9M12 15l-2 5h4zM12 2v4"/>`],
    bell: (a) => [`<path d="M6 17c1-1 1-4 1-6a5 5 0 0 1 10 0c0 2 0 5 1 6z" ${f(a)}/><circle cx="12" cy="19" r="1.8" ${f(a)}/>`, `<path d="M6 17c1-1 1-4 1-6a5 5 0 0 1 10 0c0 2 0 5 1 6zM12 6V4"/><circle cx="12" cy="19" r="1.8"/>`],
    radio: (a) => [`<rect x="3.5" y="8" width="17" height="12" rx="2.5" ${f(a)}/><circle cx="9" cy="14" r="3" ${f("#FFFDF6")}/><rect x="14" y="11" width="4" height="2" ${f("#FFFDF6")}/>`, `<rect x="3.5" y="8" width="17" height="12" rx="2.5"/><circle cx="9" cy="14" r="3"/><path d="M15 3l-6 5M14 16h4"/>`],
    cat: (a) => [`<circle cx="12" cy="13" r="7" ${f(a)}/><path d="M5.5 9l1-5.5 4 3.5zM18.5 9l-1-5.5-4 3.5z" ${f(a)}/>`, `<circle cx="12" cy="13" r="7"/><path d="M5.5 9l1-5.5 4 3.5M18.5 9l-1-5.5-4 3.5M11 15.5l1 .8 1-.8M7 15h-3M17 15h3"/><circle cx="9.5" cy="12.5" r=".8"/><circle cx="14.5" cy="12.5" r=".8"/>`],
    dog: (a) => [`<circle cx="12" cy="13" r="7" ${f(a)}/><ellipse cx="5.5" cy="12" rx="2.5" ry="5" ${f("#8A5A3A")}/><ellipse cx="18.5" cy="12" rx="2.5" ry="5" ${f("#8A5A3A")}/>`, `<circle cx="12" cy="13" r="7"/><ellipse cx="5.5" cy="12" rx="2.5" ry="5"/><ellipse cx="18.5" cy="12" rx="2.5" ry="5"/><circle cx="12" cy="15.5" r="1.2"/><circle cx="9.5" cy="12" r=".8"/><circle cx="14.5" cy="12" r=".8"/>`],
    bunny: (a) => [`<circle cx="12" cy="15" r="6" ${f(a)}/><ellipse cx="9.5" cy="6" rx="2" ry="5" ${f(a)}/><ellipse cx="14.5" cy="6" rx="2" ry="5" ${f(a)}/>`, `<circle cx="12" cy="15" r="6"/><ellipse cx="9.5" cy="6" rx="2" ry="5"/><ellipse cx="14.5" cy="6" rx="2" ry="5"/><circle cx="10" cy="14.5" r=".8"/><circle cx="14" cy="14.5" r=".8"/><path d="M11.3 17l.7.6.7-.6"/>`],
    hamster: (a) => [`<ellipse cx="12" cy="14" rx="8" ry="6.5" ${f(a)}/><circle cx="7.5" cy="8.5" r="2.2" ${f(a)}/><circle cx="16.5" cy="8.5" r="2.2" ${f(a)}/><ellipse cx="12" cy="16.5" rx="4" ry="2.6" ${f("#FFFDF6")}/>`, `<ellipse cx="12" cy="14" rx="8" ry="6.5"/><circle cx="7.5" cy="8.5" r="2.2"/><circle cx="16.5" cy="8.5" r="2.2"/><circle cx="9.5" cy="12.5" r=".8"/><circle cx="14.5" cy="12.5" r=".8"/>`],
    fishbowl: (a) => [`<circle cx="12" cy="13" r="8" ${f("#DCEBF2")}/><path d="M9 13q3-3 6 0q-3 3-6 0zM9 13l-3-2v4z" ${f(a)}/>`, `<circle cx="12" cy="13" r="8"/><path d="M6 6h12M9 13q3-3 6 0q-3 3-6 0zM9 13l-3-2v4z"/>`],
    bird: (a) => [`<ellipse cx="11" cy="13" rx="6" ry="7" ${f(a)}/><circle cx="13" cy="7.5" r="3.5" ${f("#F3E07A")}/><path d="M16 7.5l3 1-3 1z" ${f("#F2A65A")}/>`, `<ellipse cx="11" cy="13" rx="6" ry="7"/><circle cx="13" cy="7.5" r="3.5"/><path d="M16 7.5l3 1-3 1M9 20v2M13 20v2M5 15l-3 4"/><circle cx="13.5" cy="7" r=".7"/>`],
    tortoise: (a) => [`<path d="M3 17q0-10 9-10t9 10z" ${f(a)}/><ellipse cx="21" cy="14" rx="2.5" ry="2" ${f("#B9D98A")}/>`, `<path d="M3 17q0-10 9-10t9 10zM8 10l4-2 4 2M6 14h12"/><ellipse cx="21" cy="14" rx="2.5" ry="2"/>`],
    duck: (a) => [`<ellipse cx="11" cy="15" rx="7" ry="5.5" ${f(a)}/><circle cx="15" cy="8.5" r="4" ${f(a)}/><path d="M18.5 8.5l3.5 1-3.5 1.5z" ${f("#F2A65A")}/>`, `<ellipse cx="11" cy="15" rx="7" ry="5.5"/><circle cx="15" cy="8.5" r="4"/><path d="M18.5 8.5l3.5 1-3.5 1.5"/><circle cx="16" cy="8" r=".7"/>`],
    bar: (a) => [`<rect x="5" y="4" width="14" height="17" rx="1.5" ${f(a)}/><path d="M5 11h14v10H5z" ${f("#E8D3A6")}/><path d="M5 11h14" ${f("none")}/>`, `<rect x="5" y="4" width="14" height="17" rx="1.5"/><path d="M5 11h14M12 4v7M5 7.5h14"/><path d="M8 15h8M8 18h5" opacity=".5"/>`],
    coconut: (a) => [`<circle cx="12" cy="14" r="7" ${f(a)}/><ellipse cx="12" cy="9" rx="4" ry="1.5" ${f("#FFFDF6")}/>`, `<circle cx="12" cy="14" r="7"/><ellipse cx="12" cy="9" rx="4" ry="1.5"/><path d="M14 9l3-7"/>`]
  };
  // the Cocoa Room's (cocoa.js): house chocolate for the gelato fridge, wine fillings, festival specials
  I.housechoc = S.bar("#3F2519"); I.sp_log = I.logcake; I.sp_mooncake = I.mooncake;
  [["red", "#7A1F3D"], ["rose", "#E98AA0"], ["white", "#E8D57A"], ["sparkling", "#F3E7B0"]].forEach(([k, c]) => { I["wine_" + k] = S.bottle(c); });
  Object.entries(GOODS).forEach(([id, g]) => { if (I[id] || !g.art) return; const fn = S[g.art[0]] || S.box; I[id] = fn(g.art[1], g.art[2]); });
}
export const icon = (name, size = 24, cls = "") => `<svg class="ico${cls ? " " + cls : ""}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false">${body(name)}</svg>`;
export const iconAt = (name, x, y, size = 24, cls = "") => `<svg x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" viewBox="0 0 24 24" overflow="visible"${cls ? ` class="${cls}"` : ""} pointer-events="none">${body(name)}</svg>`;
export const ICON_NAMES = Object.keys(I);

// A thin hand-drawn progress bar (trackers). ticks: number of segments marked along it.
export function progressBar(pct, color, ticks = 0){
  const w = Math.max(0, Math.min(1, pct || 0))*115;
  const tk = Array.from({length: Math.max(0, ticks - 1)}, (_, i) => `<path d="M${(2.5 + 115*(i + 1)/ticks).toFixed(1)} 4v4"/>`).join("");
  return `<svg class="pbar" viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <g filter="url(#markerS)">${w > .5 ? `<rect x="2.5" y="2.6" width="${w.toFixed(1)}" height="6.8" rx="3.4" style="fill:${color}"/>` : ""}</g>
    <g filter="url(#wobS)" fill="none" stroke="var(--line)" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke"><rect x="1.5" y="2" width="117" height="8" rx="4"/><g opacity=".3">${tk}</g></g></svg>`;
}

// Vertical version for the tracker column on the right of the map; fills from the bottom.
export function progressBarV(pct, color, ticks = 0){
  const h = Math.max(0, Math.min(1, pct || 0))*115;
  const tk = Array.from({length: Math.max(0, ticks - 1)}, (_, i) => `<path d="M4 ${(117.5 - 115*(i + 1)/ticks).toFixed(1)}h4"/>`).join("");
  return `<svg class="pbar v" viewBox="0 0 12 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <g filter="url(#markerS)">${h > .5 ? `<rect x="2.6" y="${(117.5 - h).toFixed(1)}" width="6.8" height="${h.toFixed(1)}" rx="3.4" style="fill:${color}"/>` : ""}</g>
    <g filter="url(#wobS)" fill="none" stroke="var(--line)" stroke-width="1.1" stroke-linecap="round" vector-effect="non-scaling-stroke"><rect x="2" y="1.5" width="8" height="117" rx="4"/><g opacity=".3">${tk}</g></g></svg>`;
}
