// Shared by the content script (dsx-keys.js) and the settings page (options.js).
globalThis.BISUB = {
  STATE_KEY: "bisubKeys",
  BIND_KEY: "bisubBindings",
  STATE_DEFAULT: { all: true, line1: true, line2: true, pinyin: true, zoom: 1, shift: 0 },
  ACTIONS: [
    { id: "all", label: "Subtitles on / off" },
    { id: "line1", label: "Original line on / off" },
    { id: "line2", label: "Translation line on / off" },
    { id: "pinyin", label: "Pinyin on / off" },
    { id: "bigger", label: "Bigger text" },
    { id: "smaller", label: "Smaller text" },
    { id: "up", label: "Move subtitles up" },
    { id: "down", label: "Move subtitles down" },
    { id: "reset", label: "Reset size and position" },
    { id: "help", label: "Show shortcut help" },
  ],
  // A binding: { code, alt, ctrl, shift, meta }. null = disabled.
  BIND_DEFAULT: {
    all: { code: "KeyX", alt: true }, line1: { code: "Digit1", alt: true }, line2: { code: "Digit2", alt: true },
    pinyin: { code: "KeyP", alt: true }, bigger: { code: "ArrowUp", alt: true }, smaller: { code: "ArrowDown", alt: true },
    up: { code: "PageUp", alt: true }, down: { code: "PageDown", alt: true }, reset: { code: "Digit0", alt: true },
    help: { code: "KeyH", alt: true },
  },
  norm: (b) => (b ? { code: b.code, alt: !!b.alt, ctrl: !!b.ctrl, shift: !!b.shift, meta: !!b.meta } : null),
  matches: (b, e) => !!b && e.code === b.code && e.altKey === !!b.alt && e.ctrlKey === !!b.ctrl && e.shiftKey === !!b.shift && e.metaKey === !!b.meta,
  same: (a, b) => !!a && !!b && a.code === b.code && !!a.alt === !!b.alt && !!a.ctrl === !!b.ctrl && !!a.shift === !!b.shift && !!a.meta === !!b.meta,
  keyName: (code) => {
    const m = { ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", PageUp: "PgUp", PageDown: "PgDn", Space: "Space",
      Minus: "-", Equal: "=", BracketLeft: "[", BracketRight: "]", Semicolon: ";", Quote: "'", Comma: ",", Period: ".", Slash: "/", Backslash: "\\", Backquote: "`" };
    return m[code] ?? code.replace(/^Key|^Digit|^Numpad/, (p) => (p === "Numpad" ? "Num" : ""));
  },
  label: (b) => {
    if (!b) return "—";
    const mac = /Mac/.test(navigator.platform);
    const p = [];
    if (b.ctrl) p.push(mac ? "⌃" : "Ctrl");
    if (b.alt) p.push(mac ? "⌥" : "Alt");
    if (b.shift) p.push(mac ? "⇧" : "Shift");
    if (b.meta) p.push(mac ? "⌘" : "Win");
    p.push(globalThis.BISUB.keyName(b.code));
    return p.join(mac ? "" : "+");
  },
};
