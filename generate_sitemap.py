#!/usr/bin/env python3
"""Generate sitemap.html from existing HTML pages."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
SITEMAP = ROOT / "sitemap.html"

# Collect html files recursively
html_files = sorted(p for p in ROOT.rglob('*.html') if not (p == SITEMAP))

def extract_title(path: Path) -> str:
    """Extract the content of the <title> tag from an HTML file."""
    try:
        text = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        text = path.read_text(encoding='utf-8', errors='ignore')
    match = re.search(r'<title>(.*?)</title>', text, re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return path.stem

items = []
for p in html_files:
    rel = p.relative_to(ROOT).as_posix()
    if rel.endswith('index.html'):
        if rel == 'index.html':
            href = 'index.html'
        else:
            href = rel[:-10]
    else:
        href = rel
    title = extract_title(p)
    items.append(f'            <li><a href="{href}">{title}</a></li>')

items_str = "\n".join(items)

template = f"""<!DOCTYPE html>
<html lang=\"fr\">
<head>
    <meta charset=\"UTF-8\" />
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
    <meta name=\"description\" content=\"Plan du site Convertisseur Universel pour accéder rapidement à toutes les pages.\" />
    <title>Plan du site - Convertisseur Universel</title>
    <link rel=\"stylesheet\" href=\"style.css\" />
</head>
<body>
    <header>
        <p class=\"site-title\"><a href=\"index.html\">Convertisseur Universel</a></p>
    </header>
    <main>
        <h1>Plan du site</h1>
        <ul>
{items_str}
        </ul>
    </main>
    <footer>
        <nav>
            <a href=\"a-propos.html\">À propos</a>
            <a href=\"contact.html\">Contact</a>
            <a href=\"politique-de-confidentialite.html\">Confidentialité</a>
            <a href=\"conditions-generales.html\">Conditions</a>
            <a href=\"cookies.html\">Cookies</a>
            <a href=\"accessibilite.html\">Accessibilité</a>
            <a href=\"securite-des-donnees.html\">Sécurité des données</a>
            <a href=\"sitemap.html\">Plan du site</a>
        </nav>
    </footer>
</body>
</html>
"""

SITEMAP.write_text(template, encoding='utf-8')
print(f"Generated {SITEMAP}")
