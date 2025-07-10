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
CREATE TABLE "Exchange" (
    "id" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "coinSymbol" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#8884d8',
    "coinDataId" TEXT,

    CONSTRAINT "Exchange_pkey" PRIMARY KEY ("id")
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
    "exchangeId" TEXT,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoinData_symbol_key" ON "CoinData"("symbol");

-- CreateIndex
CREATE INDEX "Exchange_exchange_coinSymbol_idx" ON "Exchange"("exchange", "coinSymbol");

-- CreateIndex
CREATE UNIQUE INDEX "Exchange_exchange_coinDataId_key" ON "Exchange"("exchange", "coinDataId");

-- CreateIndex
CREATE INDEX "MarketSnapshot_exchangeId_idx" ON "MarketSnapshot"("exchangeId");

-- AddForeignKey
ALTER TABLE "Exchange" ADD CONSTRAINT "Exchange_coinDataId_fkey" FOREIGN KEY ("coinDataId") REFERENCES "CoinData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketSnapshot" ADD CONSTRAINT "MarketSnapshot_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("id") ON DELETE SET NULL ON UPDATE CASCADE;
