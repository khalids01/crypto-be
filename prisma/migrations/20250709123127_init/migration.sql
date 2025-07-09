-- CreateTable
CREATE TABLE "CoinData" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "coinName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arbitrage" (
    "id" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "coinSymbol" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "coinDataId" TEXT,

    CONSTRAINT "Arbitrage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketSnapshot" (
    "id" TEXT NOT NULL,
    "openTime" TIMESTAMP(3) NOT NULL,
    "closeTime" TIMESTAMP(3) NOT NULL,
    "rawJson" JSONB,
    "parsedJson" JSONB,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION,
    "quoteVolume" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "arbitrageId" TEXT,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoinData_symbol_key" ON "CoinData"("symbol");

-- CreateIndex
CREATE INDEX "Arbitrage_exchange_coinSymbol_idx" ON "Arbitrage"("exchange", "coinSymbol");

-- CreateIndex
CREATE UNIQUE INDEX "Arbitrage_exchange_coinDataId_key" ON "Arbitrage"("exchange", "coinDataId");

-- CreateIndex
CREATE INDEX "MarketSnapshot_arbitrageId_idx" ON "MarketSnapshot"("arbitrageId");

-- AddForeignKey
ALTER TABLE "Arbitrage" ADD CONSTRAINT "Arbitrage_coinDataId_fkey" FOREIGN KEY ("coinDataId") REFERENCES "CoinData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketSnapshot" ADD CONSTRAINT "MarketSnapshot_arbitrageId_fkey" FOREIGN KEY ("arbitrageId") REFERENCES "Arbitrage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
