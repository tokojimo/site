import os
import json
import shutil
from jinja2 import Environment, FileSystemLoader, select_autoescape

SRC_DIR = 'src'
DIST_DIR = 'dist'
TEMPLATE_DIR = 'templates'

env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(['html', 'xml'])
)
layout = env.get_template('layout.html')

with open('pages.json', encoding='utf-8') as f:
    pages = json.load(f)

if os.path.exists(DIST_DIR):
    shutil.rmtree(DIST_DIR)
os.makedirs(DIST_DIR, exist_ok=True)

for page in pages:
    src_path = os.path.join(SRC_DIR, page['file'])
    with open(src_path, encoding='utf-8') as f:
        content = f.read()
    html = layout.render(
        title=page['title'],
        description=page['description'],
        content=content
    )
    dest_path = os.path.join(DIST_DIR, page['file'])
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(html)

# copy remaining files/directories
for item in os.listdir('.'):
    if item in {SRC_DIR, TEMPLATE_DIR, DIST_DIR, '.git', 'node_modules', '__pycache__', 'pages.json', 'migrate.py', 'build.py', 'package.json', 'package-lock.json', 'requirements.txt'}:
        continue
    src_item = item
    dest_item = os.path.join(DIST_DIR, item)
    if os.path.isdir(src_item):
        shutil.copytree(src_item, dest_item, dirs_exist_ok=True)
    else:
        shutil.copy2(src_item, dest_item)
