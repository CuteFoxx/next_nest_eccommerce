-- CreateEnum
CREATE TYPE "MenuItemType" AS ENUM ('CATEGORY', 'FILTER', 'LINK');

-- AlterEnum
ALTER TYPE "FilePurpose" ADD VALUE 'MENU_IMAGE';

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "type" "MenuItemType" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "parentId" INTEGER,
    "categoryId" INTEGER,
    "filterUrl" TEXT,
    "url" TEXT,
    "imageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuItem_parentId_position_idx" ON "MenuItem"("parentId", "position");

-- CreateIndex
CREATE INDEX "MenuItem_categoryId_idx" ON "MenuItem"("categoryId");

-- CreateIndex
CREATE INDEX "MenuItem_imageId_idx" ON "MenuItem"("imageId");

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
