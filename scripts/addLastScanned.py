#!/usr/bin/env python3
"""
Adds lastScanned field to all quellen/index.md and quellenlinks files
that don't have it yet, initializing from the date field.

Usage: python3 scripts/addLastScanned.py
Run from: website/
"""

import os
import re
import glob

def find_md_files():
    """Find all quellen index.md and quellenlinks files."""
    quellen = glob.glob('content/quellen/*/*/*.md', recursive=False)
    quellenlinks = glob.glob('content/quellen/*/*/links/**/*.md', recursive=True)
    # Exclude zitate
    quellen = [f for f in quellen if '/zitate/' not in f]
    return quellen + quellenlinks

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if lastScanned already present
    if re.search(r'^lastScanned:', content, re.MULTILINE):
        return False

    # Extract date value from frontmatter
    date_match = re.search(r'^date:\s*(\d{4}-\d{2}-\d{2})', content, re.MULTILINE)
    if not date_match:
        print(f"  SKIP (no date field): {filepath}")
        return False

    date_value = date_match.group(1)

    # Insert lastScanned directly after the date line
    new_content = re.sub(
        r'^(date:\s*\d{4}-\d{2}-\d{2})',
        f'\\1\nlastScanned: {date_value}',
        content,
        count=1,
        flags=re.MULTILINE
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True

def main():
    files = find_md_files()
    updated = 0
    skipped = 0

    for filepath in sorted(files):
        if process_file(filepath):
            updated += 1
        else:
            skipped += 1

    print(f"\nDone: {updated} files updated, {skipped} skipped (already have lastScanned or no date).")

if __name__ == '__main__':
    main()
