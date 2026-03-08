# Faktenfackel – Website

Faktenfackel ist eine deutschsprachige Faktencheck- und Blog-Plattform. Diese Repository enthält den Quellcode der Website unter [faktenfackel.de](https://faktenfackel.de).

## Tech Stack

| | |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) mit `app/`-Verzeichnisstruktur |
| Content | [@nuxt/content v3](https://content.nuxt.com) — Markdown-Kollektionen, SQLite/D1 |
| UI | [@nuxt/ui v4](https://ui.nuxt.com) + Tailwind CSS v4 |
| Deployment | [Cloudflare Workers](https://workers.cloudflare.com) + D1-Datenbank |
| Paketmanager | [pnpm](https://pnpm.io) |

## Lokale Entwicklung

### Voraussetzungen

- Node.js 20+
- pnpm (`npm install -g pnpm`)

### Setup

```bash
# Abhängigkeiten installieren
pnpm install

# Git-Hooks aktivieren (einmalig)
git config core.hooksPath .githooks
```

### Entwicklungsserver starten

```bash
pnpm dev
# → http://localhost:3000
```

## Verfügbare Befehle

```bash
pnpm dev          # Entwicklungsserver
pnpm build        # Produktions-Build (Cloudflare Workers)
pnpm generate     # Statische Seiten generieren
pnpm preview      # Produktions-Build lokal vorschauen
pnpm lint         # ESLint prüfen (kein Output = OK)
pnpm lintFix      # Lint-Fehler automatisch beheben
pnpm typecheck    # TypeScript-Prüfung
```

## Qualitätssicherung

Vor jedem Push laufen automatisch Lint und Typecheck (via `.githooks/pre-push`). Der Push wird abgebrochen, wenn einer der Checks fehlschlägt.

Manuell ausführen:

```bash
pnpm lint && pnpm typecheck
```

## Deployment

Die Seite läuft auf Cloudflare Workers mit einer D1-Datenbank (`fackel1`). Das Deployment erfolgt über Wrangler:

```bash
pnpm build
npx wrangler deploy
```

Cloudflare Builder werden eingesetzt zum Deployment.
Es gibt auch Builds in Github, die werden aber nirgendwo deployed.


## Projektstruktur

```
website/
├── app/
│   ├── assets/css/       # Tailwind-Tokens und globale Styles
│   ├── components/       # Vue-Komponenten (auto-importiert, kein Präfix nötig)
│   ├── composables/      # useClaimReview, useBlogPosting (JSON-LD Schemas)
│   ├── pages/            # Routing (Nuxt file-based routing)
│   └── utils/            # contentUtils, referenceData, stringUtils
├── content/
│   ├── faktenchecks/     # Faktencheck-Artikel (verdict: false|misleading|complex|true)
│   ├── lagerfeuer/       # Blog-Artikel und Meinungsbeiträge
│   ├── glossar/          # Glossareinträge
│   └── quellen/          # Quellenverzeichnis mit Links und Zitaten
├── server/
│   ├── api/              # Nitro API-Routen (Sitemap etc.)
│   └── middleware/       # redirects.ts — HTTP-301-Weiterleitungen
├── .githooks/            # Git-Hooks (pre-push: lint + typecheck)
├── content.config.ts     # Zod-Schemas für alle Content-Kollektionen
└── nuxt.config.ts        # Nuxt-Konfiguration, Route Rules, Feeds, Sitemap
```

## Content-Kollektionen

Alle Inhalte liegen als Markdown-Dateien mit YAML-Frontmatter:

| Kollektion | Pfad | Besonderheiten |
|---|---|---|
| `faktenchecks` | `faktenchecks/**/*.md` | `verdict`-Feld (false/misleading/complex/true) |
| `lagerfeuer` | `lagerfeuer/**/*.md` | Blog und Meinungsbeiträge |
| `glossar` | `glossar/**/*.md` | `subject`-Feld |
| `zitate` | `quellen/*/*/zitate/*.md` | `code`-Feld (eindeutig) |
| `quellen` | `quellen/*/*/*.md` | Quellendetails mit optionalem Bild |
| `quellenlinks` | `quellen/*/*/links/**/*.md` | `code`-Feld (eindeutig), `uri`, `type` |

Quellenlinks und Zitate werden per `<Reference code="...">` bzw. `<QuoteReference code="...">` in Artikeln eingebunden.

## Hinweise für neue Entwickler

- **Dateinamen mit `[...]`** müssen beim `git add` in Anführungszeichen gesetzt werden:
  `git add 'app/pages/faktenchecks/[category]/[...slug].vue'`
- **Weiterleitungen** (URL-Umzüge) gehören in `server/middleware/redirects.ts` — nicht als Client-Navigation
- **Neue Komponenten** werden automatisch importiert — kein manueller Import nötig, außer für Layout-Komponenten
- **Design-Tokens** sind CSS-Custom-Properties in `app/assets/css/main.css`, kein `tailwind.config.ts` nötig
