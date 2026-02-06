#!/usr/bin/env bash

shopt -s nullglob

for file in public/files/quellen-img/*/*.{jpg,png,svg}; do
  size_before=$(du -h "$file" | awk '{print $1}')
  echo -n "Converting $file... before $size_before"

  base="${file%.*}"
  outfile="${base}.webp"

  magick "$file" \
    -auto-orient \
    -strip \
    -define webp:lossless=true \
    "$outfile"
  magick "$outfile" \
    -resize "350x350" \
    -quality 85 \
    "$outfile"
  size_after=$(du -h "$outfile" | awk '{print $1}')
  echo " -> after $size_after"
  echo "done"

  # Optional: Original nach erfolgreicher Konvertierung löschen
  rm "$file"
done

git add public/files/quellen-img/
