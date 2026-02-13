#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/content"

if [[ ! -d "$ROOT" ]]; then
  echo "Fehler: Startverzeichnis nicht gefunden: $ROOT" >&2
  exit 1
fi

/usr/bin/python3 - <<'PY' "$ROOT"
import os, re, sys
from collections import defaultdict

root = sys.argv[1]

# "Wort": Buchstaben/Zahlen, inkl. deutscher Umlaute/ß; Bindestrich trennt Wörter
word_re = re.compile(r"[0-9A-Za-zÀ-ÖØ-öø-ÿ]+(?:[’'][0-9A-Za-zÀ-ÖØ-öø-ÿ]+)*")

dir_counts = defaultdict(int)
total = 0

for dirpath, _, filenames in os.walk(root):
    for fn in filenames:
        if not fn.lower().endswith(".md"):
            continue

        path = os.path.join(dirpath, fn)
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception:
            continue

        words = word_re.findall(text)
        count = sum(1 for w in words if len(w) >= 3)

        rel_dir = os.path.relpath(dirpath, root)

        # Nur das Verzeichnis direkt unterhalb von "content" (Top-Level) verwenden
        # Beispiel: "Faktenchecks/2026" -> "Faktenchecks"
        if rel_dir == ".":
            top_dir = "(root)"
        else:
            top_dir = rel_dir.split(os.sep, 1)[0]

        dir_counts[top_dir] += count
        total += count

print(f"Startverzeichnis: {root}\n")
print("Pro Verzeichnis direkt unterhalb von content:")

# (root) optional ausblenden, falls gewünscht
for d in sorted(k for k in dir_counts.keys() if k != "(root)"):
    print(f"{d}\t{dir_counts[d]}")

print(f"\nGesamt (Wörter): {total}\n")
PY
