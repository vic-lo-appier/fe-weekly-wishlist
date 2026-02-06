# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A "FE Weekly Wishlist" (許願池) app — a voting/wishlist system where team members submit and vote on frontend sharing topics. Built as a React SPA that runs inside **Google Apps Script (GAS)** as a web app, backed by Google Sheets as the database.

## Architecture

**Two-tier structure:**

- **Frontend** (`src/`): React 19 + TypeScript + Tailwind CSS v4. Bundled into a single HTML file via `vite-plugin-singlefile`, then deployed to GAS.
- **Backend** (`src/server/Code.js`): Google Apps Script server-side code. Reads/writes to two Google Sheets: `💡 主題願望清單` (wishes) and `投票紀錄` (vote log). This file is plain JS (not TypeScript) because it runs in the GAS runtime.

**Frontend ↔ Backend communication** uses `google.script.run` — GAS's built-in client-server bridge. The pattern is:
```
google.script.run
  .withSuccessHandler(callback)
  .withFailureHandler(callback)
  .serverFunction(args)
```

**Local development** uses a mock layer (`src/mocks/googleApi.ts`) that replaces `google.script.run` with in-memory stubs when `google` is undefined (i.e., outside GAS). The mock is initialized in `main.tsx`.

**Type declarations** for the GAS bridge are in `src/google.d.ts`. The `Runner` interface must be updated when adding new server functions.

## Commands

- `npm run dev` — Start Vite dev server (uses mock Google API)
- `npm run build` — Build for production and copy `src/server/*` to `dist/`
- `npm run push` — Build + push to GAS via `clasp push`
- `npm run typecheck` — TypeScript type checking (`tsc --noEmit`)

## Deployment

- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`) triggers on push to `main`. Builds the app, then uses `clasp` to push and deploy to GAS.
- **Local deploy**: `npm run push` (requires `clasp` authenticated via `~/.clasprc.json`)
- `.clasp.json` configures the GAS script ID and sets `rootDir` to `./dist`

## Key Conventions

- UI text is in **Traditional Chinese (zh-TW)**
- Styling uses Tailwind utility classes directly in JSX — no separate CSS modules
- Components are in `src/components/` with a barrel export (`index.ts`)
- All state lives in `App.tsx` — components are presentational and receive props
- Optimistic updates with rollback on failure for all mutations (add, vote, edit, delete)
- Each wish is identified by a UUID (`crypto.randomUUID()`) generated client-side
- ESLint config targets `.js`/`.jsx` files only (not `.ts`/`.tsx`) — see `eslint.config.js`

## Google Sheets Schema

Wish sheet columns: A=votes, B=title, C=description, D=creator email, E=UUID
Vote log columns: A=voter email, B=UUID, C=timestamp
