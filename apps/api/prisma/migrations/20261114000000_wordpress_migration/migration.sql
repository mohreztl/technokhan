-- WordPress migration additions: username/password auth with phpass upgrade path,
-- product slugs (SEO), DB-backed articles, and footer trust-license widgets.

ALTER TABLE "User" ADD COLUMN "username" TEXT,
ADD COLUMN "passwordHash" TEXT,
ADD COLUMN "wpPassHash" TEXT;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "coverImage" TEXT,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "author" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE INDEX "Article_category_idx" ON "Article"("category");
CREATE INDEX "Article_isActive_idx" ON "Article"("isActive");
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

ALTER TABLE "SiteSettings" ADD COLUMN "enamadHtml" TEXT NOT NULL DEFAULT '',
ADD COLUMN "samandehiHtml" TEXT NOT NULL DEFAULT '',
ADD COLUMN "asnafHtml" TEXT NOT NULL DEFAULT '';
