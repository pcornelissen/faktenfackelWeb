#!/usr/bin/env bash
set -euo pipefail

# FF-19: Verhindert client-seitige @nuxt/content-Queries in app/.
# Solche Aufrufe laufen im Browser über WASM-SQLite und ziehen den kompletten
# Collection-Dump (1-6 MB) über die Leitung. Alle Content-Abfragen in app/
# muessen stattdessen ueber die Server-Routen unter /api/content/* (bzw.
# /api/references, /api/search) laufen. Server-Code (server/) darf
# queryCollection aus #content/server nutzen und ist hier nicht betroffen.
# Die Dev-Tools unter app/**/dev/ sind ausgenommen.

PATTERN='queryCollection\(|queryCollectionItemSurroundings\(|queryCollectionNavigation\(|queryCollectionSearchSections\(|useSearchCollection\('

MATCHES=$(grep -rnE "$PATTERN" app --include='*.vue' --include='*.ts' --exclude-dir=dev 2>/dev/null || true)

if [[ -n "$MATCHES" ]]; then
  echo "FAIL: Client-seitige Content-Queries in app/ gefunden." >&2
  echo "      Diese muessen ueber Server-Routen (/api/content/*, /api/references, /api/search) laufen," >&2
  echo "      sonst laedt der Browser wieder MB-grosse WASM-Dumps (siehe FF-19)." >&2
  echo "$MATCHES" >&2
  exit 1
fi

echo "OK: keine client-seitigen Content-Queries in app/."
