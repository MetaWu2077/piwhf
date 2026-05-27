# AdAIWiz multi-agent development framework

AdAIWiz is a Shopify app for merchants who need fast, batch generation of paid-social AI video ads from Shopify product data.

## Agent roster

| Agent | Mission | Current responsibilities |
| --- | --- | --- |
| Product Manager Agent | Own merchant workflows, MVP scope, pricing assumptions, launch checklist | Define MVP and acceptance criteria |
| Shopify Architect Agent | Own Shopify app architecture, OAuth, scopes, Admin API, webhooks, Billing readiness | React Router app, Prisma, product import, app config |
| Frontend Agent | Own embedded admin UX with Shopify App Bridge / Polaris web components | Campaign list, product selection, job detail UI |
| Backend Agent | Own persistence, job state, async queue boundaries, cost controls | Prisma models, job/variant creation, status transitions |
| AI Video Agent | Own video prompt generation and provider handoff | Seedance/Veo-style prompt and `belt` command handoff |
| Ads Strategy Agent | Own paid-social creative strategy | Meta Reels structure: hook/problem/solution/CTA, variants |
| QA / Security Agent | Own quality gates, auth boundaries, data isolation, release checks | Typecheck/lint/build, shop-scoped records, no cross-shop reads |

## Workflow pattern

1. PM Agent writes/updates the product spec and acceptance criteria.
2. Shopify Architect Agent checks Shopify docs before API/schema work.
3. Backend Agent implements data model and server actions.
4. Frontend Agent implements merchant workflow screens.
5. AI Video + Ads Strategy Agents generate prompts, scripts, hooks, variants.
6. QA / Security Agent runs gates and documents issues.
7. Coordinator merges decisions into `docs/multi-agent/decision-log.md`.

## MVP scope

- Embedded Shopify app scaffolded from the official React Router template.
- Read products through Admin GraphQL.
- Generate ad creative briefs from product data.
- Persist generation jobs and creative variants.
- Show an AI video generation handoff command for `belt` / inference.sh.
- Support status transitions for queueing and saving generated video URLs.

## Out of scope for first iteration

- Real background worker execution.
- Billing and plan enforcement.
- Direct Meta Ads publishing.
- Full manual product entry.
- Team collaboration and approvals.

## Next iteration backlog

1. Add a real queue worker for batch video generation.
2. Add provider abstraction for Seedance, Veo, Wan, and avatar video.
3. Add billing plans and usage quotas.
4. Add campaign templates by niche and funnel stage.
5. Add export package: video, primary text, headline, CTA, UTM naming.
6. Add TikTok-specific creative strategy.
