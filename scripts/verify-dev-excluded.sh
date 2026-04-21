#!/usr/bin/env bash
set -euo pipefail

OUTPUT_DIR=".output"

if [[ ! -d "$OUTPUT_DIR" ]]; then
  echo "Error: $OUTPUT_DIR not found. Run 'pnpm build' first." >&2
  exit 2
fi

MATCHES=$(grep -r -l -E "/dev/(review|api/dev)" "$OUTPUT_DIR" 2>/dev/null || true)

if [[ -n "$MATCHES" ]]; then
  echo "FAIL: Dev-Routen im Production-Output gefunden:" >&2
  echo "$MATCHES" >&2
  exit 1
fi

echo "OK: keine Dev-Routen im $OUTPUT_DIR gefunden."
