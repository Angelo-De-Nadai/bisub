// BiSub private build: render Chinese subtitles with pinyin above each character.
// Uses the bundled pinyin-pro (MIT, v3.29.5) — runs locally, no network.
(() => {
  const HAN = /[㐀-鿿豈-﫿]/;
  globalThis.dsxRender = (el, text) => {
    el.replaceChildren();
    if (!text) return;
    const P = globalThis.pinyinPro;
    if (!P || !HAN.test(text)) { el.textContent = text; return; }
    let items;
    try { items = P.pinyin(text, { type: "all" }); } catch { el.textContent = text; return; }
    if (!Array.isArray(items) || items.map((i) => i.origin).join("") !== text) { el.textContent = text; return; }
    let buf = "";
    const flush = () => { if (buf) { el.appendChild(document.createTextNode(buf)); buf = ""; } };
    for (const it of items) {
      if (!it.isZh) { buf += it.origin; continue; }
      flush();
      const rb = document.createElement("ruby");
      rb.appendChild(document.createTextNode(it.origin));
      const rt = document.createElement("rt");
      rt.textContent = it.pinyin;
      rb.appendChild(rt);
      el.appendChild(rb);
    }
    flush();
  };
  const st = document.createElement("style");
  st.textContent = ".bisub-dialogue ruby{ruby-position:over}.bisub-dialogue rt{font-size:.5em;line-height:1.1;letter-spacing:0}.bisub-dialogue:empty,.bisub-dialogue:has(> span:empty){display:none!important}";
  (document.head || document.documentElement).appendChild(st);
})();
