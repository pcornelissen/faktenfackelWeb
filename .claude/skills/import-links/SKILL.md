---
name: import-links
description: "Imports Quellenlinks (source links) for the Faktenfackel project from Obsidian link files into the content/quellen/ directory structure. Use this skill whenever the user mentions importing links, processing Obsidian links, adding Quellenlinks, or says something like \"neue Links importieren\", \"Links anlegen\", \"Obsidian Links abarbeiten\", or \"Quellenlinks eintragen\". The skill handles the full workflow: reading URLs from individual Obsidian .md files, opening each URL in the browser, extracting metadata, determining the correct source directory, creating Quellenlink files and (if needed) new source index.md files with a source profile image, and git-staging each file immediately after creation."
---

# Quellenlinks Import Workflow

## Overview

Process URLs from individual Obsidian `.md` files in the vault at
`/Users/cornelissen/Library/Mobile Documents/iCloud~md~obsidian/Documents/Faktenfackel /`
(note the trailing space in the folder name). Each file contains exactly one URL (no newline).
Process one file at a time, creating structured Markdown files in the `website/content/quellen/` directory tree.
Never commit or push autonomously.

## Step-by-step process

### 1. Read the next URL

List all `.md` files in the Obsidian vault:
`/Users/cornelissen/Library/Mobile Documents/iCloud~md~obsidian/Documents/Faktenfackel /`

Take the first file, read its content — the URL is the entire file content (no newline).
Do NOT delete the file yet — only delete it after successfully creating the Quellenlink file.

### 2. Open the URL and extract metadata

Open the URL in the browser (via Playwright MCP). Extract:

> **Login-Hinweis:** Facebook und Instagram zeigen Inhalte nur eingeschränkt ohne Login. Falls ein Login-Dialog erscheint oder Inhalte fehlen, bitte den Nutzer, sich im Browser anzumelden — der Playwright-Browser hat keine persistente Session. Bis zur Anmeldung kann trotzdem oft das Datum per JS extrahiert werden; der Titel und Inhalt sind dann ggf. nur eingeschränkt zugänglich.
- **Title** — in German (translate if needed; mention the original English title in the body)
- **Topic / content summary** — what does this page actually say or show?
- **Involved persons and organizations** — who appears in or is referenced by the page?
- **Publication date** — see date extraction below
- **Source platform** — facebook, reel, youtube, article, pdf, bluesky, post, x.com, instagram, video, excel

#### Date extraction (always use publication date, NOT today's date)

For **Facebook Reels**, run this JS in the browser console:
```js
const s=[...document.querySelectorAll('script:not([src])')].find(s=>s.textContent.includes('"creation_time"'));
const m=s?.textContent.match(/"creation_time":(\d+)/);
m?new Date(parseInt(m[1])*1000).toISOString().slice(0,10):null
```

For **YouTube Shorts/Videos**, run:
```js
const jsonld=document.querySelector('script[type="application/ld+json"]');
let date=null;
if(jsonld){try{const d=JSON.parse(jsonld.textContent);if(d.uploadDate)date=d.uploadDate.slice(0,10);}catch(e){}}
if(!date){const m=document.body.innerHTML.match(/"publishDate":"([^"]+)"/);if(m)date=m[1].slice(0,10);}
date
```

For articles, look for a visible publication date on the page. For Bundestagsreden or official documents, the date is usually stated in the text.

If the content is **no longer available**, skip the URL and delete it  without creating any file.

### 3. Determine the source directory

The path is `website/content/quellen/GROUP/SOURCE/`. Check whether this directory already exists:

- **Existing source** → only create a new link file, no index.md needed
- **New source** → create the directory, an `index.md`, and the `links/` subdirectory

**Naming conventions:**
- `GROUP` = broad category, e.g. `politiker`, `wissenschaft`, `medien`, `allgemein`, `organisation`
- `SOURCE` = lowercase slug of the person/organization name, e.g. `alice-weidel`, `forrest-valkai`

**Rule for dedicated source files vs. catch-all:**
- **Single link from an unknown/minor source** → place it in an existing `allgemein/` catch-all (e.g. `allgemein/facebook`, `allgemein/youtube`, `allgemein/x`, `allgemein/bluesky`) — no new index.md needed.
- **Create a dedicated source directory** only when:
  - The source already has 2+ links (either newly or previously imported), OR
  - The source is an important public figure or well-known organization that deserves its own profile.
