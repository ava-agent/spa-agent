# 按摩 SPA 知识大全

A comprehensive massage and SPA knowledge encyclopedia app built with Expo + React Native, deployed on Vercel with Supabase PostgreSQL.

**Live**: https://massagespaguide.vercel.app

## Screenshots

<p align="center">
  <img src="massage_spa_guide/docs/screenshots/home.png" width="200" alt="Home" />
  <img src="massage_spa_guide/docs/screenshots/category.png" width="200" alt="Category" />
  <img src="massage_spa_guide/docs/screenshots/article.png" width="200" alt="Article" />
  <img src="massage_spa_guide/docs/screenshots/search.png" width="200" alt="Search" />
</p>

## Features

- 22 knowledge articles across 5 categories (basics, techniques, oils, acupoints, SPA etiquette)
- Full-text search with hot search tags
- Favorites with local persistence (AsyncStorage)
- Responsive layout (mobile, tablet, desktop)
- Dark mode support
- Sub-heading detection for structured content rendering
- Related article recommendations

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Expo 54 + React Native + TypeScript |
| Styling | NativeWind (Tailwind CSS for RN) |
| Routing | Expo Router (file-based) |
| Backend | Express + tRPC v11 |
| Database | Supabase PostgreSQL + Drizzle ORM |
| Deployment | Vercel (static + serverless) |

## Getting Started

```bash
cd massage_spa_guide
pnpm install
pnpm dev
```

## Project Structure

```
massage_spa_guide/
  app/              # Expo Router screens
    (tabs)/         # Bottom tab navigation (Home, Search, Favorites)
    category/[id]   # Category listing
    knowledge/[id]  # Article detail
  api/              # Vercel serverless entry point
  data/             # Static knowledge content (JSON)
  server/           # Express + tRPC backend
  drizzle/          # Database schema & migrations
  components/       # Reusable UI components
  lib/              # Client utilities (tRPC, theme)
  hooks/            # React hooks
```

## Deployment

The app is deployed on Vercel with the following setup:

- **Frontend**: Expo web export (`npx expo export --platform web`) served as static files
- **API**: Express app as Vercel serverless function via `api/index.ts`
- **Database**: Supabase PostgreSQL (table: `spa_users`)

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | Session signing key |
| `EXPO_PUBLIC_API_BASE_URL` | Optional (leave empty for same-origin) |

## License

MIT
