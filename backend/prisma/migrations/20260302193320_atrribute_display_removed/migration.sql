/*
  Warnings:

  - You are about to drop the column `displayType` on the `Attribute` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attribute" DROP COLUMN "displayType";

-- DropEnum
DROP TYPE "AttributeDisplayType";
