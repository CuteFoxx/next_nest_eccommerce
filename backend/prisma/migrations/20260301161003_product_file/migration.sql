-- CreateTable
CREATE TABLE "ProductFile" (
    "productId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductFile_pkey" PRIMARY KEY ("productId","fileId")
);

-- CreateIndex
CREATE INDEX "ProductFile_productId_position_idx" ON "ProductFile"("productId", "position");

-- CreateIndex
CREATE INDEX "ProductFile_fileId_idx" ON "ProductFile"("fileId");

-- AddForeignKey
ALTER TABLE "ProductFile" ADD CONSTRAINT "ProductFile_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductFile" ADD CONSTRAINT "ProductFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
