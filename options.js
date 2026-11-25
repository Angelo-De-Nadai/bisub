(() => {
  const B = globalThis.BISUB;
  const $ = (id) => document.getElementById(id);
  let binds = { ...B.BIND_DEFAULT };
  let state = { ...B.STATE_DEFAULT };
  let recording = null;

  const warn = (msg) => { $("warn").textContent = msg ?? ""; };
  const saveBinds = () => chrome.storage.local.set({ [B.BIND_KEY]: binds });

  const render = () => {
    const tb = $("list");
    tb.replaceChildren();
    for (const a of B.ACTIONS) {
      const tr = document.createElement("tr");
      const name = document.createElement("td");
      name.textContent = a.label;
      const k = document.createElement("td");
      k.className = "k";
      const btn = document.createElement("button");
      btn.className = "key" + (recording === a.id ? " rec" : "");
      btn.textContent = recording === a.id ? "Press keys…" : B.label(binds[a.id]);
      btn.onclick = () => { recording = recording === a.id ? null : a.id; warn(); render(); };
      const x = document.createElement("button");
      x.className = "x";
      x.title = "Disable";
      x.textContent = "×";
      x.onclick = () => { binds[a.id] = null; recording = null; saveBinds(); render(); };
      k.append(btn, x);
      tr.append(name, k);
      tb.appendChild(tr);
    }
  };

  window.addEventListener("keydown", (e) => {
    if (!recording) return;
    e.preventDefault();
    if (e.code === "Escape") { recording = null; render(); return; }
    if (/^(Alt|Control|Shift|Meta|OS)(Left|Right)?$/.test(e.code)) return; // wait for the real key
    const b = B.norm({ code: e.code, alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey });
    const clash = B.ACTIONS.find((a) => a.id !== recording && B.same(binds[a.id], b));
    if (clash) { warn(`${B.label(b)} is already used for "${clash.label}".`); return; }
    binds[recording] = b;
    warn(!b.alt && !b.ctrl && !b.meta ? `${B.label(b)} has no ⌥/Ctrl/⌘ modifier and may override the site's own shortcuts.` : "");
    recording = null;
    saveBinds();
    render();
  }, true);

  $("pinyin").onchange = (e) => {
    state = { ...state, pinyin: e.target.checked };
    chrome.storage.local.set({ [B.STATE_KEY]: state });
  };
  $("reset").onclick = () => { binds = { ...B.BIND_DEFAULT }; recording = null; warn(); saveBinds(); render(); };

  chrome.storage.local.get([B.STATE_KEY, B.BIND_KEY]).then((r) => {
    state = { ...B.STATE_DEFAULT, ...(r[B.STATE_KEY] ?? {}) };
    binds = { ...B.BIND_DEFAULT, ...(r[B.BIND_KEY] ?? {}) };
    $("pinyin").checked = !!state.pinyin;
    render();
  });
  // Keep in sync if pinyin is toggled with the shortcut while this page is open.
  chrome.storage.onChanged.addListener((ch, area) => {
    if (area === "local" && ch[B.STATE_KEY]) {
      state = { ...B.STATE_DEFAULT, ...(ch[B.STATE_KEY].newValue ?? {}) };
      $("pinyin").checked = !!state.pinyin;
    }
  });
})();
