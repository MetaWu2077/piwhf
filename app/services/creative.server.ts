import type { GenerationJob } from "@prisma/client";

export type ProductInput = {
  id?: string;
  title: string;
  handle?: string | null;
  description?: string | null;
  vendor?: string | null;
  productType?: string | null;
  imageUrl?: string | null;
};

export type CreativeBrief = {
  objective: "PURCHASE" | "LEAD" | "TRAFFIC" | "AWARENESS";
  platform: "META" | "TIKTOK" | "GOOGLE";
  format: "REELS_9_16" | "FEED_1_1" | "LANDSCAPE_16_9";
  style: "UGC" | "PRODUCT_DEMO" | "PROBLEM_SOLUTION" | "BEFORE_AFTER" | "TESTIMONIAL";
  cta: string;
};

const angleBank = [
  "problem-aware hook",
  "benefit-led demo",
  "social proof angle",
  "limited-time offer",
  "comparison against old way",
];

export function summarizeProduct(product: ProductInput) {
  const parts = [product.title, product.vendor, product.productType, product.description]
    .filter(Boolean)
    .join(" — ");

  return parts.slice(0, 500);
}

export function buildCreativePlan(product: ProductInput, brief: CreativeBrief) {
  const summary = summarizeProduct(product);
  const hook = `Stop scrolling — ${product.title} makes this easier in seconds.`;
  const script = [
    `0-3s Hook: Show ${product.title} in use with bold text overlay.`,
    `3-8s Problem: Call out the daily frustration this product solves.`,
    `8-20s Solution: Demonstrate the core benefit with close-up product shots.`,
    `20-30s CTA: ${brief.cta}.`,
  ].join("\n");

  const prompt = [
    `Create a ${brief.format.replaceAll("_", ":")} ${brief.platform} paid social video ad.`,
    `Style: ${brief.style.replaceAll("_", " ").toLowerCase()}.`,
    `Product: ${summary}.`,
    product.imageUrl ? `Use this product image as visual reference: ${product.imageUrl}.` : "Use clean ecommerce product visuals.",
    "Pacing: fast hook in first 3 seconds, mobile-first composition, readable captions, realistic lighting.",
    `CTA: ${brief.cta}.`,
  ].join("\n");

  const variants = angleBank.slice(0, 3).map((angle, index) => ({
    angle,
    hook: index === 0 ? hook : `${product.title}: ${angle.replaceAll("-", " ")} for shoppers who want results fast.`,
    primaryText: `${product.title} helps shoppers get the outcome they want faster. ${brief.cta}.`,
    headline: index === 0 ? `Try ${product.title}` : `${product.title} for less friction`,
    prompt: `${prompt}\nVariant angle: ${angle}.`,
  }));

  return { summary, hook, script, prompt, variants };
}

export function getVideoCommand(job: Pick<GenerationJob, "prompt" | "productImage">) {
  const input = job.productImage
    ? { image: job.productImage, prompt: job.prompt, generate_audio: true }
    : { prompt: job.prompt, generate_audio: true, duration: 10 };

  return `belt app run bytedance/seedance-2-0-fast --input '${JSON.stringify(input).replaceAll("'", "'\\''")}'`;
}
