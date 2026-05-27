# Decision log

## 2026-05-27 — Project scaffold

- Chose Shopify official React Router template because Shopify docs recommend it for most new apps and it includes OAuth, embedded app setup, Prisma session storage, webhooks, and app config.
- Created the app under `D:/piwhf/adaiwiz`.
- Renamed package to `adaiwiz`.

## 2026-05-27 — MVP architecture

- Use Shopify Admin GraphQL to fetch merchant products.
- Use Prisma SQLite in development for session, generation job, and creative variant persistence.
- Keep generation as a handoff command first instead of executing paid video generation automatically.
- Use shop-scoped database queries for multi-tenant isolation.

## 2026-05-27 — Creative strategy

- Start with Meta Reels 9:16 UGC-style ads.
- Default script structure: 0-3s hook, 3-8s problem, 8-20s solution, 20-30s CTA.
- Generate three creative variants per job for early A/B testing.
