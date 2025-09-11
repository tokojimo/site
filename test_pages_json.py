import json
from pathlib import Path

with Path('pages.json').open(encoding='utf-8') as f:
    json.load(f)
print('pages.json OK')
