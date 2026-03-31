-- CreateTable
CREATE TABLE "LaunchProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "kaloUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'importing',
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "productId" TEXT,
    "rawProductData" TEXT,
    "adData" TEXT,
    "adAnalysis" TEXT,
    "competitorData" TEXT,
    "pricingResult" TEXT,
    "websiteCopy" TEXT,
    "adCopy" TEXT,
    "themePresetId" TEXT,
    "themeZipPath" TEXT,
    "errorLog" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LaunchProject_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LaunchProject_themePresetId_fkey" FOREIGN KEY ("themePresetId") REFERENCES "ThemePreset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
