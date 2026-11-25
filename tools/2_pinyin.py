import json, sys, pathlib
d = pathlib.Path(sys.argv[1])
p = d / "isolated.js"; s = p.read_text()
for old, new in [
  ('this.textNodes=[new Text,new Text]', 'this.textNodes=[document.createElement("span"),document.createElement("span")]'),
  ('let r=t[s]??"";n.data!==r&&(n.data=r)', 'let r=t[s]??"";n.__dsxv!==r&&(n.__dsxv=r,globalThis.dsxRender?globalThis.dsxRender(n,r):n.textContent=r)'),
]:
    assert s.count(old) == 1, old
    s = s.replace(old, new)
p.write_text(s)
mp = d / "manifest.json"; m = json.loads(mp.read_text())
for cs in m["content_scripts"]:
    if cs.get("world") == "ISOLATED" and cs["js"] == ["isolated.js"]:
        cs["js"] = ["pinyin-pro.js", "dsx-pinyin.js", "isolated.js"]
mp.write_text(json.dumps(m, indent=2) + "\n")
