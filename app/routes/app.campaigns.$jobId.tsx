import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Form, useLoaderData, useNavigation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { getVideoCommand } from "../services/creative.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const job = await prisma.generationJob.findFirst({
    where: { id: params.jobId, shop: session.shop },
    include: { variants: true },
  });

  if (!job) {
    throw new Response("Not found", { status: 404 });
  }

  return { job, videoCommand: getVideoCommand(job) };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent"));

  const job = await prisma.generationJob.findFirst({ where: { id: params.jobId, shop: session.shop } });
  if (!job) throw new Response("Not found", { status: 404 });

  if (intent === "queue") {
    await prisma.generationJob.update({ where: { id: job.id }, data: { status: "QUEUED" } });
  }

  if (intent === "mark-ready") {
    await prisma.generationJob.update({ where: { id: job.id }, data: { status: "READY", videoUrl: String(formData.get("videoUrl") || "") } });
  }

  return { ok: true };
};

export default function CampaignDetail() {
  const { job, videoCommand } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <s-page heading={job.productTitle}>
      <s-link href="/app/campaigns">← Back to campaigns</s-link>

      <s-section heading="Creative plan">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="subdued" borderRadius="base">
            <s-heading>Hook</s-heading>
            <s-paragraph>{job.hook}</s-paragraph>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-heading>Script</s-heading>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{job.script}</pre>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-heading>AI video prompt</s-heading>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{job.prompt}</pre>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Batch variants">
        <s-stack direction="block" gap="base">
          {job.variants.map((variant) => (
            <s-box key={variant.id} padding="base" borderWidth="base" borderRadius="base">
              <s-heading>{variant.angle}</s-heading>
              <s-paragraph><strong>Hook:</strong> {variant.hook}</s-paragraph>
              <s-paragraph><strong>Primary text:</strong> {variant.primaryText}</s-paragraph>
              <s-paragraph><strong>Headline:</strong> {variant.headline}</s-paragraph>
            </s-box>
          ))}
        </s-stack>
      </s-section>

      <s-section heading="Video generation handoff">
        <s-paragraph>
          MVP handoff command for the AI Video Agent. Next iteration will execute this through a queued worker and store the returned video URL automatically.
        </s-paragraph>
        <s-box padding="base" background="subdued" borderRadius="base">
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{videoCommand}</pre>
        </s-box>
        <s-stack direction="inline" gap="base">
          <Form method="post">
            <input type="hidden" name="intent" value="queue" />
            <button type="submit" disabled={isSubmitting}>Mark queued</button>
          </Form>
          <Form method="post">
            <input type="hidden" name="intent" value="mark-ready" />
            <input name="videoUrl" placeholder="Generated video URL" />
            <button type="submit">Save video URL</button>
          </Form>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
