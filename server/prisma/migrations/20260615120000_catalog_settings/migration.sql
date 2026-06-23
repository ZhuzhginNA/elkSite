CREATE TABLE "CatalogSettings" (
    "id" TEXT NOT NULL DEFAULT 'catalog',
    "draftContent" JSONB NOT NULL,
    "publishedContent" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "CatalogSettings_pkey" PRIMARY KEY ("id")
);
