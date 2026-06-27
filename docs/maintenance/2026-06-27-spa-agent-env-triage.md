# SPA Agent Triage - 2026-06-27

## Repository

- GitHub: `ava-agent/spa-agent`
- Public URL: `https://spa.rxcloud.group`
- Category: Expo/React Native + Vercel/Supabase app

## Actions Taken

- Fast-forwarded local `main` from the pre-migration state to the remote Ark
  migration commit `a7f7ca7`.
- Added root `.env.example` with Supabase, session, API, site, and AI provider placeholders.
- Updated the root environment template so chat generation uses `ARK_API_KEY`,
  `ARK_BASE_URL`, and `ARK_CHAT_MODEL`; Forge variables are documented only for
  non-chat platform services.

## Validation

- Passed: `cd massage_spa_guide && pnpm run check`
- Passed: `cd massage_spa_guide && pnpm run lint`
- Known pre-existing failure: `cd massage_spa_guide && pnpm run test` still
  fails because the knowledge fixture expects 22 items while the current data
  has 30.
- Passed: `cd massage_spa_guide && pnpm run build`
- Passed: `scan_project.sh .` with no old provider markers, no public-client key
  risk, and no Ark-looking secrets.
- Passed: local `invokeLLM` real Ark smoke returned `hasChoices: true`,
  `hasContent: true`, and `finishReason: "stop"` without printing the secret.

## Follow-Up

- Keep server-side AI and database credentials in Vercel/Supabase secrets.
- Use existing `massage_spa_guide` scripts for build, test, and lint validation before release.
- Runtime, Vercel env, production deployment, and browser LLM verification were
  completed in the earlier Ark migration record for this repository.
