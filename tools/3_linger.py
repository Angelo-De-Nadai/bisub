import sys, pathlib
p = pathlib.Path(sys.argv[1]) / "isolated.js"; s = p.read_text()
old = 'var Nt=(e,t)=>{for(let{start:s,end:n,content:r}of e)if(t>=s&&t<n)return r;return""}'
new = 'var Nt=(e,t)=>{let h="";for(let{start:s,end:n,content:r}of e){if(r==="")continue;if(t>=s&&t<n)return r;if(n<=t&&t-n<1e3)h=r}return h}'
assert s.count(old) == 1
p.write_text(s.replace(old, new))
