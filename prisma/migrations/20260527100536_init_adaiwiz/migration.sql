-- CreateTable
CREATE TABLE "GenerationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "source" TEXT NOT NULL DEFAULT 'SHOPIFY_PRODUCT',
    "objective" TEXT NOT NULL DEFAULT 'PURCHASE',
    "platform" TEXT NOT NULL DEFAULT 'META',
    "format" TEXT NOT NULL DEFAULT 'REELS_9_16',
    "style" TEXT NOT NULL DEFAULT 'UGC',
    "productGid" TEXT,
    "productTitle" TEXT NOT NULL,
    "productHandle" TEXT,
    "productImage" TEXT,
    "productSummary" TEXT,
    "hook" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "cta" TEXT NOT NULL DEFAULT 'Shop now',
    "videoUrl" TEXT,
    "error" TEXT,
    "costCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CreativeVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "angle" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "primaryText" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "videoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreativeVariant_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "GenerationJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GenerationJob_shop_createdAt_idx" ON "GenerationJob"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "GenerationJob_shop_status_idx" ON "GenerationJob"("shop", "status");

-- CreateIndex
CREATE INDEX "CreativeVariant_jobId_idx" ON "CreativeVariant"("jobId");
