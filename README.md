# FE Weekly Wishlist

A voting app where team members propose frontend sharing topics and vote to decide priorities.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4
- **Backend**: Google Apps Script + Google Sheets
- **Build**: Vite + `vite-plugin-singlefile` (bundles into a single HTML file for GAS deployment)

## Development

```bash
npm install
npm run dev        # Start local dev server (uses Mock API)
npm run typecheck  # TypeScript type checking
```

During local development, `google.script.run` is automatically replaced by a mock layer (`src/mocks/googleApi.ts`) — no GAS connection needed.

## Deployment

```bash
npm run push       # Build + clasp push to GAS
```

Pushing to `main` triggers automatic deployment via GitHub Actions.

For manual deployment, install [clasp](https://github.com/google/clasp) and authenticate with `clasp login`.

## Google Sheets Setup

Two sheets are required:

| Sheet | Columns |
|---|---|
| `💡 主題願望清單` | A=Votes, B=Title, C=Description, D=Creator Email, E=UUID |
| `投票紀錄` | A=Voter Email, B=UUID, C=Timestamp |

Also add `ADMIN_EMAIL` in GAS **Project Settings → Script Properties**, with the admin's email as the value.

## Project Structure

```
src/
├── App.tsx              # Main component (all state and business logic)
├── components/          # Presentational components
├── types/               # TypeScript type definitions
├── mocks/googleApi.ts   # Mock API for local development
├── server/Code.js       # GAS backend (Google Sheets operations)
└── google.d.ts          # Type declarations for google.script.run
```
