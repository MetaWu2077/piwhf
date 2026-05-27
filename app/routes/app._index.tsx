import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  return (
    <s-page heading="AdAIWiz">
      <s-section heading="Batch AI video ads for Shopify products">
        <s-paragraph>
          Turn Shopify product data into Meta-ready video ad briefs, AI video prompts, and creative variants for faster paid-social testing.
        </s-paragraph>
        <s-stack direction="inline" gap="base">
          <s-link href="/app/campaigns">Open AI video campaigns</s-link>
        </s-stack>
      </s-section>

      <s-section heading="Multi-agent build status">
        <s-unordered-list>
          <s-list-item>Product Manager Agent: MVP workflow and acceptance criteria defined.</s-list-item>
          <s-list-item>Shopify Architect Agent: React Router app, Admin GraphQL product import, Prisma persistence.</s-list-item>
          <s-list-item>Ads Strategy Agent: Meta Reels hook/problem/solution/CTA structure.</s-list-item>
          <s-list-item>AI Video Agent: Seedance-compatible prompt and generation command handoff.</s-list-item>
          <s-list-item>QA / Security Agent: shop-scoped job queries and local quality gates.</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Next steps">
        <s-unordered-list>
          <s-list-item>Add a background queue worker for true batch video generation.</s-list-item>
          <s-list-item>Add billing and usage quotas before public launch.</s-list-item>
          <s-list-item>Add TikTok and Google creative templates.</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
