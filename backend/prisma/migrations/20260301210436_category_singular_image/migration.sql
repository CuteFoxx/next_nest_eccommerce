/*
  Warnings:

  - You are about to drop the `_CategoryIcon` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CategoryIcon" DROP CONSTRAINT "_CategoryIcon_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryIcon" DROP CONSTRAINT "_CategoryIcon_B_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "imageId" INTEGER;

-- DropTable
DROP TABLE "_CategoryIcon";

-- CreateIndex
CREATE INDEX "Category_imageId_idx" ON "Category"("imageId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
