#!/usr/bin/env bash

while IFS= read -r file; do
  size_before=$(du -h "$file" | awk '{print $1}')
  echo -n "Converting $file... before $size_before"

  dir=$(dirname "$file")
  outfile="${dir}/profile.webp"

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

  # Original nach erfolgreicher Konvertierung löschen
  rm "$file"
done < <(find content/quellen -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.svg" \))

git add content/quellen/
