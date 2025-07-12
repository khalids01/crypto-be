/*
  Warnings:

  - A unique constraint covering the columns `[openTime,exchangeId]` on the table `MarketSnapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MarketSnapshot_openTime_exchangeId_key" ON "MarketSnapshot"("openTime", "exchangeId");
