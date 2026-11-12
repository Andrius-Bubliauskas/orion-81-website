# orion-81.io

This folder is the whole orion-81.io website, version 3.2.1. A bar at the top of every page links its five parts.

## What it holds

* **Home** (`index.html`): the front page and the one visitors land on. It says why Orion-81 exists (its revenue is meant to pay
  software engineers and graphic designers whose work has been affected by AI), how that sits with the idea of sharing what AI gives with the
  people it affects, and it has two doors: the Orion-81 devlog and the archived Orion POC.
* **Orion-81 devlog** (`devlog/index.html`): the state of Orion-81, the game being made now. It holds a dated devlog, what the game
  will be, the milestone road with today's status, how it is made, and a searchable table of the automated tests of the game's
  rules as of 29 October 2026. `devlog/progress.html` is the interactive progress chart, a public copy of the project tracker's time line.
* **Progress** (`devlog/progress.html`): the progress chart, with a second bar for its agent-provenance view.
* **Orchestration** (`orchestration/index.html`): how several developers, each directing their own AI agents, can work towards one
  goal through one shared record. It defines the word, shows how Orion-81 is run today by one developer and one orchestrator, and
  sets out a proposal, for discussion, for two developers sharing the project. It is adapted from a presentation made with Claude
  for Andrius on 29 October 2026.
* **Fable 5.2 conduct-of-work review** (`orchestration/fable-5-2-review/index.html`): the second view under the Orchestration tab, reached by a
  row of two sub-tabs. A 16-slide presentation of the conduct-of-work review made on 10 November 2026.
* **Orion POC** (`poc/index.html`): the earlier proof-of-concept site, kept as it was published on 13 October 2026; three of its ship viewers and the note in its tab bar were changed in November 2026,
  and everything else is byte for byte as published. The page shows it in a frame under the tab bar and a subtab bar. Its statements are those of that date. The second
  subtab, **Gallery** (`poc/gallery/index.html`), holds the pictures and clips of that proof of concept.

Old links to the proof-of-concept site (for example a link to one of its sections, or one that chooses a language) are passed on
to the Orion POC tab, and the old Gallery address (`gallery/index.html`) passes on to `poc/gallery/index.html`. Old links to sections of the earlier Orion-81 page (#road, #tests and so on) are passed on to the devlog.

## How to open it

* Double-click `index.html`. Everything works straight from the disk.
* Or serve this folder with any local static web server and open the address it prints.

## Third parties

The Orion POC tab loads three.js (MIT licence) and Google Fonts (SIL Open Font Licence) from public content delivery networks
when it is viewed. The home page, the devlog and the Orchestration page load nothing from other sites. There are no trackers, no cookies and no forms.
The home page links to one page on anthropic.com as further reading; the link loads nothing until it is followed.

## Trademarks

Anthropic, Claude and Claude Code are trademarks of Anthropic, PBC. Orion-81 is independent and is not affiliated with,
sponsored, endorsed or funded by Anthropic.

## Discord

The home page links to the Orion-81 Discord server (https://discord.gg/CjzXsa8nw) with Discord's official Symbol, self-hosted and unaltered in `assets/img/discord/`. The link loads nothing from Discord until it is followed. Discord and the Discord logo are trademarks of Discord Inc.; used under Discord's brand guidelines. Orion-81 is not affiliated with or endorsed by Discord.

## Fonts

The Orchestration page shows the slides of the presentation "Two orchestrators, one game" in its own two typefaces, Space Grotesk and IBM Plex Sans, self-hosted in `fonts/` and used on that page only (`css/orchestration-slides.css`). Both are licensed under the SIL Open Font License, Version 1.1; the licence texts are beside the files (`fonts/space-grotesk/OFL.txt`, `fonts/ibm-plex-sans/LICENSE.txt`), and `fonts/SHA256SUMS.txt` lists the files, which are the projects' official WOFF2 releases, unmodified (no subsetting or renaming, so the Reserved Font Name "Plex" is not triggered). This is the owner's written exception, scoped to the Orchestration slides. Nothing is loaded from other sites.

## Rights

(c) 2026 Andrius Bubliauskas. All rights reserved. See `NOTICE`.
