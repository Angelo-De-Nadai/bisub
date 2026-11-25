// BiSub keyboard shortcuts. Bindings are set on the settings page; state persists in chrome.storage.local.
(() => {
  const B = globalThis.BISUB;
  let st = { ...B.STATE_DEFAULT };
  let binds = { ...B.BIND_DEFAULT };

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
  const save = () => { try { chrome.storage.local.set({ [B.STATE_KEY]: st }); } catch {} };

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
  const help = () => ["BiSub shortcuts", ...B.ACTIONS.filter((a) => binds[a.id]).map((a) => `${B.label(binds[a.id])}   ${a.label}`)].join("\n");

  const run = {
    all: () => { st.all = !st.all; return `Subtitles ${onoff(st.all)}`; },
    line1: () => { st.line1 = !st.line1; return `Original line ${onoff(st.line1)}`; },
    line2: () => { st.line2 = !st.line2; return `Translation line ${onoff(st.line2)}`; },
    pinyin: () => { st.pinyin = !st.pinyin; return `Pinyin ${onoff(st.pinyin)}`; },
    bigger: () => { st.zoom = Math.min(3, +(st.zoom + 0.1).toFixed(2)); return `Size ${Math.round(st.zoom * 100)}%`; },
    smaller: () => { st.zoom = Math.max(0.5, +(st.zoom - 0.1).toFixed(2)); return `Size ${Math.round(st.zoom * 100)}%`; },
    up: () => { st.shift = Math.min(600, st.shift + 20); return `Position +${st.shift}px`; },
    down: () => { st.shift = Math.max(-60, st.shift - 20); return `Position ${st.shift >= 0 ? "+" : ""}${st.shift}px`; },
    reset: () => { st.zoom = 1; st.shift = 0; return "Size and position reset"; },
    help,
  };
  const repeatable = new Set(["bigger", "smaller", "up", "down"]);

  const typing = (t) => t instanceof Element && t.closest("input,textarea,select,[contenteditable]:not([contenteditable=false])") !== null;

  window.addEventListener("keydown", (e) => {
    const id = B.ACTIONS.map((a) => a.id).find((k) => B.matches(binds[k], e));
    if (!id || typing(e.target) || (e.repeat && !repeatable.has(id))) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const msg = run[id]();
    apply();
    if (id !== "help") save();
    toast(msg, id === "help" ? 5000 : 1200);
  }, true);

  const load = (r) => {
    st = { ...B.STATE_DEFAULT, ...(r?.[B.STATE_KEY] ?? {}) };
    binds = { ...B.BIND_DEFAULT, ...(r?.[B.BIND_KEY] ?? {}) };
    apply();
  };
  try {
    chrome.storage.local.get([B.STATE_KEY, B.BIND_KEY]).then(load, () => apply());
    // Live updates from the settings page.
    chrome.storage.onChanged.addListener((ch, area) => {
      if (area !== "local") return;
      if (ch[B.STATE_KEY]) st = { ...B.STATE_DEFAULT, ...(ch[B.STATE_KEY].newValue ?? {}) };
      if (ch[B.BIND_KEY]) binds = { ...B.BIND_DEFAULT, ...(ch[B.BIND_KEY].newValue ?? {}) };
      apply();
    });
  } catch { apply(); }
})();
