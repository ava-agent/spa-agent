# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Massage & SPA knowledge encyclopedia mobile app (按摩 SPA 知识大全) built with Expo + React Native. It's a static content browsing app — no user login required. Users browse categorized knowledge articles about massage techniques, essential oils, acupoints, and SPA etiquette. Content is stored as a local JSON file (`data/knowledge.json`), with favorites persisted via AsyncStorage.

The main application code lives inside `massage_spa_guide/`.

## Commands

All commands run from `massage_spa_guide/`:

```bash
pnpm dev              # Start both backend server and Expo Metro (concurrently)
pnpm dev:server       # Start backend server only (tsx watch)
pnpm dev:metro        # Start Expo Metro bundler for web
pnpm build            # Build server with esbuild
pnpm check            # TypeScript type check (tsc --noEmit)
pnpm lint             # ESLint via expo lint
pnpm format           # Prettier format all files
pnpm test             # Run tests with Vitest
pnpm db:push          # Generate and run Drizzle migrations
```

Package manager: **pnpm** (v9.12.0)

## Architecture

### Frontend (Expo Router file-based routing)

- `app/(tabs)/` — Bottom tab screens: Home (index), Search, Favorites
- `app/category/[id]` — Category detail page listing articles
- `app/knowledge/[id]` — Individual knowledge article detail
- `app/oauth/` — OAuth callback handler (for native auth flow)
- `app/_layout.tsx` — Root layout with tRPC/React Query providers and theme setup

### Backend (Express + tRPC)

- `server/_core/` — Framework-level code (do NOT modify): Express setup, tRPC context, auth middleware, LLM/image/voice/notification helpers
- `server/routers.ts` — tRPC API routes (add feature routers here)
- `server/db.ts` — Database query helpers (add queries here)
- `server/storage.ts` — S3 file storage helpers

### Data Layer

- `data/knowledge.json` — All knowledge content (categories + articles) loaded client-side
- `drizzle/schema.ts` — Database table definitions (MySQL via Drizzle ORM)
- `drizzle/relations.ts` — Table relationships
- `drizzle/migrations/` — Auto-generated SQL migrations

### Shared Code

- `shared/types.ts` — Re-exports from drizzle schema + error types
- `shared/const.ts` — Shared constants (cookie name, etc.)
- `lib/trpc.ts` — tRPC React client setup
- `lib/_core/` — Framework-level client code (do NOT modify)

### Styling & Theme

- NativeWind (Tailwind CSS for React Native) with `tailwind.config.js`
- Theme colors defined in `theme.config.js` — warm browns/earth tones matching SPA aesthetic
- `constants/theme.ts` re-exports from `lib/_core/theme.ts`
- `hooks/use-colors.ts` and `hooks/use-color-scheme.ts` for runtime theme access
- Dark mode supported via `userInterfaceStyle: "automatic"` in app config

### Path Aliases

- `@/*` → project root (`./`)
- `@shared/*` → `./shared/*`

## Key Conventions

- `_core/` directories (in `server/`, `lib/`, `shared/`) are framework infrastructure — avoid modifying
- Use `publicProcedure` for unauthenticated tRPC routes; `protectedProcedure` when auth is needed
- This app currently uses no backend database features — content is all in `data/knowledge.json`
- tRPC v11: `transformer` (superjson) must be inside `httpBatchLink`, not at root `createClient` level
- UI language is Chinese (Simplified)
