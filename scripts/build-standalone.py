#!/usr/bin/env python3
"""Optional zero-dependency export of the native-ESM, no-build website to a portable HTML.

Not needed to run the modular project. All runtime code remains pure Vanilla JS.
"""
from __future__ import annotations
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
IMPORT_RE=re.compile(r"^import\s+\{\s*([^}]+?)\s*\}\s+from\s+['\"]([^'\"]+)['\"];?\s*$",re.M)
EXPORT_RE=re.compile(r'^export\s+(?:async\s+)?(?:function|class|const|let)\s+([A-Za-z_][A-Za-z_0-9]*)',re.M)
DYNAMIC_RE=re.compile(r"import\(['\"]([^'\"]+)['\"]\)")
modules={}
order=[]

def resolve(current: str, relative: str) -> str:
    return (Path(current).parent / relative).as_posix() if not relative.startswith('../') else str(Path(current).parent.joinpath(relative))

def normalize(current: str, relative: str) -> str:
    parts=[]
    for part in str(Path(current).parent / relative).split('/'):
        if part=='..':
            parts.pop()
        elif part!='.': parts.append(part)
    return '/'.join(parts)

def visit(path: str):
    if path in modules: return
    content=(ROOT/path).read_text(encoding='utf-8')
    imports=[]
    for names,rel in IMPORT_RE.findall(content):
        dependency=normalize(path,rel)
        visit(dependency)
        imports.append((names,dependency))
    modules[path]=(content,imports)
    order.append(path)

visit('src/app.js')
# Dynamic modules are not referenced in ESM imports; include their own dependency tree.
for path in ['src/feedback/audio.js','src/visuals/experience-canvas.js','src/visuals/gold-reactor.js']:
    visit(path)
# Avoid executing app until dynamic modules are registered.
order.remove('src/app.js')
order.append('src/app.js')
worker_src=(ROOT/'src/workers/field-worker.js').read_text(encoding='utf-8')
compiled=[]
for path in order:
    source,imports=modules[path]
    source=IMPORT_RE.sub('',source)
    exports=EXPORT_RE.findall(source)
    source=re.sub(r'^export\s+', '', source, flags=re.M)
    def dynamic_replace(match):
        dep=normalize(path,match.group(1))
        if dep not in modules: raise RuntimeError(f'Missing dynamic import: {path} -> {dep}')
        return f'Promise.resolve(__modules[{json.dumps(dep)}])'
    source=DYNAMIC_RE.sub(dynamic_replace,source)
    if path=='src/visuals/experience-canvas.js':
        source=source.replace("new Worker(new URL('../workers/field-worker.js', import.meta.url), { type: 'module' })",f'new Worker(URL.createObjectURL(new Blob([{json.dumps(worker_src)}], {{type:"text/javascript"}})))')
    if 'import.meta' in source: raise RuntimeError(f'Unconverted import.meta in {path}')
    header='\n'.join(f'const {{ {names.strip()} }} = __modules[{json.dumps(dep)}];' for names,dep in imports)
    body=f'__modules[{json.dumps(path)}] = (() => {{\n{header}\n{source}\nreturn {{{", ".join(exports)}}};\n}})();'
    compiled.append(body)
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'\s*<link rel="stylesheet" href="./assets/css/[^\"]+">','',html)
html=html.replace('<script type="module" src="./src/app.js"></script>', '')
styles='\n'.join((ROOT/'assets/css'/name).read_text(encoding='utf-8') for name in ('base.css','experience.css','motion.css','next.css'))
html=html.replace('</head>', '<style>\n'+styles.replace('</style>','<\\/style>')+'\n</style>\n</head>')
js='\nconst __modules = Object.create(null);\n'+'\n'.join(compiled)+'\n'
html=html.replace('</body>', '<script>\n'+js.replace('</script>','<\\/script>')+'\n</script>\n</body>')
output=ROOT/'Gnew_Next_Standalone.html'
output.write_text(html,encoding='utf-8')
print('Created:',output, 'modules:',len(modules),'bytes:',output.stat().st_size)
