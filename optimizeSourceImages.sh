#!/usr/bin/env bash
set -euo pipefail

shopt -s nullglob

THRESHOLD_BYTES=${THRESHOLD_BYTES:-1024}   # 1 KiB; z.B. THRESHOLD_BYTES=2048 ./script.sh

for file in public/files/quellen-img/*/*.webp; do
  before_bytes=$(stat -f %z "$file")
  tmp="${file}.tmp.$$"

  magick "$file" \
    -resize "350x350" \
    -quality 85 \
    "$tmp"

  after_bytes=$(stat -f %z "$tmp")
  diff=$(( after_bytes - before_bytes ))
  absdiff=${diff#-}  # Betrag (absolute value) in bash

  # Nur übernehmen, wenn Änderung >= Threshold
  if (( absdiff >= THRESHOLD_BYTES )); then
    # Optional: nur wenn kleiner (typisch fürs "optimieren")
    if (( after_bytes < before_bytes )); then
      before_kb=$(( before_bytes / 1024 ))
      after_kb=$(( after_bytes / 1024 ))
      diff_kb=$(( absdiff / 1024 ))
      echo "Optimize $file... ${before_kb}KB -> ${after_kb}KB (-${diff_kb} KB)"
      mv -f "$tmp" "$file"
    else
      # Größer geworden: nicht übernehmen (sonst "verschlechtert" man)
      rm -f "$tmp"
    fi
  else
    # Änderung zu klein -> ignorieren
    rm -f "$tmp"
  fi
done

git add public/files/quellen-img/
