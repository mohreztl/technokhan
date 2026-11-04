-- Extend the product catalog with TechnoKhan variants, warranty and merchandising data.
ALTER TABLE "Product" ADD COLUMN "colors" JSONB,
ADD COLUMN "warranties" JSONB,
ADD COLUMN "salesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "editorChoice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "dealEndsAt" TIMESTAMP(3);

CREATE INDEX "Product_salesCount_idx" ON "Product"("salesCount");
