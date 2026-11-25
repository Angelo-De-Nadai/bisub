// "Pinyin & Keys" tab inside the popup: pinyin on/off and remappable shortcuts.
globalThis.bisubMountPanel = (root) => {
  if (!root || root.dataset.bisubMounted) return;
  root.dataset.bisubMounted = "1";
  const B = globalThis.BISUB;
  let binds = { ...B.BIND_DEFAULT };
  let state = { ...B.STATE_DEFAULT };
  let recording = null;

  const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
  const css = el("style", { textContent: `
    .bp{display:grid;gap:8px;font-size:13px}
    .bp label.row{display:flex;gap:8px;align-items:center}
    .bp table{width:100%;border-collapse:collapse}
    .bp td{padding:4px 0;border-bottom:1px solid #8883;vertical-align:middle}
    .bp td.k{text-align:right;white-space:nowrap}
    .bp button{font:inherit;cursor:pointer}
    .bp button.key{min-width:76px;font-family:ui-monospace,Menlo,monospace}
    .bp button.key.rec{outline:2px solid #0a66ff}
    .bp button.x{margin-left:4px}
    .bp .note{opacity:.7;font-size:12px;margin:0}
    .bp .warn{color:#d06000;font-size:12px;min-height:1em}` });
  const pinyin = el("input", { type: "checkbox" });
  const list = el("tbody");
  const warnEl = el("div", { className: "warn" });
  const reset = el("button", { textContent: "Restore default shortcuts" });
  root.append(css, el("div", { className: "bp" },
    el("b", { textContent: "Display" }),
    el("label", { className: "row" }, pinyin, "Show pinyin above Chinese characters"),
    el("b", { textContent: "Keyboard shortcuts" }),
    el("p", { className: "note", textContent: "Click a shortcut, then press the new keys. Esc cancels, × disables. Use ⌥ / Ctrl / ⌘ so the site's own shortcuts keep working." }),
    el("table", {}, list), warnEl, el("div", {}, reset)));

  const warn = (m) => { warnEl.textContent = m ?? ""; };
  const saveBinds = () => chrome.storage.local.set({ [B.BIND_KEY]: binds });

  const render = () => {
    list.replaceChildren();
    for (const a of B.ACTIONS) {
      const btn = el("button", { className: "key" + (recording === a.id ? " rec" : ""), textContent: recording === a.id ? "Press keys…" : B.label(binds[a.id]) });
      btn.onclick = () => { recording = recording === a.id ? null : a.id; warn(); render(); };
      const x = el("button", { className: "x", title: "Disable", textContent: "×" });
      x.onclick = () => { binds[a.id] = null; recording = null; saveBinds(); render(); };
      list.append(el("tr", {}, el("td", { textContent: a.label }), el("td", { className: "k" }, btn, x)));
    }
  };

  const onKey = (e) => {
    if (!root.isConnected) { window.removeEventListener("keydown", onKey, true); return; }
    if (!recording) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.code === "Escape") { recording = null; render(); return; }
    if (/^(Alt|Control|Shift|Meta|OS)(Left|Right)?$/.test(e.code)) return;
    const b = B.norm({ code: e.code, alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey });
    const clash = B.ACTIONS.find((a) => a.id !== recording && B.same(binds[a.id], b));
    if (clash) { warn(`${B.label(b)} is already used for "${clash.label}".`); return; }
    binds[recording] = b;
    warn(!b.alt && !b.ctrl && !b.meta ? `${B.label(b)} has no ⌥/Ctrl/⌘ and may override the site's own shortcuts.` : "");
    recording = null;
    saveBinds();
    render();
  };
  window.addEventListener("keydown", onKey, true);

  pinyin.onchange = () => { state = { ...state, pinyin: pinyin.checked }; chrome.storage.local.set({ [B.STATE_KEY]: state }); };
  reset.onclick = () => { binds = { ...B.BIND_DEFAULT }; recording = null; warn(); saveBinds(); render(); };

  chrome.storage.local.get([B.STATE_KEY, B.BIND_KEY]).then((r) => {
    state = { ...B.STATE_DEFAULT, ...(r[B.STATE_KEY] ?? {}) };
    binds = { ...B.BIND_DEFAULT, ...(r[B.BIND_KEY] ?? {}) };
    pinyin.checked = !!state.pinyin;
    render();
  });
};
