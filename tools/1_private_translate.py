import json, re, sys, pathlib
d = pathlib.Path(sys.argv[1])
def sub(f, old, new):
    p = d / f; s = p.read_text()
    assert s.count(old) == 1, (f, old[:40], s.count(old))
    p.write_text(s.replace(old, new))
p = d / "isolated.js"; s = p.read_text()
m = re.search(r'var Z=async e=>\{.*?await X\("translate",e\)\};', s)
assert m
s = s.replace(m.group(0), 'var Z=async e=>{let r=await chrome.runtime.sendMessage({type:"dsx-translate",dialogues:e.dialogues,source:e.source,target:e.target,trait:e.trait});if(!r||!r.ok)throw new Error(r?.error??"translate failed");return{originals:r.originals,translations:r.translations,session:void 0}};')
p.write_text(s)
sub("isolated.js", 'var X=async(e,t)=>{', 'var X=async(e,t)=>{throw new Error("server disabled (private build)");')
sub("popup.js", 'var Y=async(a,e)=>{', 'var Y=async(a,e)=>{throw new Error("server disabled (private build)");')
sub("popup.js", 'return await Y("check",{apiKey:e,language:n,timezone:o})', 'return{content:"Private build: translation via Google, no account needed."}')
mp = d / "manifest.json"; m = json.loads(mp.read_text())
m["host_permissions"] = [h for h in m["host_permissions"] if not h.startswith("https://*.")] + ["https://clients5.google.com/*"]
m["background"] = {"service_worker": "background.js"}
m["version_name"] = "2.71.1-private"
m.pop("browser_specific_settings", None)
mp.write_text(json.dumps(m, indent=2) + "\n")
