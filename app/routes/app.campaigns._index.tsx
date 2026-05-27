import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Form, useLoaderData, useNavigation } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { buildCreativePlan, type CreativeBrief, type ProductInput } from "../services/creative.server";

type ProductListItem = ProductInput & { id: string; title: string };
type ProductsQueryNode = {
  id: string;
  title: string;
  handle?: string | null;
  description?: string | null;
  vendor?: string | null;
  productType?: string | null;
  featuredMedia?: { preview?: { image?: { url?: string | null } | null } | null } | null;
};

const PRODUCTS_QUERY = `#graphql
  query AdaiwizProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          vendor
          productType
          featuredMedia {
            preview {
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const response = await admin.graphql(PRODUCTS_QUERY, { variables: { first: 12 } });
  const json = await response.json();
  const products: ProductListItem[] = json.data.products.edges.map(({ node }: { node: ProductsQueryNode }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    vendor: node.vendor,
    productType: node.productType,
    imageUrl: node.featuredMedia?.preview?.image?.url ?? null,
  }));

  const jobs = await prisma.generationJob.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { variants: true },
  });

  return { products, jobs };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const product = JSON.parse(String(formData.get("product") || "{}")) as ProductInput;
  const brief: CreativeBrief = {
    objective: String(formData.get("objective") || "PURCHASE") as CreativeBrief["objective"],
    platform: String(formData.get("platform") || "META") as CreativeBrief["platform"],
    format: String(formData.get("format") || "REELS_9_16") as CreativeBrief["format"],
    style: String(formData.get("style") || "UGC") as CreativeBrief["style"],
    cta: String(formData.get("cta") || "Shop now"),
  };

  const plan = buildCreativePlan(product, brief);
  await prisma.generationJob.create({
    data: {
      shop: session.shop,
      status: "DRAFT",
      objective: brief.objective,
      platform: brief.platform,
      format: brief.format,
      style: brief.style,
      productGid: product.id,
      productTitle: product.title,
      productHandle: product.handle,
      productImage: product.imageUrl,
      productSummary: plan.summary,
      hook: plan.hook,
      script: plan.script,
      prompt: plan.prompt,
      cta: brief.cta,
      variants: { create: plan.variants },
    },
  });

  return { ok: true };
};

export default function CampaignsIndex() {
  const { products, jobs } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <s-page heading="AI video campaigns">
      <s-section heading="Create ad video briefs from Shopify products">
        <s-paragraph>
          Select a product and AdAIWiz will create Meta-ready hooks, scripts, prompts, and creative variants for batch AI video generation.
        </s-paragraph>
        <s-stack direction="block" gap="base">
          {products.length === 0 ? (
            <s-box padding="base" background="subdued" borderRadius="base">
              <s-paragraph>No products found. Add products to your store first or create a manual campaign in the next iteration.</s-paragraph>
            </s-box>
          ) : (
            products.map((product) => (
              <s-box key={product.id} padding="base" borderWidth="base" borderRadius="base">
                <Form method="post" id={`generate-${product.id.replaceAll(":", "-")}`}>
                  <input type="hidden" name="product" value={JSON.stringify(product)} />
                  <s-stack direction="inline" gap="base" alignItems="center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }} />
                    ) : null}
                    <s-stack direction="block" gap="small">
                      <s-heading>{product.title}</s-heading>
                      <s-paragraph>{[product.vendor, product.productType].filter(Boolean).join(" · ") || "Shopify product"}</s-paragraph>
                    </s-stack>
                    <s-box>
                      <input type="hidden" name="objective" value="PURCHASE" />
                      <input type="hidden" name="platform" value="META" />
                      <input type="hidden" name="format" value="REELS_9_16" />
                      <input type="hidden" name="style" value="UGC" />
                      <input type="hidden" name="cta" value="Shop now" />
                      <button type="submit" disabled={isSubmitting}>Generate brief</button>
                    </s-box>
                  </s-stack>
                </Form>
              </s-box>
            ))
          )}
        </s-stack>
      </s-section>

      <s-section heading="Recent generation jobs">
        <s-stack direction="block" gap="base">
          {jobs.length === 0 ? (
            <s-paragraph>No jobs yet. Generate your first campaign brief above.</s-paragraph>
          ) : (
            jobs.map((job) => (
              <s-box key={job.id} padding="base" borderWidth="base" borderRadius="base">
                <s-stack direction="inline" gap="base" alignItems="center">
                  <s-stack direction="block" gap="small">
                    <s-heading>{job.productTitle}</s-heading>
                    <s-paragraph>{job.status} · {job.platform} · {job.format} · {job.variants.length} variants</s-paragraph>
                  </s-stack>
                  <s-link href={`/app/campaigns/${job.id}`}>Open</s-link>
                </s-stack>
              </s-box>
            ))
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
