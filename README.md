# Protocol — Gay Scene Library & Negotiation Templates

A privacy-first, local-first toolkit of **55 structured scene plans, language packs, a 55-task library, negotiation checklists, partner comparison links, and offline Markdown exports** built for adult gay male kink dynamics.

## Core Architecture

- **55 Structured Markdown + YAML Scenes** (`content/scenes/`): Organized across 8 categories (Negotiation & Foundation, Pup Play & Training, Ownership/Collar/Protocol, Leather & Gear, Service & Structured Time, Denial/Control/Challenge, Impact/Bondage/Sensation, and Supporting Modules).
- **Language Packs** (`content/language-packs/`) and **Task Libraries** (`content/task-libraries/`): Modular phrase packs and a reusable 55-task service/pup/inspection library, shown on the library home and included in the offline Markdown export.
- **Zero Server Storage**:
  - In-progress checklists and private post-scene notes persist strictly in browser `localStorage` (`protocol_draft_<sceneId>`, `protocol_saved_scenes`).
  - Partner Share Links compress responses via `lz-string` directly into the URL hash fragment (`#share=...`) and expire automatically after 72 hours.
- **Live Scene Conductor** (`src/components/SceneTimer.tsx`, `src/lib/conductor.ts`): Beat-synchronized timer with live beat progress, prev/next beat stepping, configurable check-in alerts, and optional Web Audio chime.
- **Offline & Print-First**: Static Next.js export (`output: "export"`), one-click `.md` export (Obsidian-compatible), full-library Markdown bundle, and print-optimized `@media print` layouts.

## Development & Verification

```bash
npm install
npm run validate:scenes   # Validate all scene, language-pack, and task-library Markdown+YAML templates
npm test                  # Run Node unit test suite (tests/core.test.mjs)
npx tsc --noEmit          # TypeScript strict check
npm run lint              # ESLint check
npm run build             # Build static export into out/
```

Serve the built static export locally:

```bash
npx serve out
```
