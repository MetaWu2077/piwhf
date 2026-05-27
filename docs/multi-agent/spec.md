# AdAIWiz MVP spec

## Problem

Shopify merchants need a fast way to turn product catalog data into many paid-social video ad variations. Existing workflows require manual copywriting, prompt writing, video generation, file management, and ad creative packaging.

## Target users

- Shopify DTC merchants running Meta Ads.
- Small ecommerce teams without dedicated creative production.
- Agencies producing creative variants for many Shopify stores.

## Primary user journey

1. Merchant installs and opens the embedded Shopify app.
2. Merchant selects a Shopify product.
3. App generates a Meta video ad brief with hook, script, CTA, and AI video prompt.
4. App creates multiple creative variants for testing.
5. Merchant sends the prompt to the video generation provider or queues generation.
6. Merchant saves the generated video URL and exports creative assets.

## Acceptance criteria for current iteration

- App boots as a Shopify React Router app.
- `/app/campaigns` lists products from Admin GraphQL.
- Merchant can generate a job from a product.
- Job contains product summary, hook, script, prompt, and three variants.
- `/app/campaigns/:jobId` displays the plan and video generation command.
- Records are scoped to `session.shop`.
- Typecheck and lint are runnable through npm scripts.

## Key risks

- Video provider cost and latency.
- Shopify API scopes must be minimal and accepted for app review.
- Need robust queueing before enabling true batch generation.
- Need content safety and brand suitability checks before publishing videos.
