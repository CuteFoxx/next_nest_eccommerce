/*
  Warnings:

  - You are about to drop the column `filterUrl` on the `MenuItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "filterUrl";

-- CreateTable
CREATE TABLE "MenuItemFilterValue" (
    "menuItemId" INTEGER NOT NULL,
    "attributeValueId" INTEGER NOT NULL,

    CONSTRAINT "MenuItemFilterValue_pkey" PRIMARY KEY ("menuItemId","attributeValueId")
);

-- CreateIndex
CREATE INDEX "MenuItemFilterValue_attributeValueId_idx" ON "MenuItemFilterValue"("attributeValueId");

-- AddForeignKey
ALTER TABLE "MenuItemFilterValue" ADD CONSTRAINT "MenuItemFilterValue_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemFilterValue" ADD CONSTRAINT "MenuItemFilterValue_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "AttributeValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
