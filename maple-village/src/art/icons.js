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

export const icon = (name, size = 24, cls = "") => `<svg class="ico${cls ? " " + cls : ""}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false">${body(name)}</svg>`;
export const iconAt = (name, x, y, size = 24, cls = "") => `<svg x="${x - size/2}" y="${y - size/2}" width="${size}" height="${size}" viewBox="0 0 24 24" overflow="visible"${cls ? ` class="${cls}"` : ""} pointer-events="none">${body(name)}</svg>`;
export const ICON_NAMES = Object.keys(I);
