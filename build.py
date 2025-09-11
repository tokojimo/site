from pathlib import Path
import json
import shutil
import sys
from jinja2 import Environment, FileSystemLoader, select_autoescape

SRC_DIR = Path('src')
DIST_DIR = Path('dist')
TEMPLATE_DIR = Path('templates')

env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(['html', 'xml'])
)
layout = env.get_template('layout.html')

manifest_path = DIST_DIR / 'manifest.json'
js_file = 'script.js'
css_file = 'style.css'
if manifest_path.exists():
    with manifest_path.open(encoding='utf-8') as f:
        manifest = json.load(f)
    entry = manifest.get('src/js/script.js', {})
    js_file = entry.get('file', js_file)
    css_file = entry.get('css', [css_file])[0]

with Path('pages.json').open(encoding='utf-8') as f:
    pages = json.load(f)

for idx, page in enumerate(pages):
    if not all(key in page for key in ('file', 'title', 'description')):
        print(f"Entrée {idx} invalide dans pages.json", file=sys.stderr)
        sys.exit(1)
    src_path = SRC_DIR / page['file']
    if not src_path.exists():
        print(f"Fichier source manquant: {src_path}", file=sys.stderr)
        sys.exit(1)

DIST_DIR.mkdir(exist_ok=True)

for page in pages:
    src_path = SRC_DIR / page['file']
    content = src_path.read_text(encoding='utf-8')
    html = layout.render(
        title=page['title'],
        description=page['description'],
        content=content,
        js_file=js_file,
        css_file=css_file
    )
    dest_path = DIST_DIR / page['file']
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    dest_path.write_text(html, encoding='utf-8')

for item in Path('.').iterdir():
    if item.name in {SRC_DIR.name, TEMPLATE_DIR.name, DIST_DIR.name, 'node_modules', 'pages.json', 'build.py', 'package.json', 'package-lock.json', 'requirements.txt', '.git', '.gitignore'}:
        continue
    dest = DIST_DIR / item.name
    if item.is_dir():
        shutil.copytree(item, dest, dirs_exist_ok=True)
    else:
        shutil.copy2(item, dest)
