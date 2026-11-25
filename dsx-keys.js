// BiSub keyboard shortcuts (Alt/Option + key). State persists in chrome.storage.local.
(() => {
  const KEY = "bisubKeys";
  const DEF = { all: true, line1: true, line2: true, pinyin: true, zoom: 1, shift: 0 };
  let st = { ...DEF };

  const css = document.createElement("style");
  css.textContent = [
    "html.bisub-k-off .bisub-renderer{display:none!important}",
    "html.bisub-k-no1 .bisub-renderer .bisub-subtitle:nth-last-child(1){display:none!important}",
    "html.bisub-k-no2 .bisub-renderer .bisub-subtitle:nth-last-child(2){display:none!important}",
    "html.bisub-k-nopy .bisub-dialogue rt{display:none!important}",
    ".bisub-renderer{--bisub-fontsize-base:calc(28px * var(--bisub-kzoom,1))!important;--bisub-bottom-base:calc(70px + var(--bisub-kshift,0px))!important}",
    ".bisub-toast{position:fixed;top:12%;left:50%;transform:translateX(-50%);z-index:2147483647;background:rgba(0,0,0,.85);color:#fff;font:15px/1.5 system-ui,sans-serif;padding:8px 14px;border-radius:8px;pointer-events:none;white-space:pre;transition:opacity .3s}",
  ].join("");
  (document.head || document.documentElement).appendChild(css);

  const apply = () => {
    const h = document.documentElement.classList;
    h.toggle("bisub-k-off", !st.all);
    h.toggle("bisub-k-no1", !st.line1);
    h.toggle("bisub-k-no2", !st.line2);
    h.toggle("bisub-k-nopy", !st.pinyin);
    document.documentElement.style.setProperty("--bisub-kzoom", String(st.zoom));
    document.documentElement.style.setProperty("--bisub-kshift", `${st.shift}px`);
  };
  const save = () => { try { chrome.storage.local.set({ [KEY]: st }); } catch {} };

  let toastEl = null, toastTimer = 0;
  const toast = (msg, ms = 1200) => {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "bisub-toast"; }
    (document.fullscreenElement || document.body || document.documentElement).appendChild(toastEl);
    toastEl.textContent = msg;
    toastEl.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.style.opacity = "0"; }, ms);
  };
  const onoff = (b) => (b ? "ON" : "OFF");
  const HELP = [
    "BiSub shortcuts (Alt / Option +)",
    "X  subtitles on/off",
    "1  original line on/off",
    "2  translation line on/off",
    "P  pinyin on/off",
    "↑ / ↓  bigger / smaller",
    "PgUp / PgDn  move up / down",
    "0  reset size and position",
    "H  this help",
  ].join("\n");

  const actions = {
    KeyX: () => { st.all = !st.all; return `Subtitles ${onoff(st.all)}`; },
    Digit1: () => { st.line1 = !st.line1; return `Original line ${onoff(st.line1)}`; },
    Digit2: () => { st.line2 = !st.line2; return `Translation line ${onoff(st.line2)}`; },
    KeyP: () => { st.pinyin = !st.pinyin; return `Pinyin ${onoff(st.pinyin)}`; },
    ArrowUp: () => { st.zoom = Math.min(3, +(st.zoom + 0.1).toFixed(2)); return `Size ${Math.round(st.zoom * 100)}%`; },
    ArrowDown: () => { st.zoom = Math.max(0.5, +(st.zoom - 0.1).toFixed(2)); return `Size ${Math.round(st.zoom * 100)}%`; },
    PageUp: () => { st.shift = Math.min(600, st.shift + 20); return `Position +${st.shift}px`; },
    PageDown: () => { st.shift = Math.max(-60, st.shift - 20); return `Position ${st.shift >= 0 ? "+" : ""}${st.shift}px`; },
    Digit0: () => { st.zoom = 1; st.shift = 0; return "Size and position reset"; },
    KeyH: () => HELP,
  };

  const typing = (t) => t instanceof Element && (t.closest("input,textarea,select,[contenteditable]:not([contenteditable=false])") !== null);

  window.addEventListener("keydown", (e) => {
    if (!e.altKey || e.ctrlKey || e.metaKey || e.repeat && !/Arrow|Page/.test(e.code)) return;
    const fn = actions[e.code];
    if (!fn || typing(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const msg = fn();
    apply();
    if (e.code !== "KeyH") save();
    toast(msg, e.code === "KeyH" ? 5000 : 1200);
  }, true);

  try {
    chrome.storage.local.get(KEY).then((r) => { st = { ...DEF, ...(r?.[KEY] ?? {}) }; apply(); }, apply);
  } catch { apply(); }
})();
