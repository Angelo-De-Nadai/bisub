// BiSub: translation via Google Translate (clients5 endpoint).
// Replaces the original remote "translate" service; no other server is contacted.
const ENDPOINT = "https://clients5.google.com/translate_a/t?client=dict-chrome-ex";
const CHUNK_CHARS = 3000;

const mapLang = (c, isSource) => {
  if (!c) return isSource ? "auto" : "en";
  c = c.toLowerCase().replace(/-x-.*$/, "");
  if (["zh-hans", "zh-cn", "zh-sg", "zh"].includes(c)) return "zh-CN";
  if (["zh-hant", "zh-tw", "zh-hk", "zh-mo"].includes(c)) return "zh-TW";
  return c;
};

// Merge pieces into whole sentences so each original line and its translation
// cover exactly the same time span and the translation has the full context.
// ASR captions arrive word by word; manual captions often split a sentence over cues.
const CJK = /[぀-ヿ㐀-鿿가-힯＀-￯]/;
const ENDS = /[.?!。？！…]["'”»）)]?\s*$/;
const join = (a, b) => {
  if (a === "" || /^\s/.test(b)) return a + b;
  const x = a.trimEnd().slice(-1), y = b.trimStart()[0] ?? "";
  return a.trimEnd() + (CJK.test(x) && CJK.test(y) ? "" : " ") + b.trimStart();
};
const group = (dialogues, asr) => {
  const maxMs = asr ? 5000 : 8000, maxLen = asr ? 90 : 160;
  const out = [];
  let cur = null;
  const close = () => {
    if (!cur) return;
    cur.content = cur.content.replace(/\s+/g, " ").trim();
    cur.duration = cur.end - cur.start;
    out.push(cur);
    cur = null;
  };
  for (const d of dialogues) {
    const empty = d.content.trim() === "";
    if (empty) {
      if (cur && d.duration < 1500) { cur.end = d.end; continue; }
      close();
      out.push({ ...d });
      continue;
    }
    if (cur && (d.end - cur.start > maxMs || cur.content.length + d.content.length > maxLen)) close();
    if (!cur) cur = { start: d.start, end: d.end, content: d.content };
    else { cur.end = d.end; cur.content = join(cur.content, d.content); }
    if (ENDS.test(d.content)) close();
  }
  close();
  return out;
};

const googleBatch = async (texts, sl, tl) => {
  const body = new URLSearchParams();
  for (const t of texts) body.append("q", t);
  const url = `${ENDPOINT}&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}`;
  const res = await fetch(url, { method: "POST", body, credentials: "omit", referrerPolicy: "no-referrer" });
  if (res.status !== 200) throw new Error(`Google Translate: HTTP ${res.status}`);
  const data = await res.json();
  const arr = Array.isArray(data) ? data : [data];
  const flat = arr.map((x) => (Array.isArray(x) ? x[0] : x));
  if (flat.length !== texts.length) throw new Error("Google Translate: line count mismatch");
  return flat.map((s) => String(s ?? ""));
};

const translateTexts = async (texts, sl, tl) => {
  const result = new Array(texts.length).fill("");
  const idx = [];
  texts.forEach((t, i) => { if (t.trim() !== "") idx.push(i); });
  let batch = [], size = 0;
  const flush = async () => {
    if (batch.length === 0) return;
    const tr = await googleBatch(batch.map((i) => texts[i]), sl, tl);
    batch.forEach((i, k) => { result[i] = tr[k]; });
    batch = []; size = 0;
  };
  for (const i of idx) {
    if (size + texts[i].length > CHUNK_CHARS) await flush();
    batch.push(i); size += texts[i].length;
  }
  await flush();
  return result;
};

const handle = async (msg) => {
  const originals = group(msg.dialogues, msg.trait === "ytbasr");
  const tr = await translateTexts(originals.map((d) => d.content), mapLang(msg.source, true), mapLang(msg.target, false));
  const translations = originals.map((d, i) => ({ ...d, content: tr[i] }));
  return { originals, translations };
};

if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((msg, sender, reply) => {
    if (msg?.type !== "dsx-translate") return false;
    handle(msg).then((r) => reply({ ok: true, ...r }), (e) => reply({ ok: false, error: String(e.message ?? e) }));
    return true;
  });
}
if (typeof module !== "undefined") module.exports = { handle, group, mapLang };
