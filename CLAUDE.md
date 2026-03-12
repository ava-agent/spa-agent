# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Massage & SPA knowledge encyclopedia mobile app (按摩 SPA 知识大全) built with Expo + React Native. Users browse categorized knowledge articles about massage techniques, essential oils, acupoints, and SPA etiquette. The app also includes interactive tools like symptom matching, acupoint timer, daily challenges, AI advisor, and knowledge quizzes. Content is stored as local JSON files, with favorites persisted via AsyncStorage.

The main application code lives inside `massage_spa_guide/`.

**Live site**: https://spa.rxcloud.group

## Commands

All commands run from `massage_spa_guide/`:

```bash
pnpm dev              # Start both backend server and Expo Metro (concurrently)
pnpm dev:server       # Start backend server only (tsx watch)
pnpm dev:metro        # Start Expo Metro bundler for web
pnpm build            # Build server with esbuild
pnpm build:web        # Export static web build (Expo)
pnpm check            # TypeScript type check (tsc --noEmit)
pnpm lint             # ESLint via expo lint
pnpm format           # Prettier format all files
pnpm test             # Run tests with Vitest
pnpm db:push          # Generate and run Drizzle migrations
```

Package manager: **pnpm** (v9.12.0)

## Architecture

### Frontend (Expo Router file-based routing)

- `app/(tabs)/` — Bottom tab screens: Home (index), Search, AI Advisor, Favorites
- `app/category/[id]` — Category detail page listing articles
- `app/knowledge/[id]` — Individual knowledge article detail
- `app/tools/` — Interactive tools:
  - `symptom-match.tsx` — 3-step symptom-based massage recommendations
  - `acupoint-timer.tsx` — Guided massage timer with routines
  - `daily-challenge.tsx` — Daily wellness challenge
  - `challenge-stats.tsx` — Challenge statistics & streak calendar
  - `mens-guide.tsx` — Men's health massage guide
  - `mens-quiz.tsx` — Knowledge quiz game
- `app/oauth/` — OAuth callback handler (for native auth flow)
- `app/_layout.tsx` — Root layout with tRPC/React Query providers and theme setup

### Backend (Express + tRPC)

- `server/_core/` — Framework-level code (do NOT modify): Express setup, tRPC context, auth middleware, LLM/image/voice/notification helpers
- `server/_core/app.ts` — Express app exported without listen() (used by both local dev and Vercel serverless)
- `server/routers.ts` — tRPC API routes (add feature routers here)
- `server/db.ts` — Database query helpers (PostgreSQL via postgres.js)
- `server/storage.ts` — S3 file storage helpers

### Data Layer

- `data/knowledge.json` — All knowledge content (6 categories, 30 articles) loaded client-side
- `data/symptom-matrix.json` — Symptom matching rules for recommendations
- `data/routines.json` — Massage routines for acupoint timer
- `data/challenges.json` — Daily challenge definitions (30 challenges)
- `drizzle/schema.ts` — Database table definitions (PostgreSQL via Drizzle ORM, table: `spa_users`)
- `drizzle.config.ts` — Drizzle config (`dialect: "postgresql"`)

### Deployment (Vercel + Supabase)

- `api/index.ts` — Vercel serverless function entry point, imports Express app from `server/_core/app.ts`
- `vercel.json` — Build config: Expo web export, API rewrites (`/api/*` → serverless function)
- Database: Supabase PostgreSQL (project: `kevinten10`, region: `ap-southeast-1`)
- Frontend and API served from the same Vercel domain (relative URLs)

### Shared Code

- `shared/types.ts` — Re-exports from drizzle schema + error types
- `shared/const.ts` — Shared constants (cookie name, etc.)
- `lib/trpc.ts` — tRPC React client setup
- `lib/_core/` — Framework-level client code (do NOT modify)

### Styling & Theme

- NativeWind (Tailwind CSS for React Native) with `tailwind.config.js`
- Theme colors defined in `theme.config.js` — warm browns/earth tones matching SPA aesthetic
- Dark mode supported via `userInterfaceStyle: "automatic"` in app config

### Path Aliases

- `@/*` → project root (`./`)
- `@shared/*` → `./shared/*`

## Key Conventions

- `_core/` directories (in `server/`, `lib/`, `shared/`) are framework infrastructure — avoid modifying
- Use `publicProcedure` for unauthenticated tRPC routes; `protectedProcedure` when auth is needed
- tRPC v11: `transformer` (superjson) must be inside `httpBatchLink`, not at root `createClient` level
- UI language is Chinese (Simplified)
- Database table renamed to `spa_users` / `spa_role` to avoid conflicts with other apps on shared Supabase project

## Environment Variables (Vercel)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | Session signing key |
| `EXPO_PUBLIC_API_BASE_URL` | Optional — leave empty for same-origin deployment |
