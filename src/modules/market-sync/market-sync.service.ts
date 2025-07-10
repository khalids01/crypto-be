import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { platforms, symbols } from '@/lib/tracking-data';
import { binanceApi } from '@/lib/binance/api';
import { endpoints } from '@/lib/binance/endpoints';
import { parseKlines } from '@/lib/binance/util';
import { kucoinApi, kuCoinFetchLatestKline } from '@/lib/kucoin/api';
import { parseKucoinKlines } from '@/lib/kucoin/util';

@Injectable()
export class MarketSyncService {
  private readonly logger = new Logger(MarketSyncService.name);
  private readonly UPDATE_INTERVAL_MS = 60_000; // 60 seconds
  private readonly CLEANUP_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours
  private updateIntervalId: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    this.startDataCollection();
  }

  private startDataCollection() {
    // Initial fetch
    this.fetchAndStoreData().catch((err) => {
      this.logger.error('Initial data fetch failed', err);
    });

    // Set up interval for subsequent fetches
    this.updateIntervalId = setInterval(() => {
      this.fetchAndStoreData().catch((err) => {
        this.logger.error('Scheduled data fetch failed', err);
      });
      this.kuCoinData().catch((err) => {
        this.logger.error('Scheduled data fetch failed', err);
      });
    }, this.UPDATE_INTERVAL_MS);

    // Store the interval in the scheduler registry for proper cleanup
    this.schedulerRegistry.addInterval(
      'binanceDataFetch',
      this.updateIntervalId,
    );
  }

  private async fetchAndStoreData() {
    try {
      const symbol = symbols.BTCUSDC;
      const interval = '1m';
      const limit = 12; // Get only the latest data point

      const binanceTicker = await binanceApi(endpoints.kline, {
        params: { symbol, interval, limit },
      });

      const parsedData = parseKlines(binanceTicker);

      if (parsedData) {
        let coinData = await this.prisma.coinData.findUnique({
          where: {
            symbol,
          },
        });
        if (!coinData) {
          coinData = await this.prisma.coinData.create({
            data: {
              symbol,
              coinName: symbol,
            },
          });
        }
        let exchange = await this.prisma.exchange.findUnique({
          where: {
            exchange_coinDataId: {
              exchange: platforms.binance,
              coinDataId: coinData.id,
            },
          },
        });
        if (!exchange) {
          exchange = await this.prisma.exchange.create({
            data: {
              exchange: platforms.binance,
              coinSymbol: symbol,
              coinDataId: coinData.id,
            },
          });
        }

        await this.prisma.marketSnapshot.createMany({
          data: parsedData.map(
            ({ openTime, closeTime, high, low, open, close, volume }) => ({
              exchangeId: exchange.id,
              openTime,
              closeTime,
              open,
              high,
              low,
              close,
              volume,
            }),
          ),
        });
        // Store the data in the database using upsert to avoid duplicates

        this.logger.log(
          `Successfully updated market data for ${symbol} at ${new Date().toISOString()}`,
        );

        await this.cleanupOldSnapshots(exchange.id);
      }
    } catch (error) {
      this.logger.error('Error in fetchAndStoreData:', error);
      throw error; // Re-throw to be caught by the caller
    }
  }

  private async kuCoinData() {
    const symbol = symbols.BTCUSDC;
    const limit = 12;
    const interval = '1min';
    const kucoinTicker = await kuCoinFetchLatestKline({
      symbol: 'BTC-USDT',
      interval,
      lookbackSeconds: limit,
    });
    const parsedData = parseKucoinKlines(kucoinTicker);

    if (parsedData) {
      let coinData = await this.prisma.coinData.findUnique({
        where: {
          symbol,
        },
      });
      if (!coinData) {
        coinData = await this.prisma.coinData.create({
          data: {
            symbol,
            coinName: symbol,
          },
        });
      }
      let exchange = await this.prisma.exchange.findUnique({
        where: {
          exchange_coinDataId: {
            exchange: platforms.kucoin,
            coinDataId: coinData.id,
          },
        },
      });
      if (!exchange) {
        exchange = await this.prisma.exchange.create({
          data: {
            exchange: platforms.kucoin,
            coinSymbol: symbol,
            coinDataId: coinData.id,
            color: "#1CA4B6"
          },
        });
      }

      await this.prisma.marketSnapshot.createMany({
        data: parsedData.map(
          ({ openTime, high, low, open, close, volume }) => ({
            exchangeId: exchange.id,
            openTime,
            closeTime: new Date(openTime.getTime() + 600),
            open,
            high,
            low,
            close,
            volume,
          }),
        ),
      });
      // Store the data in the database using upsert to avoid duplicates

      this.logger.log(
        `Successfully updated market data for ${symbol} at ${new Date().toISOString()}`,
      );

      await this.cleanupOldSnapshots(exchange.id);
    }
  }

  async cleanupOldSnapshots(exchangeId: string) {
    const cutoff = new Date(Date.now() - this.CLEANUP_INTERVAL_MS);

    const deleted = await this.prisma.marketSnapshot.deleteMany({
      where: {
        exchangeId,
        openTime: { lt: cutoff },
      },
    });

    console.log(
      `🧹 Cleanup complete: deleted ${deleted.count} snapshots older than 2 hours for exchangeId: ${exchangeId}`,
    );
  }
}
