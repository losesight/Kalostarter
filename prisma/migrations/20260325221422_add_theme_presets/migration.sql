-- CreateTable
CREATE TABLE "ThemePreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "colors" TEXT NOT NULL,
    "typography" TEXT NOT NULL,
    "sections" TEXT NOT NULL,
    "badges" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "compareAtPrice" REAL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "category" TEXT,
    "variants" TEXT NOT NULL DEFAULT '[]',
    "images" TEXT NOT NULL DEFAULT '[]',
    "source" TEXT NOT NULL DEFAULT 'kalodata.com',
    "kaloSourceUrl" TEXT,
    "shopifyProductId" TEXT,
    "syncedAt" DATETIME,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiTitle" TEXT,
    "aiDescription" TEXT,
    "aiBullets" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "importJobId" TEXT,
    "themePresetId" TEXT,
    CONSTRAINT "Product_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "ImportJob" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_themePresetId_fkey" FOREIGN KEY ("themePresetId") REFERENCES "ThemePreset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("aiBullets", "aiDescription", "aiGenerated", "aiTitle", "category", "compareAtPrice", "createdAt", "description", "id", "images", "importJobId", "kaloSourceUrl", "price", "seoDescription", "seoTitle", "shopifyProductId", "source", "status", "syncedAt", "title", "updatedAt", "variants") SELECT "aiBullets", "aiDescription", "aiGenerated", "aiTitle", "category", "compareAtPrice", "createdAt", "description", "id", "images", "importJobId", "kaloSourceUrl", "price", "seoDescription", "seoTitle", "shopifyProductId", "source", "status", "syncedAt", "title", "updatedAt", "variants" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ThemePreset_slug_key" ON "ThemePreset"("slug");