- If a source already has 2+ existing links in a catch-all, move them to their own source directory.

### 4. Create the Quellenlink file

Path: `website/content/quellen/GROUP/SOURCE/links/YYYYMMDD.slug.md`

File name format: `YYYYMMDD` = publication date, `slug` = short descriptive lowercase kebab-case slug.

**Frontmatter template:**
```yaml
---
date: YYYY-MM-DD
title: "Titel auf Deutsch"
uri: https://...
type: facebook|reel|youtube|article|pdf|post|bluesky|x.com|instagram|video|excel
code: SOURCE-descriptive-slug
tags:
  - more-research-needed
  - RelevantTag1
  - RelevantTag2
coSources: []
---
```

**Rules:**
- `title` always in German; mention original English title in the body if applicable
- `code` must be globally unique; use pattern `SOURCE-slug` or `GROUP-SOURCE-slug` if needed for uniqueness
- `tags` always include `more-research-needed` for new entries
- `coSources` — ONLY sources directly cited or named within the linked page itself (not related articles, not the source directory owner). Use their SOURCE slug values. Leave as `[]` if none.
- Do NOT set `referenceCodes` or `quoteCodes` — these are auto-extracted by the build hook
- `verdict` is optional; only set if the content has a clear factual claim that has been assessed

**Body:** Write 1–3 sentences summarizing what the linked content shows or claims. This should be enough context to understand the link without opening it.

### 5. If this is a new source: create index.md

Path: `website/content/quellen/GROUP/SOURCE/index.md`

```yaml
---
date: YYYY-MM-DD
name: Full Name or Organization Name
description: One-line description (e.g. "AfD-Politikerin und Juristin")
tags:
  - more-research-needed
  - RelevantTag
---
```

Body structure:
```markdown
## Über die Quelle

Brief factual description (2–4 sentences). Wikipedia summary is fine as a starting point.

## Links

- https://official-website.com
- https://de.wikipedia.org/wiki/...

## Faktenfackel Bewertung

Credibility assessment: What is this source known for? Tendencies, biases, notable incidents.
Be specific and factual. This section may remain brief if little is known yet.

### Fazit

One or two sentences summarizing reliability.
```

**Profile image:** After downloading an image (see 5.1), place it as `profile.png` (or `.jpg`) directly in
`website/content/quellen/GROUP/SOURCE/`. Then run `resizeSourceImages.sh` from `website/` — it will convert to
`profile.webp`, resize to 350×350, and delete the original. The script also runs `git add content/quellen/` automatically.

### 5.1 find profile image

search the web for a good image depicting the person of use the logo for non-persons. The image should not show other people if possible.
Look for information who took the photo or has the copyright, this needs to be added with the key "imageAuthor" to the meta data of the source. If you find nothing, give a hint where you downloaded the image from. Also make sure the user is aware that he has to look for copyright notices himself to not be legally liable.

### 6. Git-stage immediately

After each file is successfully created:
```bash
cd /Users/cornelissen/projects/faktenfackel/website && git add content/quellen/GROUP/SOURCE/links/YYYYMMDD.slug.md
# For new source index.md:
git add content/quellen/GROUP/SOURCE/index.md
```

Files with `[...]` in their path need quotes.

### 7. Handle the Obsidian file after processing

**Success:** Delete the Obsidian `.md` file after successfully creating the Quellenlink file(s).

**No URL / broken URL / content unavailable:** Do NOT delete the file. Instead, rename it to indicate the problem:
- No URL found → rename to `PROBLEM kein Link - [original filename].md`
- URL no longer available (404, deleted, etc.) → rename to `PROBLEM nicht mehr verfügbar - [original filename].md`
- URL malformed or unresolvable → rename to `PROBLEM ungültige URL - [original filename].md`

This way the file is preserved for manual review without cluttering the unprocessed queue.

## Summary after each link

After each link, briefly report:
- What was created (path(s))
- Whether it was a new or existing source


## Type vocabulary

Common values for `type`: `facebook`, `reel`, `youtube`, `article`, `pdf`, `post`, `bluesky`, `x.com`, `instagram`, `video`, `excel`

Use `reel` for short-form vertical video (Facebook Reels, Instagram Reels). Use `youtube` for standard YouTube videos. Use `video` for other video platforms.